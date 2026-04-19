import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PageWrapper } from "../components/layout/PageWrapper";
import { AmountInput } from "../components/core/AmountInput";
import { GoalSelector } from "../components/core/GoalSelector";
import { FlexibilitySelector } from "../components/core/FlexibilitySelector";
import { RiskSelector } from "../components/core/RiskSelector";
import { StickyActionBar } from "../components/core/StickyActionBar";
import { usePlanPreview } from "../hooks/usePlanPreview";
import { useStonQuote } from "../hooks/useStonQuote";
import { useAppStore } from "../store/appStore";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

export function PlanSelectorScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
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

  const goNext = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

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

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            key="step0"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.3 }}
            className="page-stack"
            style={{ width: "100%", padding: "0 10px" }}
          >
            <div className="center-stack stack-xs" style={{ marginBottom: "20px" }}>
              <span className="eyebrow" style={{ display: "inline-block", marginBottom: "4px" }}>Step 1 of {goal === "protect" ? "2" : "3"}</span>
              <h1 className="headline-sm">How much TON?</h1>
              <p className="muted" style={{ marginTop: "4px" }}>Enter the amount you'd like to put to work safely.</p>
            </div>
            <AmountInput value={amountTon} onChange={setAmountTon} />
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            key="step1"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.3 }}
            className="page-stack"
            style={{ width: "100%", padding: "0 10px" }}
          >
            <div className="center-stack stack-xs" style={{ marginBottom: "20px" }}>
              <span className="eyebrow" style={{ display: "inline-block", marginBottom: "4px" }}>Step 2 of {goal === "protect" ? "2" : "3"}</span>
              <h1 className="headline-sm">Choose your goal</h1>
              <p className="muted" style={{ marginTop: "4px" }}>Protect keeps it safe. Earn & Grow explore higher yields.</p>
            </div>
            <GoalSelector value={goal} onChange={setGoal} />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.3 }}
            className="page-stack"
            style={{ width: "100%", padding: "0 10px" }}
          >
            <div className="center-stack stack-xs" style={{ marginBottom: "20px" }}>
              <span className="eyebrow" style={{ display: "inline-block", marginBottom: "4px" }}>Step 3 of 3</span>
              <h1 className="headline-sm">Tailor your strategy</h1>
              <p className="muted" style={{ marginTop: "4px" }}>Adjust risk and flexibility for your growth targets.</p>
            </div>
            <FlexibilitySelector value={wantsFlexibility} onChange={setWantsFlexibility} />
            <RiskSelector value={riskPreference} onChange={setRiskPreference} />
            
            {stonQuote.isLoading ? (
              <p className="muted center-stack" style={{ marginTop: "16px", fontSize: "0.85rem" }}>Checking live route quality...</p>
            ) : stonQuote.routeQualityScore !== null ? (
              <p className="center-stack" style={{ marginTop: "16px", fontSize: "0.85rem", color: "var(--success)" }}>
                STON.fi Route Quality: {(stonQuote.routeQualityScore * 100).toFixed(0)}/100
              </p>
            ) : null}
          </motion.div>
        );
      default:
        return null;
    }
  };

  const isFinalStep = (step === 1 && goal === "protect") || step === 2;

  return (
    <PageWrapper className="screen-frame" style={{ justifyContent: "center", paddingTop: "24px" }}>
      <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
        <AnimatePresence mode="wait" custom={direction}>
          {renderStep()}
        </AnimatePresence>
      </div>

      <StickyActionBar
        primaryLabel={
          previewMutation.isPending
            ? "Preparing..."
            : isFinalStep
            ? "Generate my plan"
            : "Continue"
        }
        secondaryLabel={step === 0 ? "Cancel" : "Back"}
        onPrimaryClick={isFinalStep ? handleGeneratePlan : goNext}
        onSecondaryClick={step === 0 ? () => navigate("/") : goBack}
        disabled={previewMutation.isPending || (step === 0 && amountTon <= 0)}
        helper={
          previewMutation.isPending
            ? "Checking route quality and limits..."
            : isFinalStep 
            ? `Ready to generate ${goal} plan` 
            : "Review options"
        }
      />
    </div>
  );
}
