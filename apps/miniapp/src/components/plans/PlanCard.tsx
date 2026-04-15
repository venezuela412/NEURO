import type { FeePreview, PlanRecommendation } from "@neuro/shared";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface PlanCardProps {
  recommendation: PlanRecommendation;
  feePreview: FeePreview;
}

export function PlanCard({ recommendation, feePreview }: PlanCardProps) {
  const { plan } = recommendation;

  return (
    <motion.section
      className="card card-emphasis"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="pill-row">
        <span className="pill pill-accent">{plan.risk} risk</span>
        <span className="pill">
          {recommendation.estimatedAnnualRange.low}% to {recommendation.estimatedAnnualRange.high}% est. yearly
        </span>
      </div>

      <div className="stack-sm">
        <div className="stack-xs">
          <h2>{plan.title}</h2>
          <p className="muted">{plan.subtitle}</p>
        </div>
        <p>{plan.framing}</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Estimated monthly income</span>
          <strong>
            {recommendation.estimatedMonthlyIncomeTon.low.toFixed(2)} to{" "}
            {recommendation.estimatedMonthlyIncomeTon.high.toFixed(2)} TON
          </strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">Flexibility</span>
          <strong>{plan.flexibility}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">Estimated NEURO fee</span>
          <strong>{feePreview.estimatedFeeTon.toFixed(2)} TON</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">Net estimated value</span>
          <strong>{feePreview.estimatedNetValueTon.toFixed(2)} TON</strong>
        </div>
      </div>

      <div className="reason-list">
        <div className="reason-item">
          <Sparkles size={16} />
          <div>
            <strong>What NEURO will do</strong>
            <p>{recommendation.executionPreview}</p>
          </div>
        </div>
        <div className="reason-item">
          <Shield size={16} />
          <div>
            <strong>Safety fallback</strong>
            <p>{recommendation.fallbackLabel}</p>
          </div>
        </div>
        <div className="reason-item">
          <ArrowRight size={16} />
          <div>
            <strong>Why this fits</strong>
            <p>{recommendation.reasons.join(" ")}</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
