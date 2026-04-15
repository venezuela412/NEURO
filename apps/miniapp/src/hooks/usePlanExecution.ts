import { useTonConnectUI } from "@tonconnect/ui-react";
import { toNano } from "@ton/core";
import { buildPortfolioSnapshot } from "@neuro/domain";
import type { ActivityEvent, ExecutionReceipt, PlanRecommendation } from "@neuro/shared";
import { useAppStore } from "../store/appStore";
import { createTonstakersAdapter } from "@neuro/adapters";

function getTonNetwork() {
  return import.meta.env.VITE_TON_NETWORK === "testnet" ? "-3" : "-239";
}

interface PlanExecutionController {
  activateWithWallet: (recommendation: PlanRecommendation) => Promise<void>;
}

function buildExecutionEvent(title: string, description: string, tone: ActivityEvent["tone"]): ActivityEvent {
  return {
    id: `activity-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title,
    description,
    tone,
    timestampLabel: "Just now",
  };
}

export function usePlanExecution(): PlanExecutionController {
  const [tonConnectUI] = useTonConnectUI();
  const amountTon = useAppStore((state) => state.amountTon);
  const setExecutionStatus = useAppStore((state) => state.setExecutionStatus);
  const setPortfolio = useAppStore((state) => state.setPortfolio);
  const setExecutionReceipt = useAppStore((state) => state.setExecutionReceipt);
  const appendActivityEvent = useAppStore((state) => state.appendActivityEvent);
  const tonstakers = createTonstakersAdapter(tonConnectUI, {
    partnerCode: import.meta.env.VITE_TONSTAKERS_PARTNER_CODE
      ? Number(import.meta.env.VITE_TONSTAKERS_PARTNER_CODE)
      : undefined,
    tonApiKey: import.meta.env.VITE_TONAPI_KEY,
  });

  async function activateWithWallet(recommendation: PlanRecommendation) {
    setExecutionStatus("waiting-for-wallet");
    setExecutionReceipt(null);

    let receipt: ExecutionReceipt;

    if (recommendation.plan.id === "safe-income") {
      const result = await tonstakers.stake(toNano(amountTon.toFixed(3)));
      receipt = {
        mode: "tonstakers-stake",
        reference: result.boc,
        summary: `Tonstakers staking request prepared for ${amountTon.toFixed(2)} TON.`,
        createdAt: new Date().toISOString(),
      };
    } else {
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

      receipt = {
        mode: "wallet-approval",
        reference: result.signature,
        summary: `Wallet approval captured for ${recommendation.plan.title}.`,
        address: result.address,
        createdAt: new Date(result.timestamp * 1000).toISOString(),
      };
    }

    setExecutionStatus("confirming");
    setPortfolio(buildPortfolioSnapshot(recommendation, amountTon));
    setExecutionReceipt(receipt);
    appendActivityEvent(
      buildExecutionEvent(
        recommendation.plan.id === "safe-income" ? "Safe Income request signed" : "Wallet approval captured",
        receipt.summary,
        "positive",
      ),
    );
    appendActivityEvent(
      buildExecutionEvent(
        "Execution staged",
        "NEURO moved the plan into confirmation state and updated your active plan summary.",
        "calm",
      ),
    );
    setExecutionStatus("success");
  }

  return {
    activateWithWallet,
  };
}
