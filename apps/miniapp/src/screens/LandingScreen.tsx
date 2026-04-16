import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { APP_TAGLINE } from "@neuro/shared";
import { useTelegramEnv } from "../hooks/useTelegramEnv";

export function LandingScreen() {
  const navigate = useNavigate();
  const telegramEnv = useTelegramEnv();

  return (
    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-hero-inner">
        <p className="landing-kicker">Welcome to NEURO</p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="landing-hero-content"
        >
          <h1 id="landing-title" className="headline landing-headline">
            {APP_TAGLINE}
          </h1>
          <p className="landing-sub">
            Pick a simple goal. We recommend one calm plan — you stay in control with your wallet.
          </p>

          <div className="goal-chips" role="list" aria-label="Goals">
            {(["Protect", "Earn", "Grow"] as const).map((label) => (
              <span key={label} className="goal-chip" role="listitem">
                {label}
              </span>
            ))}
          </div>

          <div className="landing-actions">
            <button type="button" className="button button-primary landing-cta-primary" onClick={() => navigate("/plans")}>
              Start with your plan
            </button>
            <button
              type="button"
              className="button button-secondary landing-cta-secondary"
              onClick={() => navigate("/onboarding")}
            >
              New to TON?
            </button>
          </div>

          <p className="landing-footnote muted">
            {telegramEnv.isTelegram ? "Running in Telegram" : "Open in Telegram for the full experience"} · Fees only
            apply when your plan is in profit
          </p>
        </motion.div>
      </div>
    </section>
  );
}
