import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "@neuro/shared";
import { StickyActionBar } from "../components/core/StickyActionBar";
import { useNeuroOverview } from "../hooks/useNeuroOverview";
import { useTelegramEnv } from "../hooks/useTelegramEnv";

export function LandingScreen() {
  const navigate = useNavigate();
  const telegramEnv = useTelegramEnv();
  const { data: overview } = useNeuroOverview();

  return (
    <>
      <section className="welcome-card" aria-labelledby="welcome-heading">
        <p className="welcome-kicker">Welcome</p>
        <h2 id="welcome-heading" className="welcome-title">
          {APP_NAME} is your income plan for TON
        </h2>
        <p className="welcome-lead">
          Connect a wallet when you are ready. Until then, explore a simple plan in under a minute — no DeFi jargon on
          the main path.
        </p>
      </section>

      <section className="hero-card">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="page-stack"
        >
          <span className="eyebrow">Start here</span>
          <h1 className="headline">{APP_TAGLINE}</h1>
          <p className="lead-copy">
            Choose <strong>Protect</strong>, <strong>Earn</strong>, or <strong>Grow</strong>. We turn that into one clear
            plan — with safety rules and fee transparency.
          </p>
          <div className="badge-row">
            <span>Protect</span>
            <span>Earn</span>
            <span>Grow</span>
          </div>
          <p className="landing-meta-line muted">
            <span>Goal-first flow</span>
            <span className="landing-meta-dot" aria-hidden>
              ·
            </span>
            <span>{overview?.platformFeeNotice ?? "Fees only when you are in profit"}</span>
            <span className="landing-meta-dot" aria-hidden>
              ·
            </span>
            <span>{telegramEnv.isTelegram ? "Telegram" : "Browser"}</span>
          </p>
        </motion.div>
      </section>

      <section className="card split-card">
        <div>
          <span className="eyebrow">New to TON?</span>
          <h3 className="split-card-title">Wallet setup</h3>
          <p className="muted">Short guide: choose a wallet, secure your phrase, add TON, then come back.</p>
        </div>
        <Link to="/onboarding" className="inline-link">
          Open guide <ArrowRight size={16} />
        </Link>
      </section>

      <StickyActionBar
        primaryLabel="Start with your plan"
        secondaryLabel="New to TON?"
        onPrimaryClick={() => navigate("/plans")}
        onSecondaryClick={() => navigate("/onboarding")}
        helper="One goal, one recommendation — then connect your wallet to continue."
      />
    </>
  );
}
