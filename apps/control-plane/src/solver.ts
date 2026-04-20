/**
 * V12 APEX Omni-Chain Solver — Production Implementation
 *
 * Complete rewrite with:
 * - Multi-source APY aggregation (Tonstakers + STON.fi + DeDust)
 * - Dynamic weight optimization (replaces hardcoded [1, 0, 0])
 * - Risk-adjusted returns with Sharpe-ratio ranking
 * - Profitability-aware compounding with safety gates
 * - Real route quality scores (replaces hardcoded 0.82)
 * - Market scanner integration for continuous opportunity detection
 */
import { addAdminLog } from "./repository";
import { isCompoundProfitable, GAS_COSTS, TONSTAKERS_POOL_ADDRESS } from "@neuro/shared";
import { fetchAllPoolData, type AggregatedMarketData, type PoolInfo } from "./dex-aggregator";
import {
  scanMarketOpportunities,
  getLastScanResult,
  computeOptimalWeights,
  computeRouteQualityScore,
  type MarketScanResult,
  type RankedOpportunity,
} from "./market-scanner";

const VAULT_ADDRESS = process.env.NEURO_VAULT_ADDRESS ?? "";
const TONAPI_ENDPOINT = "https://tonapi.io/v2";

// ─── TYPES ───

interface VaultOnChainState {
  totalAssets: number; // nanoTON
  totalSupply: number; // nanoTON
  tvlTon: number;
  idleTon: number;   // Unharvested/unstaked TON sitting in vault
  stakedTon: number;  // TON currently staked in Tonstakers (as tsTON)
}

interface StrategyHealth {
  tonstakersApy: number | null;
  bestOverallApy: number | null;
  bestOverallProtocol: string | null;
  vaultTvlTon: number;
  vaultIdleTon: number;
  vaultStakedTon: number;
  isCompoundProfitable: boolean;
  estimatedYieldTon: number;
  compoundCostTon: number;
  lastChecked: string;
  strategyAllocation: StrategyAllocation[];
  routeQualityScore: number;
  marketScanSummary: MarketScanSummary | null;
  rebalanceRecommended: boolean;
  rebalanceReason: string | null;
  allocationEfficiency: number;
}

interface StrategyAllocation {
  protocol: string;
  weight: number;
  address: string;
  currentApy: number | null;
  riskAdjustedApy: number | null;
  status: "active" | "pending-whitelist" | "future" | "blocked-unsafe";
}

interface MarketScanSummary {
  totalPoolsScanned: number;
  safePoolsFound: number;
  protocolsOnline: number;
  bestStakingApy: number | null;
  bestLpApy: number | null;
  scannedAt: string;
}

// ─── ON-CHAIN DATA FETCHERS ───

async function fetchVaultTvlFromChain(): Promise<VaultOnChainState | null> {
  if (!VAULT_ADDRESS) return null;

  try {
    const tonApiKey = process.env.VITE_TONAPI_KEY;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (tonApiKey) headers["Authorization"] = `Bearer ${tonApiKey}`;

    // Fetch vault TVL
    const response = await fetch(
      `${TONAPI_ENDPOINT}/blockchain/accounts/${VAULT_ADDRESS}/methods/tvl`,
      { headers, signal: AbortSignal.timeout(10000) },
    );

    if (!response.ok) {
      await addAdminLog("warn", "solver", `TonAPI tvl getter failed: HTTP ${response.status}`);
      return null;
    }

    const data = (await response.json()) as {
      success: boolean;
      stack?: Array<{ type: string; num?: string; value?: string }>;
    };

    if (!data.success || !data.stack?.length) return null;

    const tvlEntry = data.stack[0];
    const tvlNano = Number(tvlEntry!.num ?? tvlEntry!.value ?? "0");

    // Fetch vault's raw TON balance and tsTON balance for idle vs staked breakdown
    let rawBalanceTon = 0;
    let stakedTon = 0;

    try {
      const balResponse = await fetch(
        `${TONAPI_ENDPOINT}/accounts/${VAULT_ADDRESS}`,
        { headers, signal: AbortSignal.timeout(10000) },
      );
      if (balResponse.ok) {
        const balData = (await balResponse.json()) as { balance?: number };
        rawBalanceTon = (balData.balance ?? 0) / 1e9;
      }
    } catch { /* non-critical */ }

    try {
      // Check tsTON jetton balance
      const jetResponse = await fetch(
        `${TONAPI_ENDPOINT}/accounts/${VAULT_ADDRESS}/jettons`,
        { headers, signal: AbortSignal.timeout(10000) },
      );
      if (jetResponse.ok) {
        const jetData = (await jetResponse.json()) as {
          balances?: Array<{
            jetton: { symbol?: string };
            balance: string;
          }>;
        };
        const tsTon = jetData.balances?.find(
          (b) => b.jetton.symbol?.toLowerCase() === "tston",
        );
        stakedTon = tsTon ? Number(tsTon.balance) / 1e9 : 0;
      }
    } catch { /* non-critical */ }

    const tvlTon = tvlNano / 1e9;

    return {
      totalAssets: tvlNano,
      totalSupply: 0,
      tvlTon,
      idleTon: Math.max(0, rawBalanceTon - 0.5), // Keep 0.5 TON for gas
      stakedTon,
    };
  } catch (error) {
    await addAdminLog("error", "solver", `Failed to fetch vault TVL: ${error instanceof Error ? error.message : "unknown"}`);
    return null;
  }
}

// ─── V12 OMNI-CHAIN SOLVER ───

export const OmniChainSolver = {
  /** Cached state */
  _lastKnownApy: null as number | null,
  _lastKnownTvl: 0,
  _lastMarketData: null as AggregatedMarketData | null,
  _lastScanResult: null as MarketScanResult | null,

  /** Get the last known APY (for use by API endpoints without re-fetching) */
  getLastKnownApy(): number | null {
    return this._lastKnownApy;
  },

  /** Get last market data */
  getLastMarketData(): AggregatedMarketData | null {
    return this._lastMarketData;
  },

  /** Get last scan result */
  getLastScanResult(): MarketScanResult | null {
    return this._lastScanResult ?? getLastScanResult();
  },

  /** Compute vault profit with dynamic profitability check */
  async computeAutoCompoundForVault(): Promise<{
    profitToMint: number;
    tvlTon: number;
    idleTon: number;
    stakedTon: number;
    apyEstimate: number | null;
    isProfitable: boolean;
    costEstimateTon: number;
  }> {
    const onChainState = await fetchVaultTvlFromChain();

    // Get APY from market data if available, otherwise fetch directly
    let currentApy: number | null = null;
    const marketData = this._lastMarketData;

    if (marketData?.bestStakingApy) {
      currentApy = marketData.bestStakingApy.apy;
    } else {
      // Fallback: fetch Tonstakers APY directly
      const freshData = await fetchAllPoolData();
      this._lastMarketData = freshData;
      currentApy = freshData.bestStakingApy?.apy ?? null;
    }

    this._lastKnownApy = currentApy;
    this._lastKnownTvl = onChainState?.tvlTon ?? 0;

    if (!onChainState || onChainState.totalAssets === 0) {
      await addAdminLog("info", "solver", "Vault TVL is zero or unavailable — skipping compound cycle");
      return {
        profitToMint: 0, tvlTon: 0, idleTon: 0, stakedTon: 0,
        apyEstimate: currentApy, isProfitable: false, costEstimateTon: 0,
      };
    }

    // Calculate estimated profit since last compound (6h cycle = 1/1460 of annual)
    const annualRate = currentApy ?? 0.05;
    const sixHourRate = annualRate / 1460;
    const estimatedProfit = Math.floor(onChainState.totalAssets * sixHourRate);
    const estimatedProfitTon = estimatedProfit / 1e9;

    // Dynamic profitability check
    const compoundCostTon = GAS_COSTS.compound_cycle;
    const profitable = isCompoundProfitable(estimatedProfitTon, onChainState.tvlTon, "tonstakers");

    await addAdminLog("info", "solver",
      `Compound check: TVL=${onChainState.tvlTon.toFixed(2)} TON, ` +
      `idle=${onChainState.idleTon.toFixed(2)} TON, ` +
      `staked=${onChainState.stakedTon.toFixed(2)} TON, ` +
      `APY=${(annualRate * 100).toFixed(2)}%, ` +
      `yield=${estimatedProfitTon.toFixed(4)} TON, ` +
      `cost=${compoundCostTon} TON, profitable=${profitable}`,
    );

    return {
      profitToMint: profitable ? estimatedProfit : 0,
      tvlTon: onChainState.tvlTon,
      idleTon: onChainState.idleTon,
      stakedTon: onChainState.stakedTon,
      apyEstimate: currentApy,
      isProfitable: profitable,
      costEstimateTon: compoundCostTon,
    };
  },

  /** Dynamic strategy allocation based on LIVE multi-source market data */
  async computeRebalancePaths(): Promise<StrategyAllocation[]> {
    // Run market scan if we don't have recent data
    let scan = this._lastScanResult ?? getLastScanResult();
    if (!scan || Date.now() - new Date(scan.scannedAt).getTime() > 10 * 60 * 1000) {
      // Stale or missing — run fresh scan
      scan = await scanMarketOpportunities(
        this._lastKnownApy ?? undefined,
        this._lastKnownTvl,
      );
      this._lastScanResult = scan;
      this._lastMarketData = scan.marketData;
    }

    // Compute optimal weights from scan results
    const optimalWeights = computeOptimalWeights(scan.rankedOpportunities);

    // Build allocation list
    const allocations: StrategyAllocation[] = [];

    // Add weighted protocols
    for (const weight of optimalWeights) {
      const pool = scan.rankedOpportunities.find(
        (o) => o.pool.protocol === weight.protocol && o.pool.poolAddress === weight.poolAddress,
      );

      allocations.push({
        protocol: weight.protocol === "tonstakers" ? "Tonstakers" :
          weight.protocol === "stonfi" ? `STON.fi ${pool?.pool.poolName ?? "LP"}` :
          `DeDust ${pool?.pool.poolName ?? "LP"}`,
        weight: Number(weight.weight.toFixed(4)),
        address: weight.poolAddress || TONSTAKERS_POOL_ADDRESS,
        currentApy: weight.apy > 0 ? weight.apy : null,
        riskAdjustedApy: pool?.pool.riskAdjustedApy ?? null,
        status: weight.protocol === "tonstakers" ? "active" :
          pool?.pool.safetyReport?.overallSafe ? "pending-whitelist" : "blocked-unsafe",
      });
    }

    // Add future protocols not in the allocation
    if (!allocations.some((a) => a.protocol.includes("STON.fi"))) {
      const stonfiPool = scan.rankedOpportunities.find((o) => o.pool.protocol === "stonfi");
      allocations.push({
        protocol: "STON.fi LP",
        weight: 0,
        address: stonfiPool?.pool.poolAddress ?? "STON_ROUTER_DYNAMIC",
        currentApy: stonfiPool?.pool.apy ?? null,
        riskAdjustedApy: stonfiPool?.pool.riskAdjustedApy ?? null,
        status: "future",
      });
    }

    if (!allocations.some((a) => a.protocol.includes("DeDust"))) {
      const dedustPool = scan.rankedOpportunities.find((o) => o.pool.protocol === "dedust");
      allocations.push({
        protocol: "DeDust",
        weight: 0,
        address: dedustPool?.pool.poolAddress ?? "EQBfBWT7X2BHg9tXAxzhz2aKiNTU1tpt5NsiK0uSDW_YAJ67",
        currentApy: dedustPool?.pool.apy ?? null,
        riskAdjustedApy: dedustPool?.pool.riskAdjustedApy ?? null,
        status: "future",
      });
    }

    await addAdminLog("info", "solver",
      `Rebalance paths computed: ${allocations.length} strategies. ` +
      `Active: ${allocations.filter((a) => a.weight > 0).map((a) => `${a.protocol}=${(a.weight * 100).toFixed(0)}%`).join(", ")}`,
    );

    return allocations;
  },

  /** Full strategy health assessment for admin dashboard */
  async evaluateStrategyHealth(): Promise<StrategyHealth> {
    const compound = await this.computeAutoCompoundForVault();
    const allocation = await this.computeRebalancePaths();

    const scan = this._lastScanResult ?? getLastScanResult();
    const marketData = this._lastMarketData;

    // Build market scan summary
    let marketScanSummary: MarketScanSummary | null = null;
    if (scan) {
      marketScanSummary = {
        totalPoolsScanned: scan.marketData.totalPoolsScanned,
        safePoolsFound: scan.marketData.safePools,
        protocolsOnline: scan.marketData.totalProtocolsScanned,
        bestStakingApy: scan.marketData.bestStakingApy?.apy ?? null,
        bestLpApy: scan.marketData.bestLpApy?.apy ?? null,
        scannedAt: scan.scannedAt,
      };
    }

    // Compute real route quality score
    const routeQualityScore = marketData
      ? computeRouteQualityScore(marketData)
      : 0.5; // Degraded when no market data

    return {
      tonstakersApy: compound.apyEstimate,
      bestOverallApy: scan?.bestYieldApy ?? compound.apyEstimate,
      bestOverallProtocol: scan?.bestYieldProtocol ?? "tonstakers",
      vaultTvlTon: compound.tvlTon,
      vaultIdleTon: compound.idleTon,
      vaultStakedTon: compound.stakedTon,
      isCompoundProfitable: compound.isProfitable,
      estimatedYieldTon: compound.profitToMint / 1e9,
      compoundCostTon: compound.costEstimateTon,
      lastChecked: new Date().toISOString(),
      strategyAllocation: allocation,
      routeQualityScore,
      marketScanSummary,
      rebalanceRecommended: scan?.rebalanceRecommended ?? false,
      rebalanceReason: scan?.rebalanceReason ?? null,
      allocationEfficiency: scan?.currentAllocationEfficiency ?? 0,
    };
  },
};
