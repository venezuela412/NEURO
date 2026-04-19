import { useTonConnectUI } from "@tonconnect/ui-react";
import { toNano } from "@ton/core";
import { buildPortfolioSnapshot } from "@neuro/domain";
import type { ActivityEvent, ExecutionReceipt, PlanRecommendation } from "@neuro/shared";
import { useAppStore } from "../store/appStore";
import { createTonstakersAdapter } from "@neuro/adapters";

function getTonNetwork() {
  return "-239";
}

interface PlanExecutionController {
  activateWithWallet: (recommendation: PlanRecommendation, quoteData?: unknown) => Promise<void>;
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

function buildReceiptId() {
  return `receipt-${crypto.randomUUID()}`;
}

export function usePlanExecution(): PlanExecutionController {
  const [tonConnectUI] = useTonConnectUI();
  const amountTon = useAppStore((state) => state.amountTon);
  const setExecutionStatus = useAppStore((state) => state.setExecutionStatus);
  const setPortfolio = useAppStore((state) => state.setPortfolio);
  const setExecutionReceipt = useAppStore((state) => state.setExecutionReceipt);
  const appendActivityEvent = useAppStore((state) => state.appendActivityEvent);

  async function activateWithWallet(
    recommendation: PlanRecommendation,
    quoteData?: unknown, // optional quote from useStonQuote
  ) {
    setExecutionStatus("waiting-for-wallet");
    setExecutionReceipt(null);

    let receipt: ExecutionReceipt;

    try {
      if (recommendation.plan.id === "safe-income") {
        const tonstakers = await createTonstakersAdapter(tonConnectUI, {
          partnerCode: import.meta.env.VITE_TONSTAKERS_PARTNER_CODE
            ? Number(import.meta.env.VITE_TONSTAKERS_PARTNER_CODE)
            : undefined,
          tonApiKey: import.meta.env.VITE_TONAPI_KEY,
        });
        const result = await tonstakers.stake(toNano(amountTon.toFixed(3)));
        receipt = {
          id: buildReceiptId(),
          planId: recommendation.plan.id,
          mode: "tonstakers-stake",
          status: "submitted",
          reference: result.boc,
          amountTon,
          summary: `Tonstakers staking request prepared for ${amountTon.toFixed(2)} TON.`,
          createdAt: new Date().toISOString(),
        };
      } else if (recommendation.plan.id === "balanced-income" || recommendation.plan.id === "growth-income") {
        // Here we use STON.fi provider for balanced and growth
        const { StonfiExecutionProvider } = await import("@neuro/adapters");
        const { createOmnistonClient } = await import("../lib/stonfi");
        const omnistonClient = createOmnistonClient();
        
        const stonProvider = new StonfiExecutionProvider(tonConnectUI, omnistonClient);
        const preview = await stonProvider.quote(amountTon);
        // Inject the real quote if available
        if (quoteData && typeof quoteData === "object" && "quote" in quoteData) {
          preview.quoteResult = quoteData;
        }

        const result = await stonProvider.execute(preview);
        
        receipt = {
          id: buildReceiptId(),
          planId: recommendation.plan.id,
          mode: "stonfi-swap",
          status: "submitted",
          reference: result.boc ?? "failed-boc",
          amountTon,
          summary: `STON.fi token swap requested for ${amountTon.toFixed(2)} TON.`,
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
          id: buildReceiptId(),
          planId: recommendation.plan.id,
          mode: "wallet-approval",
          status: "captured",
          reference: result.signature,
          amountTon,
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
          recommendation.plan.id === "safe-income"
            ? "Safe Income request signed"
            : recommendation.plan.id === "balanced-income" || recommendation.plan.id === "growth-income"
              ? "Growth Swap transaction signed"
              : "Wallet approval captured",
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
    } catch (error) {
      setExecutionStatus("failed-safely");
      throw error;
    }
  }

  return {
    activateWithWallet,
  };
}
