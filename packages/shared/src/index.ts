export const APP_NAME = "NEURO";

export const APP_TAGLINE = "Put your TON to work. Simply.";

export const PLATFORM_FEE_NOTICE = "Only charged on profit.";

export const GAS_RESERVE_MIN_TON = 0.2;

export const DEFAULT_ROUTE_QUALITY = 0.82;

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
  mode: "wallet-approval" | "tonstakers-stake" | "move-to-safety" | "withdraw";
  status: "captured" | "submitted" | "reconciling" | "confirmed" | "failed";
  reference: string;
  summary: string;
  address?: string;
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
