import { useTonConnectUI } from "@tonconnect/ui-react";
import { buildPortfolioSnapshot } from "@neuro/domain";
import type { PlanRecommendation } from "@neuro/shared";
import { useAppStore } from "../store/appStore";

function getTonNetwork() {
  return import.meta.env.VITE_TON_NETWORK === "testnet" ? "-3" : "-239";
}

export function usePlanExecution() {
  const [tonConnectUI] = useTonConnectUI();
  const amountTon = useAppStore((state) => state.amountTon);
  const setExecutionStatus = useAppStore((state) => state.setExecutionStatus);
  const setPortfolio = useAppStore((state) => state.setPortfolio);

  async function activateWithWallet(recommendation: PlanRecommendation) {
    setExecutionStatus("waiting-for-wallet");

    const result = await tonConnectUI.signData({
      type: "text",
      text: [
        "NEURO plan approval",
        `Plan: ${recommendation.plan.title}`,
        `Amount: ${amountTon.toFixed(2)} TON`,
        `Risk: ${recommendation.riskLabel}`,
        `Fallback: ${recommendation.fallbackLabel}`,
      ].join("\n"),
      network: getTonNetwork(),
    });

    setExecutionStatus("confirming");
    setPortfolio(buildPortfolioSnapshot(recommendation, amountTon));
    setExecutionStatus("success");

    return result;
  }

  return {
    activateWithWallet,
  };
}
