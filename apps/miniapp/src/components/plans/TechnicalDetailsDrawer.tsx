import type { FeePreview, PlanRecommendation } from "@neuro/shared";

interface TechnicalDetailsDrawerProps {
  recommendation: PlanRecommendation;
  feePreview: FeePreview;
  routeQualityScore: number;
  hasWallet: boolean;
}

export function TechnicalDetailsDrawer({
  recommendation,
  feePreview,
  routeQualityScore,
  hasWallet,
}: TechnicalDetailsDrawerProps) {
  return (
    <details className="technical-drawer">
      <summary>Technical details</summary>
      <div className="technical-grid">
        <section className="technical-block">
          <h3>Plan internals</h3>
          <p>{recommendation.plan.internalBehavior}</p>
        </section>

        <section className="technical-block">
          <h3>Fallback logic</h3>
          <p>{recommendation.plan.fallbackBehavior}</p>
        </section>

        <section className="technical-block">
          <h3>Route and execution</h3>
          <ul className="bullet-list muted">
            <li>Route quality score: {(routeQualityScore * 100).toFixed(0)} / 100</li>
            <li>Wallet connected: {hasWallet ? "Yes" : "No"}</li>
            <li>Execution path: {recommendation.executionPreview}</li>
          </ul>
        </section>

        <section className="technical-block">
          <h3>Fee math</h3>
          <ul className="bullet-list muted">
            <li>Principal: {feePreview.principalTon.toFixed(2)} TON</li>
            <li>Estimated value: {feePreview.estimatedValueTon.toFixed(2)} TON</li>
            <li>Estimated profit: {feePreview.estimatedProfitTon.toFixed(2)} TON</li>
            <li>Estimated NEURO fee: {feePreview.estimatedFeeTon.toFixed(2)} TON</li>
            <li>Net estimated value: {feePreview.estimatedNetValueTon.toFixed(2)} TON</li>
          </ul>
        </section>
      </div>
    </details>
  );
}
