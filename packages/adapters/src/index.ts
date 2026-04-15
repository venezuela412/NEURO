import {
  APP_NAME,
  APP_TAGLINE,
  DEFAULT_ROUTE_QUALITY,
  GAS_RESERVE_MIN_TON,
  PLATFORM_FEE_NOTICE,
  type ExecutionStatus,
  type NeuroOverview,
  type PlanPreviewResponse,
  type PlanRecommendationInput,
} from "@neuro/shared";
import {
  buildPortfolioSnapshot,
  calculateFeePreview,
  recommendPlan,
} from "@neuro/domain";

export interface TelegramEnvironment {
  platform: "telegram" | "browser";
  colorScheme: "dark" | "light";
  isExpanded: boolean;
}

export interface WalletState {
  connected: boolean;
  address?: string;
  walletName?: string;
}

export interface PlanExecutionPreview {
  status: ExecutionStatus;
  title: string;
  description: string;
}

export function getMockTelegramEnvironment(): TelegramEnvironment {
  return {
    platform: "browser",
    colorScheme: "dark",
    isExpanded: true,
  };
}

export function getMockWalletState(): WalletState {
  return {
    connected: false,
  };
}

export function getExecutionPreview(status: ExecutionStatus): PlanExecutionPreview {
  const mapping: Record<ExecutionStatus, PlanExecutionPreview> = {
    idle: {
      status,
      title: "Ready when you are",
      description: "NEURO is waiting for your amount and goal.",
    },
    preparing: {
      status,
      title: "Preparing your plan",
      description: "Checking the route, fee impact, and safety fallback before anything moves.",
    },
    "ready-to-sign": {
      status,
      title: "Plan ready to activate",
      description: "Your wallet can sign once you review the outcome and risk notice.",
    },
    "waiting-for-wallet": {
      status,
      title: "Waiting for wallet",
      description: "Open your TON wallet to continue the activation.",
    },
    submitted: {
      status,
      title: "Plan submitted",
      description: "The activation request is on its way to the network.",
    },
    confirming: {
      status,
      title: "Confirming safely",
      description: "NEURO will only show success after confirmation is observed.",
    },
    success: {
      status,
      title: "Wallet approval captured",
      description: "NEURO received a real wallet signature and staged the plan for the next execution step.",
    },
    "retry-needed": {
      status,
      title: "Retry available",
      description: "A better route is needed before activation can continue.",
    },
    "fallback-available": {
      status,
      title: "Safer fallback available",
      description: "NEURO found a calmer path and can move the plan there.",
    },
    "failed-safely": {
      status,
      title: "Stopped safely",
      description: "Nothing was marked successful and no ambiguous state was created.",
    },
  };

  return mapping[status];
}

export function getNeuroOverview(): NeuroOverview {
  return {
    appName: APP_NAME,
    tagline: APP_TAGLINE,
    platformFeeNotice: PLATFORM_FEE_NOTICE,
    minimumGasReserveTon: GAS_RESERVE_MIN_TON,
    routeQualityBaseline: DEFAULT_ROUTE_QUALITY,
  };
}

export function createMockPortfolio(goalAmountTon: number) {
  const payload = buildPlanPreviewResponse({
    amountTon: goalAmountTon,
    goal: "earn",
    wantsFlexibility: true,
    riskPreference: "medium",
    hasWallet: true,
    gasReserveTon: GAS_RESERVE_MIN_TON,
    routeQualityScore: DEFAULT_ROUTE_QUALITY,
    safePathAvailable: true,
    hasActivePlan: false,
  });

  return {
    recommendation: payload.recommendation,
    snapshot: payload.portfolio,
    feePreview: payload.feePreview,
  };
}

export function buildPlanPreviewResponse(input: PlanRecommendationInput): PlanPreviewResponse {
  const recommendation = recommendPlan(input);
  const portfolio = buildPortfolioSnapshot(recommendation, input.amountTon);
  const feePreview = calculateFeePreview(
    recommendation.plan.id,
    portfolio.principalTon,
    portfolio.estimatedValueTon,
  );
  const executionStatus: ExecutionStatus = input.hasWallet ? "ready-to-sign" : "waiting-for-wallet";
  const executionPreview = getExecutionPreview(executionStatus);

  return {
    recommendation,
    feePreview,
    portfolio,
    executionStatus,
    executionTitle: executionPreview.title,
    executionDescription: executionPreview.description,
    routeQualityScore: input.routeQualityScore,
  };
}

export function getDefaultPlanRecommendationInput(
  overrides: Partial<PlanRecommendationInput> = {},
): PlanRecommendationInput {
  return {
    amountTon: 100,
    goal: "earn",
    wantsFlexibility: true,
    riskPreference: "medium",
    hasWallet: false,
    gasReserveTon: GAS_RESERVE_MIN_TON,
    routeQualityScore: DEFAULT_ROUTE_QUALITY,
    safePathAvailable: true,
    hasActivePlan: false,
    ...overrides,
  };
}
    feePreview,
  };
}
