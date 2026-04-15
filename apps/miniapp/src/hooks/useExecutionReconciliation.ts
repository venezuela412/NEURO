import { useMutation } from "@tanstack/react-query";
import { reconcileExecutionReceipt } from "../lib/controlPlane";
import { useNeuroWallet } from "./useTonWallet";
import { useAppStore } from "../store/appStore";

export function useExecutionReconciliation() {
  const wallet = useNeuroWallet();
  const setPortfolio = useAppStore((state) => state.setPortfolio);
  const setExecutionReceipt = useAppStore((state) => state.setExecutionReceipt);
  const setExecutionStatus = useAppStore((state) => state.setExecutionStatus);
  const appendActivityEvent = useAppStore((state) => state.appendActivityEvent);

  return useMutation({
    mutationFn: async (executionId: string) => {
      if (!wallet.address) {
        throw new Error("Wallet address is required");
      }

      return reconcileExecutionReceipt(wallet.address, executionId);
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
