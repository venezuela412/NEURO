import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AmountInput } from "../components/core/AmountInput";
import { GoalSelector } from "../components/core/GoalSelector";
import { FlexibilitySelector } from "../components/core/FlexibilitySelector";
import { RiskSelector } from "../components/core/RiskSelector";
import { StickyActionBar } from "../components/core/StickyActionBar";
import { usePlanPreview } from "../hooks/usePlanPreview";
import { useStonQuote } from "../hooks/useStonQuote";
import { useAppStore } from "../store/appStore";

export function PlanSelectorScreen() {
  const navigate = useNavigate();
  const {
    amountTon,
    goal,
    wantsFlexibility,
    riskPreference,
    hasWallet,
    setAmountTon,
    setGoal,
    setWantsFlexibility,
    setRiskPreference,
    applyPlanPreview,
    setExecutionStatus,
    setRouteQualityScore,
  } = useAppStore();
  const previewMutation = usePlanPreview();
  const stonQuote = useStonQuote({
    amountTon,
    goal,
    enabled: goal !== "protect" && amountTon > 0,
  });

  const handleGeneratePlan = async () => {
    setExecutionStatus("preparing");
    if (stonQuote.routeQualityScore !== null) {
      setRouteQualityScore(stonQuote.routeQualityScore);
    }
    const preview = await previewMutation.mutateAsync({
      amountTon,
      goal,
      wantsFlexibility,
      riskPreference,
      hasWallet,
    });
    applyPlanPreview(preview);
    navigate("/result");
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="card page-stack"
      >
        <div className="section-intro">
          <span className="eyebrow">Choose your goal</span>
          <h1 className="headline">Tell NEURO what you want from your TON.</h1>
          <p className="muted">
            Keep it simple: add an amount, pick Protect, Earn, or Grow, and let
            NEURO build a recommended plan around that.
          </p>
        </div>

        <AmountInput value={amountTon} onChange={setAmountTon} />
        <GoalSelector value={goal} onChange={setGoal} />
        <FlexibilitySelector value={wantsFlexibility} onChange={setWantsFlexibility} />
        <RiskSelector value={riskPreference} onChange={setRiskPreference} />

        <div className="card muted-surface">
          <p className="eyebrow">What you will see next</p>
          <ul className="bullet-list muted">
            <li>A recommended income plan in plain English</li>
            <li>Estimated annual and monthly outcome ranges</li>
            <li>What NEURO may do internally and how safety fallback works</li>
            <li>Estimated platform fee, only if your plan is in profit</li>
          </ul>
        </div>

        {goal !== "protect" ? (
          <div className="card muted-surface">
            <p className="eyebrow">Live route signal</p>
            {stonQuote.isLoading ? (
              <p className="muted">
                Checking live STON.fi route quality for a stronger income path...
              </p>
            ) : stonQuote.routeQualityScore !== null ? (
              <p className="muted">
                Current STON route quality signal:{" "}
                <strong>{(stonQuote.routeQualityScore * 100).toFixed(0)}/100</strong>.
                NEURO uses this to stay more conservative when route quality weakens.
              </p>
            ) : (
              <p className="muted">
                Live route data is not available right now, so NEURO will fall back
                to conservative rule-based route quality assumptions.
              </p>
            )}
          </div>
        ) : null}
      </motion.section>

      <StickyActionBar
        primaryLabel={previewMutation.isPending ? "Preparing your plan..." : "Generate my plan"}
        secondaryLabel="Back"
        onPrimaryClick={handleGeneratePlan}
        onSecondaryClick={() => navigate("/")}
        disabled={previewMutation.isPending || amountTon <= 0}
        helper={
          previewMutation.isPending
            ? "Checking route quality, fee impact, and safer fallback options."
            : `Preparing a ${goal} recommendation for ${amountTon.toFixed(2)} TON`
        }
      />
    </>
  );
}
