import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ExecutionStatusCard } from "../components/core/ExecutionStatusCard";
import { PlanCard } from "../components/plans/PlanCard";
import { TechnicalDetailsDrawer } from "../components/plans/TechnicalDetailsDrawer";
import { StickyActionBar } from "../components/core/StickyActionBar";
import { usePlanEngine } from "../hooks/usePlanEngine";
import { usePlanExecution } from "../hooks/usePlanExecution";
import { useAppStore } from "../store/appStore";

export function PlanResultScreen() {
  const navigate = useNavigate();
  const acknowledgeRisk = useAppStore((state) => state.acknowledgeRisk);
  const setExecutionStatus = useAppStore((state) => state.setExecutionStatus);
  const hasWallet = useAppStore((state) => state.hasWallet);
  const routeQualityScore = useAppStore((state) => state.routeQualityScore);
  const executionStatus = useAppStore((state) => state.executionStatus);
  const { recommendation, feePreview } = usePlanEngine();
  const { activateWithWallet } = usePlanExecution();

  const handleActivate = async () => {
    acknowledgeRisk();
    if (!hasWallet) {
      setExecutionStatus("waiting-for-wallet");
      navigate("/onboarding");
      return;
    }

    try {
      await activateWithWallet(recommendation);
    } catch {
      setExecutionStatus("failed-safely");
      return;
    }

    navigate("/active");
  };

  return (
    <div className="page-stack">
      <motion.section
        className="card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <p className="eyebrow">Recommended income plan</p>
        <h1 className="headline">A clear plan for your TON</h1>
        <p className="muted">
          NEURO translated your goal into a simple plan, an expected range, and
          a visible fallback if market conditions soften.
        </p>
      </motion.section>

      <PlanCard recommendation={recommendation} feePreview={feePreview} />
      <ExecutionStatusCard status={executionStatus} />

      <motion.section
        className="card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.28 }}
      >
        <div className="inline-icon-row">
          <ShieldCheck size={18} />
          <span>Risk acknowledgment</span>
        </div>
        <p className="muted">
          This is not guaranteed income. Returns can move with network and market
          conditions. NEURO keeps a safer fallback ready when supported paths
          weaken.
        </p>
      </motion.section>

      <TechnicalDetailsDrawer
        recommendation={recommendation}
        feePreview={feePreview}
        routeQualityScore={routeQualityScore}
        hasWallet={hasWallet}
      />

      <StickyActionBar
        primaryLabel={hasWallet ? "Activate this plan" : "Connect wallet to activate"}
        onPrimaryClick={handleActivate}
        secondaryLabel="Adjust inputs"
        onSecondaryClick={() => navigate("/plans")}
        helper={
          hasWallet
            ? `Estimated fee ${feePreview.estimatedFeeTon.toFixed(2)} TON. Only charged on profit.`
            : "Connect a TON wallet from the header before activation."
        }
      />
    </div>
  );
}
