import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlanCard } from "../components/plans/PlanCard";
import { StickyActionBar } from "../components/core/StickyActionBar";
import { usePlanEngine } from "../hooks/usePlanEngine";
import { useAppStore } from "../store/appStore";

export function PlanResultScreen() {
  const navigate = useNavigate();
  const acknowledgeRisk = useAppStore((state) => state.acknowledgeRisk);
  const setExecutionStatus = useAppStore((state) => state.setExecutionStatus);
  const setPortfolio = useAppStore((state) => state.setPortfolio);
  const hasWallet = useAppStore((state) => state.hasWallet);
  const { recommendation, feePreview, portfolio } = usePlanEngine();

  const handleActivate = () => {
    acknowledgeRisk();
    if (!hasWallet) {
      setExecutionStatus("waiting-for-wallet");
      navigate("/onboarding");
      return;
    }

    setExecutionStatus("success");
    setPortfolio(portfolio);
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
