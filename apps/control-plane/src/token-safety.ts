/**
 * Token Safety Layer — Honeypot detection, whitelist enforcement, and pool risk assessment.
 * Prevents the strategy engine from interacting with malicious tokens or unsafe pools.
 */
import { addAdminLog } from "./repository";

// ─── APPROVED TOKEN REGISTRY ───
// Only tokens that have been manually verified are allowed in strategy operations.
// This is the FIRST line of defense — if a token isn't here, we don't touch it.

export interface ApprovedToken {
  symbol: string;
  name: string;
  address: string; // Jetton master address (raw format)
  decimals: number;
  category: "native" | "stablecoin" | "lst" | "lp";
  verifiedAt: string;
}

export const APPROVED_TOKENS: ApprovedToken[] = [
  {
    symbol: "TON",
    name: "Toncoin",
    address: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c", // Native
    decimals: 9,
    category: "native",
    verifiedAt: "2026-04-19",
  },
  {
    symbol: "tsTON",
    name: "Tonstakers Staked TON",
    address: "EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav", // Tonstakers tsTON jetton master
    decimals: 9,
    category: "lst",
    verifiedAt: "2026-04-19",
  },
  {
    symbol: "stTON",
    name: "Bemo Staked TON",
    address: "EQDNhy-nxYFgUqzfUzImBEP67JqsyMIcyk2S5_RwNNEYku0k", // Bemo stTON
    decimals: 9,
    category: "lst",
    verifiedAt: "2026-04-19",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs", // USDT on TON
    decimals: 6,
    category: "stablecoin",
    verifiedAt: "2026-04-19",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728", // USDC on TON (needs verification)
    decimals: 6,
    category: "stablecoin",
    verifiedAt: "2026-04-19",
  },
  {
    symbol: "jUSDT",
    name: "Bridged USDT (JVault)",
    address: "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA",
    decimals: 6,
    category: "stablecoin",
    verifiedAt: "2026-04-19",
  },
];

const APPROVED_ADDRESSES = new Set(APPROVED_TOKENS.map((t) => t.address.toLowerCase()));

// ─── TOKEN SAFETY CHECKS ───

export function isTokenApproved(jettonAddress: string): boolean {
  return APPROVED_ADDRESSES.has(jettonAddress.toLowerCase());
}

export function getApprovedToken(jettonAddress: string): ApprovedToken | null {
  return APPROVED_TOKENS.find((t) => t.address.toLowerCase() === jettonAddress.toLowerCase()) ?? null;
}

// ─── POOL SAFETY ASSESSMENT ───

export interface PoolSafetyReport {
  poolAddress: string;
  token0Approved: boolean;
  token1Approved: boolean;
  liquidityTon: number;
  liquiditySufficient: boolean; // > 10,000 TON
  poolAgeDays: number;
  poolAgeOk: boolean;          // > 7 days
  volume24hTon: number;
  volumeOk: boolean;           // > 100 TON daily
  overallSafe: boolean;
  riskScore: number;           // 0 = dangerous, 1 = very safe
  flags: string[];
}

const MIN_LIQUIDITY_TON = 10_000;    // Minimum pool TVL to consider safe
const MIN_POOL_AGE_DAYS = 7;          // Skip pools younger than 7 days
const MIN_VOLUME_24H_TON = 100;       // Minimum daily volume
const IDEAL_LIQUIDITY_TON = 100_000;  // Liquidity above this gets full score

export function checkPoolSafety(pool: {
  address: string;
  token0Address: string;
  token1Address: string;
  liquidityTon: number;
  poolAgeDays: number;
  volume24hTon: number;
}): PoolSafetyReport {
  const flags: string[] = [];
  let riskScore = 1.0;

  // Check 1: Token whitelist
  const token0Approved = isTokenApproved(pool.token0Address);
  const token1Approved = isTokenApproved(pool.token1Address);

  if (!token0Approved) {
    flags.push(`token0 (${pool.token0Address.slice(0, 10)}...) not in approved list`);
    riskScore -= 0.4;
  }
  if (!token1Approved) {
    flags.push(`token1 (${pool.token1Address.slice(0, 10)}...) not in approved list`);
    riskScore -= 0.4;
  }

  // Check 2: Liquidity depth
  const liquiditySufficient = pool.liquidityTon >= MIN_LIQUIDITY_TON;
  if (!liquiditySufficient) {
    flags.push(`Low liquidity: ${pool.liquidityTon.toFixed(0)} TON (min: ${MIN_LIQUIDITY_TON})`);
    riskScore -= 0.2;
  } else if (pool.liquidityTon < IDEAL_LIQUIDITY_TON) {
    // Partial score for liquidity between min and ideal
    const liquidityFactor = (pool.liquidityTon - MIN_LIQUIDITY_TON) / (IDEAL_LIQUIDITY_TON - MIN_LIQUIDITY_TON);
    riskScore -= 0.1 * (1 - liquidityFactor);
  }

  // Check 3: Pool age
  const poolAgeOk = pool.poolAgeDays >= MIN_POOL_AGE_DAYS;
  if (!poolAgeOk) {
    flags.push(`Pool too new: ${pool.poolAgeDays} days (min: ${MIN_POOL_AGE_DAYS})`);
    riskScore -= 0.3;
  }

  // Check 4: Volume
  const volumeOk = pool.volume24hTon >= MIN_VOLUME_24H_TON;
  if (!volumeOk) {
    flags.push(`Low volume: ${pool.volume24hTon.toFixed(0)} TON/24h (min: ${MIN_VOLUME_24H_TON})`);
    riskScore -= 0.1;
  }

  riskScore = Math.max(0, Math.min(1, riskScore));

  return {
    poolAddress: pool.address,
    token0Approved,
    token1Approved,
    liquidityTon: pool.liquidityTon,
    liquiditySufficient,
    poolAgeDays: pool.poolAgeDays,
    poolAgeOk,
    volume24hTon: pool.volume24hTon,
    volumeOk,
    overallSafe: riskScore >= 0.6 && token0Approved && token1Approved && liquiditySufficient && poolAgeOk,
    riskScore,
    flags,
  };
}

// ─── HONEYPOT DETECTION ───
// Simulates a potential swap to detect tokens with hidden transfer taxes.
// If the expected output doesn't match the simulated output, the token is likely a honeypot.

export interface HoneypotCheckResult {
  tokenAddress: string;
  isSuspicious: boolean;
  expectedOutputTon: number;
  simulatedOutputTon: number;
  taxPercentage: number;
  flags: string[];
}

/**
 * Detect transfer tax (honeypot) by comparing DEX quote vs expected math.
 * A legitimate token's quote should be within 2% of the expected rate.
 * Anything over 5% is flagged as suspicious (potential honeypot).
 */
export function analyzeTransferTax(
  inputAmountTon: number,
  expectedOutputTon: number,  // Based on pool ratio
  simulatedOutputTon: number, // From DEX quote API
): HoneypotCheckResult {
  const flags: string[] = [];

  if (expectedOutputTon <= 0) {
    return {
      tokenAddress: "",
      isSuspicious: true,
      expectedOutputTon,
      simulatedOutputTon,
      taxPercentage: 100,
      flags: ["Expected output is zero — pool may be empty"],
    };
  }

  const difference = Math.abs(expectedOutputTon - simulatedOutputTon);
  const taxPercentage = (difference / expectedOutputTon) * 100;

  if (taxPercentage > 5) {
    flags.push(`Transfer tax detected: ~${taxPercentage.toFixed(1)}%`);
  }
  if (taxPercentage > 20) {
    flags.push("CRITICAL: Very high transfer tax — likely honeypot");
  }
  if (simulatedOutputTon === 0 && expectedOutputTon > 0) {
    flags.push("CRITICAL: Zero output from simulation — definite honeypot");
  }

  return {
    tokenAddress: "",
    isSuspicious: taxPercentage > 5,
    expectedOutputTon,
    simulatedOutputTon,
    taxPercentage,
    flags,
  };
}

// ─── COMPOSITE RISK ASSESSMENT ───

export interface TokenRiskAssessment {
  address: string;
  symbol: string;
  isWhitelisted: boolean;
  poolSafety: PoolSafetyReport | null;
  honeypotCheck: HoneypotCheckResult | null;
  compositeRisk: number; // 0 = very risky, 1 = very safe
  recommendation: "SAFE" | "CAUTION" | "AVOID";
}

export function assessTokenRisk(
  tokenAddress: string,
  poolSafety?: PoolSafetyReport,
  honeypotCheck?: HoneypotCheckResult,
): TokenRiskAssessment {
  const token = getApprovedToken(tokenAddress);
  let compositeRisk = 0;

  if (token) compositeRisk += 0.4;
  if (poolSafety?.overallSafe) compositeRisk += 0.3;
  else if (poolSafety) compositeRisk += poolSafety.riskScore * 0.3;
  if (honeypotCheck && !honeypotCheck.isSuspicious) compositeRisk += 0.3;
  else if (!honeypotCheck) compositeRisk += 0.15; // Unknown = partial

  return {
    address: tokenAddress,
    symbol: token?.symbol ?? "UNKNOWN",
    isWhitelisted: !!token,
    poolSafety: poolSafety ?? null,
    honeypotCheck: honeypotCheck ?? null,
    compositeRisk: Math.min(1, compositeRisk),
    recommendation:
      compositeRisk >= 0.7 ? "SAFE" : compositeRisk >= 0.4 ? "CAUTION" : "AVOID",
  };
}

/**
 * Gate function: Returns true only if the strategy engine should proceed with this pool.
 * Used before any swap/LP/stake operation.
 */
export async function safetyGate(pool: {
  address: string;
  token0Address: string;
  token1Address: string;
  liquidityTon: number;
  poolAgeDays: number;
  volume24hTon: number;
}): Promise<{ allowed: boolean; report: PoolSafetyReport }> {
  const report = checkPoolSafety(pool);

  if (!report.overallSafe) {
    await addAdminLog("warn", "safety",
      `Pool ${pool.address.slice(0, 12)}... BLOCKED: ${report.flags.join("; ")}`,
    );
  }

  return { allowed: report.overallSafe, report };
}
