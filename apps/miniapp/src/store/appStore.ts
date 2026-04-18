import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_ROUTE_QUALITY,
  GAS_RESERVE_MIN_TON,
  type ActivityEvent,
  type ExecutionReceipt,
  type FeePreview,
  type ExecutionStatus,
  type Goal,
  type PersistedPortfolioState,
  type PlanPreviewResponse,
  type PlanRecommendation,
  type PortfolioSnapshot,
} from "@neuro/shared";
import { buildPortfolioSnapshot, calculateFeePreview, recommendPlan } from "@neuro/domain";

type RiskPreference = "low" | "medium" | "high";

interface AppState {
  isTestnet: boolean;
  amountTon: number;
  goal: Goal;
  wantsFlexibility: boolean;
  riskPreference: RiskPreference;
  acknowledgedRisk: boolean;
  hasWallet: boolean;
  routeQualityScore: number;
  recommendation: PlanRecommendation | null;
  feePreview: FeePreview | null;
  portfolio: PortfolioSnapshot | null;
  executionStatus: ExecutionStatus;
  executionReceipt: ExecutionReceipt | null;
  isPortfolioHydrating: boolean;
  setIsTestnet: (value: boolean) => void;
  setAmountTon: (amount: number) => void;
  setGoal: (goal: Goal) => void;
  setWantsFlexibility: (value: boolean) => void;
  setRiskPreference: (value: RiskPreference) => void;
  setHasWallet: (value: boolean) => void;
  acknowledgeRisk: () => void;
  resetAcknowledgedRisk: () => void;
  setRecommendation: (recommendation: PlanRecommendation | null) => void;
  setFeePreview: (feePreview: FeePreview | null) => void;
  setPortfolio: (portfolio: PortfolioSnapshot | null) => void;
  setExecutionReceipt: (receipt: ExecutionReceipt | null) => void;
  setPortfolioHydrating: (value: boolean) => void;
  appendActivityEvent: (event: ActivityEvent) => void;
  setRouteQualityScore: (score: number) => void;
  applyPlanPreview: (preview: PlanPreviewResponse) => void;
  applyPersistedPortfolioState: (state: PersistedPortfolioState) => void;
  clearGeneratedPlan: () => void;
  generatePlan: () => void;
  activatePlan: () => void;
  setExecutionStatus: (status: ExecutionStatus) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  isTestnet: import.meta.env.VITE_TON_NETWORK === "testnet",
  amountTon: 100,
  goal: "earn",
  wantsFlexibility: true,
  riskPreference: "medium",
  acknowledgedRisk: false,
  hasWallet: false,
  routeQualityScore: DEFAULT_ROUTE_QUALITY,
  recommendation: null,
  feePreview: null,
  portfolio: null,
  executionStatus: "idle",
  executionReceipt: null,
  isPortfolioHydrating: false,
  setIsTestnet: (isTestnet) => set({ isTestnet }),
  setAmountTon: (amountTon) =>
    set({
      amountTon,
      acknowledgedRisk: false,
      recommendation: null,
      feePreview: null,
      executionStatus: "idle",
      executionReceipt: null,
    }),
  setGoal: (goal) =>
    set({
      goal,
      acknowledgedRisk: false,
      recommendation: null,
      feePreview: null,
      executionStatus: "idle",
      executionReceipt: null,
    }),
  setWantsFlexibility: (wantsFlexibility) =>
    set({
      wantsFlexibility,
      acknowledgedRisk: false,
      recommendation: null,
      feePreview: null,
      executionStatus: "idle",
      executionReceipt: null,
    }),
  setRiskPreference: (riskPreference) =>
    set({
      riskPreference,
      acknowledgedRisk: false,
      recommendation: null,
      feePreview: null,
      executionStatus: "idle",
      executionReceipt: null,
    }),
  setHasWallet: (hasWallet) => set({ hasWallet }),
  acknowledgeRisk: () => set({ acknowledgedRisk: true }),
  resetAcknowledgedRisk: () => set({ acknowledgedRisk: false }),
  setRecommendation: (recommendation) => set({ recommendation }),
  setFeePreview: (feePreview) => set({ feePreview }),
  setPortfolio: (portfolio) => set({ portfolio }),
  setExecutionReceipt: (executionReceipt) => set({ executionReceipt }),
  setPortfolioHydrating: (isPortfolioHydrating) => set({ isPortfolioHydrating }),
  appendActivityEvent: (event) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            activity: [event, ...state.portfolio.activity],
          }
        : state.portfolio,
    })),
  setRouteQualityScore: (routeQualityScore) => set({ routeQualityScore }),
  applyPlanPreview: (preview) =>
    set({
      recommendation: preview.recommendation,
      feePreview: preview.feePreview,
      routeQualityScore: preview.routeQualityScore,
      executionStatus: preview.executionStatus,
      acknowledgedRisk: false,
      executionReceipt: null,
    }),
  applyPersistedPortfolioState: (persistedState) =>
    set({
      recommendation: persistedState.recommendation,
      feePreview: persistedState.feePreview,
      portfolio: persistedState.portfolio,
      executionStatus: persistedState.executionStatus,
      executionReceipt: persistedState.executionReceipt,
      routeQualityScore: persistedState.routeQualityScore,
    }),
  clearGeneratedPlan: () =>
    set({
      recommendation: null,
      feePreview: null,
      executionStatus: "idle",
      acknowledgedRisk: false,
      executionReceipt: null,
    }),
  generatePlan: () => {
    const state = get();
    const recommendation = recommendPlan({
      amountTon: state.amountTon,
      goal: state.goal,
      wantsFlexibility: state.wantsFlexibility,
      riskPreference: state.riskPreference,
      hasWallet: state.hasWallet,
      gasReserveTon: GAS_RESERVE_MIN_TON,
      routeQualityScore: state.routeQualityScore,
      safePathAvailable: true,
      hasActivePlan: Boolean(state.portfolio),
    });
    const midpointValue =
      state.amountTon *
      (1 + (recommendation.estimatedAnnualRange.low + recommendation.estimatedAnnualRange.high) / 2 / 200);
    const feePreview = calculateFeePreview(recommendation.plan.id, state.amountTon, midpointValue);

    set({
      recommendation,
      feePreview,
      acknowledgedRisk: false,
      executionStatus: "ready-to-sign",
    });
  },
  activatePlan: () => {
    const state = get();

    if (!state.recommendation) {
      return;
    }

    const portfolio = buildPortfolioSnapshot(state.recommendation, state.amountTon);

    set({
      portfolio,
      feePreview: calculateFeePreview(state.recommendation.plan.id, portfolio.principalTon, portfolio.estimatedValueTon),
      executionStatus: "success",
      executionReceipt: null,
    });
  },
      setExecutionStatus: (executionStatus) => set({ executionStatus }),
    }),
    {
      name: "neuro-app-store",
      partialize: (state) => ({
        isTestnet: state.isTestnet,
        amountTon: state.amountTon,
        goal: state.goal,
        wantsFlexibility: state.wantsFlexibility,
        riskPreference: state.riskPreference,
        hasWallet: state.hasWallet,
        routeQualityScore: state.routeQualityScore,
        recommendation: state.recommendation,
        feePreview: state.feePreview,
        portfolio: state.portfolio,
        executionStatus: state.executionStatus,
        executionReceipt: state.executionReceipt,
      }),
    },
  ),
);
