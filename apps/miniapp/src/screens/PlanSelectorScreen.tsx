import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AmountInput } from "../components/core/AmountInput";
import { GoalSelector } from "../components/core/GoalSelector";
import { FlexibilitySelector } from "../components/core/FlexibilitySelector";
import { RiskSelector } from "../components/core/RiskSelector";
import { StickyActionBar } from "../components/core/StickyActionBar";
import { useAppStore } from "../store/appStore";
import { usePlanEngine } from "../hooks/usePlanEngine";

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
    setRecommendation,
    setFeePreview,
    setExecutionStatus,
    generatePlan,
  } = useAppStore();
  const { recommendation, feePreview } = usePlanEngine();

  const handleGeneratePlan = () => {
    generatePlan();
    setRecommendation(recommendation);
    setFeePreview(feePreview);
    setExecutionStatus(hasWallet ? "ready-to-sign" : "idle");
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
      </motion.section>

      <StickyActionBar
        primaryLabel="Generate my plan"
        secondaryLabel="Back"
        onPrimaryClick={handleGeneratePlan}
        onSecondaryClick={() => navigate("/")}
        helper={`Preparing a ${goal} recommendation for ${amountTon.toFixed(2)} TON`}
      />
    </>
  );
}
