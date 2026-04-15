import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp } from "lucide-react";
import { ExecutionStatusCard } from "../components/core/ExecutionStatusCard";
import { PortfolioSummary } from "../components/portfolio/PortfolioSummary";
import { StickyActionBar } from "../components/core/StickyActionBar";
import { useAppStore } from "../store/appStore";

export function ActivePlanScreen() {
  const navigate = useNavigate();
  const portfolio = useAppStore((state) => state.portfolio);
  const executionStatus = useAppStore((state) => state.executionStatus);
  const executionReceipt = useAppStore((state) => state.executionReceipt);

  if (!portfolio) {
    return (
      <section className="card page-stack center-stack">
        <h1 className="headline-sm">No active plan yet</h1>
        <p className="muted">Create a plan first to see your live income mode here.</p>
        <Link className="button button-primary" to="/plans">
          Build my plan
        </Link>
      </section>
    );
  }

  return (
    <>
      <motion.section
        className="page-stack"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="hero-card">
          <div className="pill-row">
            <span className="pill pill-success">
              <ShieldCheck size={14} />
              Active
            </span>
            <span className="pill">
              <TrendingUp size={14} />
              {portfolio.currentModeLabel}
            </span>
          </div>
          <h1>Your TON is working for you</h1>
          <p className="lead-copy">
            See your current mode, estimated income, platform fee preview, and
            the latest safety-aware adjustment.
          </p>
        </div>

        <ExecutionStatusCard status={executionStatus} />
        <PortfolioSummary portfolio={portfolio} />

        <div className="feature-grid">
          <section className="card">
            <h3>Last optimization</h3>
            <p className="muted">{portfolio.lastOptimizationLabel}</p>
          </section>
          <section className="card">
            <h3>Safety fallback</h3>
            <p className="muted">
              If route quality weakens, NEURO can guide this plan into a calmer
              mode before you take on more movement than intended.
            </p>
          </section>
          <section className="card">
            <h3>Current branch scope</h3>
            <p className="muted">
              This phase captures real wallet approval, Tonstakers Safe Income
              request staging, and portfolio updates. Deeper reconciliation is the
              next implementation layer.
            </p>
          </section>
          {executionReceipt ? (
            <section className="card">
              <h3>Latest execution receipt</h3>
              <p className="muted">{executionReceipt.summary}</p>
              <p className="muted">
                Mode: {executionReceipt.mode}{" "}
                {executionReceipt.address ? `· Address: ${executionReceipt.address}` : ""}
              </p>
            </section>
          ) : null}
        </div>
      </motion.section>

      <StickyActionBar
        primaryLabel="View activity"
        secondaryLabel="Build another plan"
        onPrimaryClick={() => navigate("/activity")}
        onSecondaryClick={() => navigate("/plans")}
        helper={`Available to withdraw now: ${portfolio.availableToWithdrawTon.toFixed(2)} TON`}
      />
    </>
  );
}
