import { useTonConnectUI } from "@tonconnect/ui-react";
import { toNano } from "@ton/core";
import { buildPortfolioSnapshot } from "@neuro/domain";
import type { PlanRecommendation } from "@neuro/shared";
import { useAppStore } from "../store/appStore";
import { createTonstakersAdapter } from "@neuro/adapters";

function getTonNetwork() {
  return import.meta.env.VITE_TON_NETWORK === "testnet" ? "-3" : "-239";
}

interface PlanExecutionController {
  activateWithWallet: (recommendation: PlanRecommendation) => Promise<void>;
}

export function usePlanExecution(): PlanExecutionController {
  const [tonConnectUI] = useTonConnectUI();
  const amountTon = useAppStore((state) => state.amountTon);
  const setExecutionStatus = useAppStore((state) => state.setExecutionStatus);
  const setPortfolio = useAppStore((state) => state.setPortfolio);
  const tonstakers = createTonstakersAdapter(tonConnectUI, {
    partnerCode: import.meta.env.VITE_TONSTAKERS_PARTNER_CODE
      ? Number(import.meta.env.VITE_TONSTAKERS_PARTNER_CODE)
      : undefined,
    tonApiKey: import.meta.env.VITE_TONAPI_KEY,
  });

  async function activateWithWallet(recommendation: PlanRecommendation) {
    setExecutionStatus("waiting-for-wallet");

    if (recommendation.plan.id === "safe-income") {
      await tonstakers.stake(toNano(amountTon.toFixed(3)));
    } else {
      await tonConnectUI.signData({
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
    }

    setExecutionStatus("confirming");
    setPortfolio(buildPortfolioSnapshot(recommendation, amountTon));
    setExecutionStatus("success");
  }

  return {
    activateWithWallet,
  };
}
