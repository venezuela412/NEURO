import type { PortfolioSnapshot } from "@neuro/shared";

interface PortfolioSummaryProps {
  portfolio: PortfolioSnapshot;
}

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  return (
    <section className="metrics-grid">
      <article className="metric-card">
        <span className="metric-label">Current estimated value</span>
        <strong>{portfolio.estimatedValueTon.toFixed(2)} TON</strong>
      </article>
      <article className="metric-card">
        <span className="metric-label">Estimated profit</span>
        <strong>{portfolio.estimatedProfitTon.toFixed(2)} TON</strong>
      </article>
      <article className="metric-card">
        <span className="metric-label">Estimated NEURO fee</span>
        <strong>{portfolio.estimatedFeeTon.toFixed(2)} TON</strong>
      </article>
      <article className="metric-card">
        <span className="metric-label">Available to withdraw</span>
        <strong>{portfolio.availableToWithdrawTon.toFixed(2)} TON</strong>
      </article>
    </section>
  );
}
