import { useMemo } from "react";
import { buildPortfolioSnapshot, calculateFeePreview, recommendPlan } from "@neuro/domain";
import { GAS_RESERVE_MIN_TON } from "@neuro/shared";
import { useAppStore } from "../store/appStore";
import { useNeuroWallet } from "./useTonWallet";

export function usePlanEngine() {
  const wallet = useNeuroWallet();
  const amountTon = useAppStore((state) => state.amountTon);
  const goal = useAppStore((state) => state.goal);
  const wantsFlexibility = useAppStore((state) => state.wantsFlexibility);
  const riskPreference = useAppStore((state) => state.riskPreference);
  const routeQualityScore = useAppStore((state) => state.routeQualityScore);
  const portfolio = useAppStore((state) => state.portfolio);
  const storedRecommendation = useAppStore((state) => state.recommendation);
  const storedFeePreview = useAppStore((state) => state.feePreview);
  const hasActivePlan = Boolean(portfolio);

  return useMemo(() => {
    const recommendation =
      storedRecommendation ??
      recommendPlan({
        amountTon,
        goal,
        wantsFlexibility,
        riskPreference,
        hasWallet: wallet.connected,
        gasReserveTon: GAS_RESERVE_MIN_TON,
        routeQualityScore,
        safePathAvailable: true,
        hasActivePlan,
      });

    const previewPortfolio = buildPortfolioSnapshot(recommendation, amountTon);
    const feePreview =
      storedFeePreview ??
      calculateFeePreview(
        recommendation.plan.id,
        previewPortfolio.principalTon,
        previewPortfolio.estimatedValueTon,
      );

    return {
      wallet,
      recommendation,
      feePreview,
      portfolio: portfolio ?? previewPortfolio,
      preview: () =>
        recommendPlan({
          amountTon,
          goal,
          wantsFlexibility,
          riskPreference,
          hasWallet: wallet.connected,
          gasReserveTon: GAS_RESERVE_MIN_TON,
          routeQualityScore,
          safePathAvailable: true,
          hasActivePlan,
        }),
    };
  }, [
    amountTon,
    goal,
    wantsFlexibility,
    riskPreference,
    routeQualityScore,
    wallet,
    hasActivePlan,
    portfolio,
    storedRecommendation,
    storedFeePreview,
  ]);
}
