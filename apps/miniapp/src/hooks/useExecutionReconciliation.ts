import { useMutation } from "@tanstack/react-query";
import { reconcileExecutionReceipt } from "../lib/controlPlane";
import { useNeuroWallet } from "./useTonWallet";
import { useAppStore } from "../store/appStore";
import { useWalletActionAuth } from "./useWalletActionAuth";

export function useExecutionReconciliation() {
  const wallet = useNeuroWallet();
  const setPortfolio = useAppStore((state) => state.setPortfolio);
  const setExecutionReceipt = useAppStore((state) => state.setExecutionReceipt);
  const setExecutionStatus = useAppStore((state) => state.setExecutionStatus);
  const appendActivityEvent = useAppStore((state) => state.appendActivityEvent);
  const { ensureSession } = useWalletActionAuth();

  return useMutation({
    mutationFn: async (executionId: string) => {
      if (!wallet.address) {
        throw new Error("Wallet address is required");
      }

      const session = await ensureSession();
      return reconcileExecutionReceipt(wallet.address, executionId, session);
    },
    onSuccess: ({ portfolio, executionReceipt, executionStatus }) => {
      if (portfolio) {
        setPortfolio(portfolio);
      }
      setExecutionReceipt(executionReceipt);
      setExecutionStatus(executionStatus);
      appendActivityEvent({
        id: `activity-reconcile-${executionReceipt.id}-${Date.now()}`,
        title:
          executionReceipt.status === "confirmed"
            ? "Execution confirmed"
            : executionReceipt.status === "failed"
              ? "Execution needs review"
              : "Execution still reconciling",
        description: executionReceipt.summary,
        tone:
          executionReceipt.status === "confirmed"
            ? "positive"
            : executionReceipt.status === "failed"
              ? "warning"
              : "calm",
        timestampLabel: "Just now",
      });
    },
  });
}
