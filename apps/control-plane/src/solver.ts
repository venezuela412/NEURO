import { addAdminLog } from "./repository";
import { isCompoundProfitable, GAS_COSTS, TONSTAKERS_POOL_ADDRESS } from "@neuro/shared";

const VAULT_ADDRESS = process.env.NEURO_VAULT_ADDRESS ?? "";
const TONAPI_ENDPOINT = "https://tonapi.io/v2";

interface VaultOnChainState {
  totalAssets: number; // nanoTON
  totalSupply: number; // nanoTON
  tvlTon: number;
}

interface StrategyHealth {
  tonstakersApy: number | null;
  vaultTvlTon: number;
  isCompoundProfitable: boolean;
  estimatedYieldTon: number;
  compoundCostTon: number;
  lastChecked: string;
  strategyAllocation: StrategyAllocation[];
}

interface StrategyAllocation {
  protocol: string;
  weight: number;
  address: string;
  currentApy: number | null;
  status: "active" | "pending-whitelist" | "future";
}

async function fetchVaultTvlFromChain(): Promise<VaultOnChainState | null> {
  if (!VAULT_ADDRESS) {
    return null;
  }

  try {
    const tonApiKey = process.env.VITE_TONAPI_KEY;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tonApiKey) {
      headers["Authorization"] = `Bearer ${tonApiKey}`;
    }

    const response = await fetch(
      `${TONAPI_ENDPOINT}/blockchain/accounts/${VAULT_ADDRESS}/methods/tvl`,
      {
        headers,
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      await addAdminLog("warn", "solver", `TonAPI tvl getter failed: HTTP ${response.status}`);
      return null;
    }

    const data = (await response.json()) as {
      success: boolean;
      stack?: Array<{ type: string; num?: string; value?: string }>;
    };

    if (!data.success || !data.stack?.length) {
      return null;
    }

    const tvlEntry = data.stack[0];
    const tvlNano = parseInt(tvlEntry.num ?? tvlEntry.value ?? "0", 16);

    return {
      totalAssets: tvlNano,
      totalSupply: 0,
      tvlTon: tvlNano / 1e9,
    };
  } catch (error) {
    await addAdminLog("error", "solver", `Failed to fetch vault TVL: ${error instanceof Error ? error.message : "unknown"}`);
    return null;
  }
}

async function fetchTonstakersApy(): Promise<number | null> {
  try {
    const tonApiKey = process.env.VITE_TONAPI_KEY;
    const headers: Record<string, string> = {};
    if (tonApiKey) {
      headers["Authorization"] = `Bearer ${tonApiKey}`;
    }

    const response = await fetch(`${TONAPI_ENDPOINT}/staking/pools`, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      implementations?: Record<string, { pools?: Array<{ apy: number; name?: string }> }>;
    };

    if (data.implementations) {
      for (const impl of Object.values(data.implementations)) {
        const pool = impl.pools?.find(
          (p) => p.name?.toLowerCase().includes("tonstakers") || p.apy > 0
        );
        if (pool) {
          return pool.apy;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

// V11 APEX Omni-Chain Solver — Production Implementation with Dynamic Fees
export const OmniChainSolver = {
  /** Cached APY for frontend use */
  _lastKnownApy: null as number | null,
  _lastKnownTvl: 0,

  /** Get the last known APY (for use by API endpoints without re-fetching) */
  getLastKnownApy(): number | null {
    return this._lastKnownApy;
  },

  /** Compute vault profit with dynamic profitability check */
  async computeAutoCompoundForVault(): Promise<{
    profitToMint: number;
    tvlTon: number;
    apyEstimate: number | null;
    isProfitable: boolean;
    costEstimateTon: number;
  }> {
    const onChainState = await fetchVaultTvlFromChain();
    const currentApy = await fetchTonstakersApy();

    // Cache for other uses
    this._lastKnownApy = currentApy;
    this._lastKnownTvl = onChainState?.tvlTon ?? 0;

    if (!onChainState || onChainState.totalAssets === 0) {
      await addAdminLog("info", "solver", "Vault TVL is zero or unavailable — skipping compound cycle");
      return { profitToMint: 0, tvlTon: 0, apyEstimate: currentApy, isProfitable: false, costEstimateTon: 0 };
    }

    // Calculate estimated profit since last compound (6h cycle = 1/1460 of annual)
    const annualRate = currentApy ?? 0.05;
    const sixHourRate = annualRate / 1460;
    const estimatedProfit = Math.floor(onChainState.totalAssets * sixHourRate);
    const estimatedProfitTon = estimatedProfit / 1e9;

    // Dynamic profitability check — don't compound if yield < cost
    const compoundCostTon = GAS_COSTS.compound_cycle;
    const profitable = isCompoundProfitable(estimatedProfitTon, onChainState.tvlTon, "tonstakers");

    await addAdminLog("info", "solver",
      `Compound check: TVL=${onChainState.tvlTon.toFixed(2)} TON, ` +
      `APY=${(annualRate * 100).toFixed(2)}%, ` +
      `yield=${estimatedProfitTon.toFixed(4)} TON, ` +
      `cost=${compoundCostTon} TON, ` +
      `profitable=${profitable}`
    );

    return {
      profitToMint: profitable ? estimatedProfit : 0,
      tvlTon: onChainState.tvlTon,
      apyEstimate: currentApy,
      isProfitable: profitable,
      costEstimateTon: compoundCostTon,
    };
  },

  /** Dynamic strategy allocation based on live metrics */
  async computeRebalancePaths(): Promise<StrategyAllocation[]> {
    const tonstakersApy = await fetchTonstakersApy();
    this._lastKnownApy = tonstakersApy;

    return [
      {
        protocol: "Tonstakers",
        weight: 1.0, // 100% for now — only real working strategy
        address: TONSTAKERS_POOL_ADDRESS,
        currentApy: tonstakersApy,
        status: "active",
      },
      {
        protocol: "STON.fi LP",
        weight: 0,
        address: "STON_ROUTER_DYNAMIC",
        currentApy: null,
        status: "future",
      },
      {
        protocol: "DeDust",
        weight: 0,
        address: "EQBfBWT7X2BHg9tXAxzhz2aKiNTU1tpt5NsiK0uSDW_YAJ67",
        currentApy: null,
        status: "future",
      },
    ];
  },

  /** Full strategy health assessment for admin dashboard */
  async evaluateStrategyHealth(): Promise<StrategyHealth> {
    const compound = await this.computeAutoCompoundForVault();
    const allocation = await this.computeRebalancePaths();

    return {
      tonstakersApy: compound.apyEstimate,
      vaultTvlTon: compound.tvlTon,
      isCompoundProfitable: compound.isProfitable,
      estimatedYieldTon: compound.profitToMint / 1e9,
      compoundCostTon: compound.costEstimateTon,
      lastChecked: new Date().toISOString(),
      strategyAllocation: allocation,
    };
  },
};
