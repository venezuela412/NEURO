import { useMutation } from "@tanstack/react-query";
import type { ActivityEvent, ExecutionReceipt, PortfolioSnapshot } from "@neuro/shared";
import { movePortfolioToSafety, withdrawPortfolio } from "../lib/controlPlane";
import { useNeuroWallet } from "./useTonWallet";
import { useAppStore } from "../store/appStore";

function buildActivityFromReceipt(receipt: ExecutionReceipt): ActivityEvent {
  return {
    id: `activity-${receipt.id}`,
    title:
      receipt.mode === "move-to-safety"
        ? "Moved to safety"
        : receipt.mode === "withdraw"
          ? "Withdrawal prepared"
          : "Execution recorded",
    description: receipt.summary,
    tone: receipt.mode === "move-to-safety" ? "calm" : "positive",
    timestampLabel: "Just now",
  };
}

export function usePortfolioActions() {
  const wallet = useNeuroWallet();
  const setPortfolio = useAppStore((state) => state.setPortfolio);
  const setExecutionReceipt = useAppStore((state) => state.setExecutionReceipt);
  const appendActivityEvent = useAppStore((state) => state.appendActivityEvent);
  const setExecutionStatus = useAppStore((state) => state.setExecutionStatus);

  const applyMutationResult = (portfolio: PortfolioSnapshot, receipt: ExecutionReceipt) => {
    setPortfolio(portfolio);
    setExecutionReceipt(receipt);
    setExecutionStatus("success");
    appendActivityEvent(buildActivityFromReceipt(receipt));
  };

  const moveToSafetyMutation = useMutation({
    mutationFn: async () => {
      if (!wallet.address) {
        throw new Error("Wallet address is required");
      }

      setExecutionStatus("confirming");
      return movePortfolioToSafety(wallet.address);
    },
    onSuccess: ({ portfolio, executionReceipt }) => {
      applyMutationResult(portfolio, executionReceipt);
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amountTon?: number) => {
      if (!wallet.address) {
        throw new Error("Wallet address is required");
      }

      setExecutionStatus("confirming");
      return withdrawPortfolio(wallet.address, amountTon);
    },
    onSuccess: ({ portfolio, executionReceipt }) => {
      applyMutationResult(portfolio, executionReceipt);
    },
  });

  return {
    moveToSafetyMutation,
    withdrawMutation,
  };
}
