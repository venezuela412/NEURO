export const APP_NAME = "NeuroTON";

export const APP_TAGLINE = "A Premium Yield Vault. Powered by TON.";

export const PLATFORM_FEE_NOTICE = "Only charged on profit.";

export const GAS_RESERVE_MIN_TON = 0.2;

export const DEFAULT_ROUTE_QUALITY = 0.82;

// Dynamic gas costs per operation type (in TON)
// Source: TON mainnet empirical data — updated 2026-04
export const GAS_COSTS = {
  simple_transfer: 0.01,
  staking_deposit: 0.015,   // Tonstakers stake()
  staking_withdraw: 0.02,   // Tonstakers unstake()
  swap: 0.08,               // STON.fi / DeDust swap (worst-case)
  compound_cycle: 0.1,      // Full harvest: unstake + report yield
} as const;

// Protocol fees by provider (as decimal, e.g. 0.001 = 0.1%)
export const PROTOCOL_FEES: Record<string, { protocol: number; pool: number }> = {
  tonstakers: { protocol: 0, pool: 0 },         // No swap fees — pure staking yield
  stonfi:     { protocol: 0.001, pool: 0.002 },  // 0.1% protocol + 0.2% pool = 0.3%
  dedust:     { protocol: 0.001, pool: 0.002 },  // Similar to STON.fi
};

// Tonstakers mainnet pool address (for whitelist + ExecDelegate)
export const TONSTAKERS_POOL_ADDRESS = "EQCkWxfyhAkim3g2DjKQQg8T5P4g-Q1-K_jErGcDJZ4i-vqR";

export interface FeeEstimate {
  gasTon: number;          // Blockchain gas
  protocolFeePct: number;  // Combined protocol+pool fee as percentage
  totalCostTon: number;    // gas + (amount * protocolFeePct)
  netAmountTon: number;    // amount - totalCostTon
}

export function estimateFees(
  amountTon: number,
  operation: keyof typeof GAS_COSTS,
  provider: string = "tonstakers",
): FeeEstimate {
  const gasTon = GAS_COSTS[operation];
  const fees = PROTOCOL_FEES[provider] ?? { protocol: 0, pool: 0 };
  const protocolFeePct = fees.protocol + fees.pool;
  const protocolFeeTon = amountTon * protocolFeePct;
  const totalCostTon = gasTon + protocolFeeTon;
  const netAmountTon = Math.max(0, amountTon - totalCostTon);
  return { gasTon, protocolFeePct, totalCostTon, netAmountTon };
}

/** Returns true if yield exceeds all costs of compounding */
export function isCompoundProfitable(
  estimatedYieldTon: number,
  tvlTon: number,
  provider: string = "tonstakers",
): boolean {
  const compoundGas = GAS_COSTS.compound_cycle;
  const fees = PROTOCOL_FEES[provider] ?? { protocol: 0, pool: 0 };
  const protocolCost = estimatedYieldTon * (fees.protocol + fees.pool);
  const totalCost = compoundGas + protocolCost;
  // Only compound if yield is at least 2x the cost (safety margin)
  return estimatedYieldTon >= totalCost * 2;
}

export type Goal = "protect" | "earn" | "grow";

export type PlanRisk = "Low" | "Medium" | "High";

export type PlanId = "safe-income" | "balanced-income" | "growth-income" | "exit-to-safety";

export interface MoneyRange {
  low: number;
  high: number;
}

export interface PlanDefinition {
  id: PlanId;
  title: string;
  subtitle: string;
  framing: string;
  risk: PlanRisk;
  flexibility: string;
  estimatedAnnualRange: MoneyRange;
  explanation: string;
  internalBehavior: string;
  fallbackBehavior: string;
}

export interface PlanRecommendationInput {
  amountTon: number;
  goal: Goal;
  wantsFlexibility: boolean;
  riskPreference: "low" | "medium" | "high";
  hasWallet: boolean;
  gasReserveTon: number;
  routeQualityScore: number;
  safePathAvailable: boolean;
  hasActivePlan: boolean;
}

export interface PlanRecommendation {
  plan: PlanDefinition;
  reasons: string[];
  riskLabel: PlanRisk;
  estimatedAnnualRange: MoneyRange;
  estimatedMonthlyIncomeTon: MoneyRange;
  fallbackLabel: string;
  executionPreview: string;
}

export interface FeePreview {
  principalTon: number;
  estimatedValueTon: number;
  estimatedProfitTon: number;
  estimatedFeeTon: number;
  estimatedNetValueTon: number;
}

export interface ExecutionReceipt {
  id: string;
  planId: PlanId;
  mode: "wallet-approval" | "tonstakers-stake" | "stonfi-swap" | "move-to-safety" | "withdraw";
  status: "captured" | "submitted" | "reconciling" | "confirmed" | "failed";
  reference: string;
  summary: string;
  address?: string;
  amountTon?: number;
  createdAt: string;
  transactionHash?: string;
  accountAddress?: string;
  reconciledAt?: string;
  lastCheckedAt?: string;
  errorMessage?: string;
}

export interface NeuroOverview {
  appName: string;
  tagline: string;
  platformFeeNotice: string;
  minimumGasReserveTon: number;
  routeQualityBaseline: number;
}

export type ExecutionStatus =
  | "idle"
  | "preparing"
  | "ready-to-sign"
  | "waiting-for-wallet"
  | "submitted"
  | "confirming"
  | "success"
  | "retry-needed"
  | "fallback-available"
  | "failed-safely";

export interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  tone: "calm" | "positive" | "warning";
  timestampLabel: string;
}

export interface PortfolioSnapshot {
  activePlanId: PlanId;
  principalTon: number;
  estimatedValueTon: number;
  estimatedProfitTon: number;
  estimatedFeeTon: number;
  netEstimatedValueTon: number;
  availableToWithdrawTon: number;
  currentModeLabel: string;
  lastOptimizationLabel: string;
  activity: ActivityEvent[];
}

export interface PlanPreviewResponse {
  recommendation: PlanRecommendation;
  feePreview: FeePreview;
  portfolio: PortfolioSnapshot;
  executionStatus: ExecutionStatus;
  executionTitle: string;
  executionDescription: string;
  routeQualityScore: number;
}

export interface PersistedPortfolioState {
  walletAddress: string;
  recommendation: PlanRecommendation | null;
  feePreview: FeePreview | null;
  portfolio: PortfolioSnapshot | null;
  executionStatus: ExecutionStatus;
  executionReceipt: ExecutionReceipt | null;
  routeQualityScore: number;
  updatedAt: string;
}

export interface SignedActionPayload {
  type: "text";
  text: string;
}

export interface SignedActionProof {
  action: string;
  walletAddress: string;
  nonce: string;
  publicKey?: string;
  walletStateInit?: string;
  domain: string;
  timestamp: number;
  signature: string;
  payload: SignedActionPayload;
}

export interface WalletSession {
  token: string;
  walletAddress: string;
  expiresAt: string;
}

// ─── STRATEGY ENGINE SHARED TYPES ───

export interface PoolOpportunity {
  protocol: string;
  poolAddress: string;
  poolName: string;
  apy: number;
  riskAdjustedApy: number;
  tvlTon: number;
  safetyScore: number; // 0–1
  category: "staking" | "lp" | "farming";
}

export interface MarketScanReport {
  totalPoolsScanned: number;
  safePoolsFound: number;
  protocolsOnline: number;
  bestStakingApy: number | null;
  bestLpApy: number | null;
  opportunities: PoolOpportunity[];
  routeQualityScore: number;
  rebalanceRecommended: boolean;
  rebalanceReason: string | null;
  scannedAt: string;
}

export interface TokenSafetyInfo {
  address: string;
  symbol: string;
  approved: boolean;
  safetyScore: number;
  flags: string[];
}

export interface WithdrawalTxParams {
  to: string;
  value: string;
  payload: string;   // base64-encoded BOC
}

// ─── KNOWN PROTOCOL ADDRESSES ───

export const STONFI_ROUTER_V2 = "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt";
export const DEDUST_FACTORY = "EQBfBWT7X2BHg9tXAxzhz2aKiNTU1tpt5NsiK0uSDW_YAJ67";
export const TSTON_JETTON_MASTER = "EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav";

