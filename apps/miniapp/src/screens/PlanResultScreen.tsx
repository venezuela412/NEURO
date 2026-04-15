import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ExecutionStatusCard } from "../components/core/ExecutionStatusCard";
import { PlanCard } from "../components/plans/PlanCard";
import { TechnicalDetailsDrawer } from "../components/plans/TechnicalDetailsDrawer";
import { StickyActionBar } from "../components/core/StickyActionBar";
import { usePlanEngine } from "../hooks/usePlanEngine";
import { usePlanExecution } from "../hooks/usePlanExecution";
import { useStonQuote } from "../hooks/useStonQuote";
import { useTonstakers } from "../hooks/useTonstakers";
import { useAppStore } from "../store/appStore";

export function PlanResultScreen() {
  const navigate = useNavigate();
  const acknowledgeRisk = useAppStore((state) => state.acknowledgeRisk);
  const setExecutionStatus = useAppStore((state) => state.setExecutionStatus);
  const hasWallet = useAppStore((state) => state.hasWallet);
  const routeQualityScore = useAppStore((state) => state.routeQualityScore);
  const executionStatus = useAppStore((state) => state.executionStatus);
  const amountTon = useAppStore((state) => state.amountTon);
  const { recommendation, feePreview } = usePlanEngine();
  const { activateWithWallet } = usePlanExecution();
  const { safeIncomeQuery } = useTonstakers({
    enabled: recommendation.plan.id === "safe-income",
  });
  const stonQuote = useStonQuote({
    enabled: recommendation.plan.id !== "safe-income",
    amountTon,
  });

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

      {recommendation.plan.id === "safe-income" ? (
        <motion.section
          className="card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04, duration: 0.28 }}
        >
          <div className="inline-icon-row">
            <ShieldCheck size={18} />
            <span>Safe path signal</span>
          </div>
          {safeIncomeQuery.isLoading ? (
            <p className="muted">
              Checking Tonstakers pool conditions and available balance guidance...
            </p>
          ) : safeIncomeQuery.data ? (
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-label">Current staking APY</span>
                <strong>{safeIncomeQuery.data.currentApy?.toFixed(2) ?? "--"}%</strong>
              </div>
              <div className="metric-card">
                <span className="metric-label">Available for staking</span>
                <strong>{safeIncomeQuery.data.availableToStakeTon?.toFixed(2) ?? "--"} TON</strong>
              </div>
              <div className="metric-card">
                <span className="metric-label">Instant liquidity</span>
                <strong>{safeIncomeQuery.data.instantLiquidityTon?.toFixed(2) ?? "--"} TON</strong>
              </div>
              <div className="metric-card">
                <span className="metric-label">Projected tsTON rate</span>
                <strong>{safeIncomeQuery.data.projectedTsTonRate?.toFixed(4) ?? "--"} TON</strong>
              </div>
            </div>
          ) : (
            <p className="muted">
              Tonstakers data is currently unavailable, so NEURO is keeping the plan
              explanation conservative and relying on safe-mode fallback rules.
            </p>
          )}
        </motion.section>
      ) : null}

      {recommendation.plan.id !== "safe-income" ? (
        <motion.section
          className="card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.28 }}
        >
          <div className="inline-icon-row">
            <ShieldCheck size={18} />
            <span>Growth route signal</span>
          </div>
          {stonQuote.query.isLoading ? (
            <p className="muted">
              Checking STON.fi route quality for a stronger growth-oriented path...
            </p>
          ) : stonQuote.isQuoted && stonQuote.signal ? (
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-label">Quote quality</span>
                <strong>{stonQuote.signal.qualityLabel}</strong>
              </div>
              <div className="metric-card">
                <span className="metric-label">Estimated route score</span>
                <strong>{(stonQuote.signal.routeQualityScore * 100).toFixed(0)} / 100</strong>
              </div>
              <div className="metric-card">
                <span className="metric-label">Signal source</span>
                <strong>STON.fi quote seam</strong>
              </div>
              <div className="metric-card">
                <span className="metric-label">Current stance</span>
                <strong>
                  {stonQuote.signal.routeQualityScore >= 0.8
                    ? "Route supports this plan"
                    : "Keep fallback ready"}
                </strong>
              </div>
            </div>
          ) : (
            <p className="muted">
              STON.fi quote context is unavailable right now, so NEURO is keeping
              this recommendation conservative and leaning harder on fallback rules.
            </p>
          )}
        </motion.section>
      ) : null}

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
