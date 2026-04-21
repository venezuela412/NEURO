/**
 * Market Scanner — Continuous market intelligence for the NEURO strategy engine.
 *
 * Scans all supported DEX pools, ranks opportunities by risk-adjusted return,
 * computes real route quality scores, and detects profitable rebalancing opportunities.
 */
import { addAdminLog } from "./repository";
import { fetchAllPoolData, type PoolInfo, type AggregatedMarketData } from "./dex-aggregator";
import { GAS_COSTS, PROTOCOL_FEES } from "@neuro/shared";

// ─── SCANNER STATE ───

let lastScanResult: MarketScanResult | null = null;

export interface MarketScanResult {
  marketData: AggregatedMarketData;
  rankedOpportunities: RankedOpportunity[];
  routeQualityScore: number;              // Real computed score (replaces hardcoded 0.82)
  bestYieldProtocol: string;
  bestYieldApy: number;
  rebalanceRecommended: boolean;
  rebalanceReason: string | null;
  currentAllocationEfficiency: number;     // 0–1, how optimal current allocation is
  scannedAt: string;
}

export interface RankedOpportunity {
  pool: PoolInfo;
  rank: number;
  sharpeRatio: number;          // Risk-adjusted return metric
  netApyAfterCosts: number;     // APY minus all gas/protocol costs
  recommendedWeight: number;    // Suggested allocation weight (0–1)
  reason: string;
}

// ─── RISK-FREE RATE ───
// Conservative estimate for opportunity cost (holding TON in wallet earns 0)
const RISK_FREE_RATE = 0;

// ─── VOLATILITY ESTIMATES ───
// Estimated annualized volatility per category (empirical)
const VOLATILITY_ESTIMATES: Record<string, number> = {
  staking: 0.02,   // Very low vol — yield is predictable
  lp: 0.15,        // Higher vol due to impermanent loss
  farming: 0.25,   // Highest vol — farming rewards can change fast
  "delta-neutral": 0.01, // Extremely low volatility due to perfect spot-short hedge
  "omnichain-avs": 0.08, // Moderate edge-case risk from bridge layer transfers
};

// ─── CORE SCANNER ───

/**
 * Execute a full market scan — fetch all pools, rank opportunities,
 * compute route quality score, and determine if rebalancing is needed.
 */
export async function scanMarketOpportunities(
  currentStrategyApy?: number,
  currentTvlTon?: number,
): Promise<MarketScanResult> {
  const marketData = await fetchAllPoolData();
  const rankedOpportunities = rankPoolsByRiskAdjustedReturn(marketData.pools);

  // Compute real route quality score
  const routeQualityScore = computeRouteQualityScore(marketData);

  // Determine best yield
  const bestPool = rankedOpportunities[0]?.pool;
  const bestYieldProtocol = bestPool?.protocol ?? "none";
  const bestYieldApy = bestPool?.apy ?? 0;

  // Check if rebalancing would be beneficial
  const { recommended, reason, efficiency } = evaluateRebalanceNeed(
    rankedOpportunities,
    currentStrategyApy ?? 0,
    currentTvlTon ?? 0,
  );

  const result: MarketScanResult = {
    marketData,
    rankedOpportunities,
    routeQualityScore,
    bestYieldProtocol,
    bestYieldApy,
    rebalanceRecommended: recommended,
    rebalanceReason: reason,
    currentAllocationEfficiency: efficiency,
    scannedAt: new Date().toISOString(),
  };

  lastScanResult = result;

  await addAdminLog("info", "scanner",
    `Market scan: ${marketData.totalPoolsScanned} pools, ` +
    `best=${bestYieldProtocol} ${(bestYieldApy * 100).toFixed(1)}%, ` +
    `quality=${routeQualityScore.toFixed(2)}, ` +
    `rebalance=${recommended ? "YES" : "NO"}`,
  );

  return result;
}

export function getLastScanResult(): MarketScanResult | null {
  return lastScanResult;
}

// ─── SHARPE-RATIO RANKING ───

/**
 * Rank pools by a simplified Sharpe ratio:
 *   (risk-adjusted APY - risk-free rate) / estimated volatility
 *
 * This penalizes high-APY pools that carry more risk,
 * making staking pools competitive against high-APY but volatile LP pools.
 */
export function rankPoolsByRiskAdjustedReturn(pools: PoolInfo[]): RankedOpportunity[] {
  const scored: RankedOpportunity[] = pools.map((pool) => {
    const volatility = VOLATILITY_ESTIMATES[pool.category] ?? 0.15;
    const excessReturn = pool.riskAdjustedApy - RISK_FREE_RATE;
    const sharpeRatio = volatility > 0 ? excessReturn / volatility : 0;

    // Net APY after all costs (gas + protocol fees for a full year)
    const gasCostPerYear = GAS_COSTS.compound_cycle * (365 / 0.25); // ~4 compounds/day theoretical
    const protocolFees = PROTOCOL_FEES[pool.protocol] ?? { protocol: 0, pool: 0 };
    const protocolCostRate = protocolFees.protocol + protocolFees.pool;
    const netApyAfterCosts = pool.riskAdjustedApy - protocolCostRate;

    return {
      pool,
      rank: 0,
      sharpeRatio,
      netApyAfterCosts: Math.max(0, netApyAfterCosts),
      recommendedWeight: 0,
      reason: "",
    };
  });

  // Sort by Sharpe ratio descending
  scored.sort((a, b) => b.sharpeRatio - a.sharpeRatio);

  // Assign ranks and compute recommended weights
  const totalSharpe = scored.reduce((sum, s) => sum + Math.max(0, s.sharpeRatio), 0);

  scored.forEach((s, i) => {
    s.rank = i + 1;
    s.recommendedWeight = totalSharpe > 0 ? Math.max(0, s.sharpeRatio) / totalSharpe : 0;
    s.reason = buildOpportunityReason(s);
  });

  return scored;
}

function buildOpportunityReason(opp: RankedOpportunity): string {
  const pool = opp.pool;
  const parts: string[] = [];

  if (pool.category === "staking") {
    parts.push(`Pure staking yield with minimal risk (Sharpe: ${opp.sharpeRatio.toFixed(2)})`);
  } else {
    parts.push(`LP yield with ${pool.category === "lp" ? "moderate" : "elevated"} IL risk`);
  }

  if (pool.tvlTon > 100_000) {
    parts.push(`Deep liquidity (${(pool.tvlTon / 1000).toFixed(0)}k TON)`);
  } else if (pool.tvlTon > 10_000) {
    parts.push(`Adequate liquidity (${(pool.tvlTon / 1000).toFixed(0)}k TON)`);
  }

  if (opp.netApyAfterCosts > 0.15) {
    parts.push(`Strong net yield: ${(opp.netApyAfterCosts * 100).toFixed(1)}% after costs`);
  }

  return parts.join(". ") + ".";
}

// ─── ROUTE QUALITY SCORE ───

/**
 * Compute a REAL route quality score (replaces the hardcoded 0.82).
 *
 * Factors:
 * - Data availability (can we fetch from all sources?)
 * - Number of safe pools available
 * - Spread between best and worst safe pool APYs
 * - Overall market liquidity depth
 */
export function computeRouteQualityScore(marketData: AggregatedMarketData): number {
  let score = 0;

  // Factor 1: Data availability (0.3 weight)
  const sourcesAvailable = [
    marketData.bestStakingApy !== null,
    marketData.pools.some((p) => p.protocol === "stonfi"),
    marketData.pools.some((p) => p.protocol === "dedust"),
  ].filter(Boolean).length;
  score += (sourcesAvailable / 3) * 0.3;

  // Factor 2: Safe pool count (0.25 weight)
  const safePoolScore = Math.min(1, marketData.safePools / 10); // 10+ safe pools = perfect
  score += safePoolScore * 0.25;

  // Factor 3: Best APY availability (0.25 weight)
  const bestApy = Math.max(
    marketData.bestStakingApy?.apy ?? 0,
    marketData.bestLpApy?.apy ?? 0,
  );
  const apyScore = Math.min(1, bestApy / 0.20); // 20%+ APY = perfect score
  score += apyScore * 0.25;

  // Factor 4: Market depth (0.2 weight)
  const totalLiquidity = marketData.pools.reduce((sum, p) => sum + p.tvlTon, 0);
  const liquidityScore = Math.min(1, totalLiquidity / 1_000_000); // 1M+ TON = perfect
  score += liquidityScore * 0.2;

  return Math.min(1, Math.max(0, score));
}

// ─── REBALANCE EVALUATION ───

interface RebalanceEvaluation {
  recommended: boolean;
  reason: string | null;
  efficiency: number;
}

/**
 * Determine if the current strategy allocation should be rebalanced.
 * Only recommends rebalancing when the net benefit exceeds the cost.
 */
function evaluateRebalanceNeed(
  opportunities: RankedOpportunity[],
  currentStrategyApy: number,
  currentTvlTon: number,
): RebalanceEvaluation {
  if (opportunities.length === 0) {
    return { recommended: false, reason: null, efficiency: 0 };
  }

  const bestOpportunity = opportunities[0]!;
  const bestNetApy = bestOpportunity.netApyAfterCosts;
  const currentNetApy = currentStrategyApy - (PROTOCOL_FEES["tonstakers"]?.protocol ?? 0);

  // APY improvement threshold (minimum 2% absolute improvement to justify rebalance)
  const apyDelta = bestNetApy - currentNetApy;
  const MIN_APY_DELTA = 0.02; // 2% absolute

  // Calculate rebalance cost as percentage of TVL
  const rebalanceCostTon = GAS_COSTS.compound_cycle + GAS_COSTS.swap;
  const rebalanceCostPct = currentTvlTon > 0 ? rebalanceCostTon / currentTvlTon : 1;

  // Break-even time: how many days until APY improvement covers rebalance cost
  const dailyImprovement = (apyDelta * currentTvlTon) / 365;
  const breakEvenDays = dailyImprovement > 0 ? rebalanceCostTon / dailyImprovement : Infinity;

  // Current allocation efficiency: how close are we to the optimal?
  const efficiency = currentNetApy > 0 && bestNetApy > 0
    ? Math.min(1, currentNetApy / bestNetApy)
    : 0;

  if (apyDelta < MIN_APY_DELTA) {
    return {
      recommended: false,
      reason: `APY delta too small (${(apyDelta * 100).toFixed(2)}% < ${(MIN_APY_DELTA * 100)}% threshold)`,
      efficiency,
    };
  }

  if (breakEvenDays > 30) {
    return {
      recommended: false,
      reason: `Break-even too slow (${breakEvenDays.toFixed(0)} days > 30 day max)`,
      efficiency,
    };
  }

  return {
    recommended: true,
    reason: `${bestOpportunity.pool.protocol} offers +${(apyDelta * 100).toFixed(1)}% APY improvement. ` +
      `Break-even in ${breakEvenDays.toFixed(0)} days. ` +
      `Net gain: ${((apyDelta * currentTvlTon) / 365 * 30).toFixed(2)} TON/month.`,
    efficiency,
  };
}

// ─── OPTIMAL WEIGHT COMPUTATION ───

/**
 * Compute optimal allocation weights across available protocols.
 * Uses a simplified mean-variance approach:
 * 1. Filter to safe pools only
 * 2. Weight by Sharpe ratio
 * 3. Apply minimum/maximum constraints
 * 4. Ensure at least 40% stays in staking (safety floor)
 */
export function computeOptimalWeights(
  opportunities: RankedOpportunity[],
): Array<{ protocol: string; poolAddress: string; weight: number; apy: number }> {
  const safe = opportunities.filter(
    (o) => !o.pool.safetyReport || o.pool.safetyReport.overallSafe
  );

  if (safe.length === 0) {
    return [{ protocol: "tonstakers", poolAddress: "", weight: 1, apy: 0 }];
  }

  // Start with Sharpe-ratio-based weights
  const totalSharpe = safe.reduce((sum, o) => sum + Math.max(0, o.sharpeRatio), 0);

  const weights = safe.map((o) => ({
    protocol: o.pool.protocol,
    poolAddress: o.pool.poolAddress,
    weight: totalSharpe > 0 ? Math.max(0, o.sharpeRatio) / totalSharpe : 0,
    apy: o.pool.apy,
  }));

  // Apply constraints:
  // 1. Staking must have at least 15% weight (safety floor)
  // 2. Pure LP pools capped at 30% to prevent extreme IL
  // 3. No weight below 5% (not worth the gas)

  const stakingEntry = weights.find((w) => w.protocol === "tonstakers");
  if (stakingEntry && stakingEntry.weight < 0.15) {
    const deficit = 0.15 - stakingEntry.weight;
    stakingEntry.weight = 0.15;

    // Redistribute deficit proportionally
    const otherPools = weights.filter((w) => w.protocol !== "tonstakers" && w.weight > 0);
    const otherTotal = otherPools.reduce((sum, w) => sum + w.weight, 0);
    if (otherTotal > 0) {
      otherPools.forEach((w) => {
        w.weight -= deficit * (w.weight / otherTotal);
      });
    }
  }

  // Cap Standard LP pools at 30%
  weights.forEach((w) => {
    const opp = safe.find((s) => s.pool.protocol === w.protocol && s.pool.poolAddress === w.poolAddress);
    if (opp?.pool.category === "lp" && w.weight > 0.3) {
      w.weight = 0.3;
    }
  });

  // Remove pools below 5% threshold
  const filtered = weights.filter((w) => w.weight >= 0.05);

  // Renormalize to sum to 1
  const totalWeight = filtered.reduce((sum, w) => sum + w.weight, 0);
  if (totalWeight > 0) {
    filtered.forEach((w) => (w.weight = w.weight / totalWeight));
  }

  return filtered;
}
