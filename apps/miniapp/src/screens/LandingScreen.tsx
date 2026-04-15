import { ArrowRight, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "@neuro/shared";
import { StickyActionBar } from "../components/core/StickyActionBar";
import { useTelegramEnv } from "../hooks/useTelegramEnv";

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Simple plans, not DeFi jargon",
    text: "Choose Protect, Earn, or Grow. NEURO handles the complexity under the hood.",
  },
  {
    icon: Sparkles,
    title: "Income autopilot with safety rules",
    text: "NEURO tracks route quality, preserves gas, and keeps a calmer fallback ready.",
  },
  {
    icon: Wallet,
    title: "Built for Telegram and TON",
    text: "Compact, mobile-first, and ready for real wallet connection inside a familiar flow.",
  },
];

export function LandingScreen() {
  const navigate = useNavigate();
  const telegramEnv = useTelegramEnv();

  return (
    <>
      <section className="hero-card">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="page-stack"
        >
          <span className="eyebrow">Telegram-native passive income for TON</span>
          <h1 className="headline">{APP_TAGLINE}</h1>
          <p className="lead-copy">
            {APP_NAME} helps normal people activate an income plan for idle TON
            without learning DeFi, yield routing, or manual position management.
          </p>
          <div className="badge-row">
            <span>Protect</span>
            <span>Earn</span>
            <span>Grow</span>
          </div>
          <div className="metrics-grid">
            <div>
              <strong>1 tap intent</strong>
              <span>Goal-first onboarding</span>
            </div>
            <div>
              <strong>Only charged on profit</strong>
              <span>Transparent monetization</span>
            </div>
            <div>
              <strong>{telegramEnv.isTelegram ? "Telegram mode" : "Browser mode"}</strong>
              <span>Theme-aware and mobile-first</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="page-stack">
        <div className="section-intro">
          <span className="eyebrow">Why it feels different</span>
          <h2>Not another crypto dashboard</h2>
          <p className="muted">
            NEURO is built for people who want their TON working quietly in the
            background, with clear outcomes and easy exits.
          </p>
        </div>

        <div className="feature-grid">
          {featureCards.map(({ icon: Icon, title, text }) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="card"
            >
              <Icon size={18} />
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </motion.article>
          ))}
        </div>

        <div className="card split-card">
          <div>
            <span className="eyebrow">New to TON?</span>
            <h3>Start with a wallet guide</h3>
            <p className="muted">
              We recommend a wallet, explain the setup steps, and bring you back
              here to activate your first plan.
            </p>
          </div>
          <Link to="/onboarding" className="inline-link">
            I&apos;m new to TON <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <StickyActionBar
        primaryLabel="Start with your plan"
        secondaryLabel="New to TON?"
        onPrimaryClick={() => navigate("/plans")}
        onSecondaryClick={() => navigate("/onboarding")}
        helper="Choose a goal and see NEURO’s recommendation in under a minute."
      />
    </>
  );
}
