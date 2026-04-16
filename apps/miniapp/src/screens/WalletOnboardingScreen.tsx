import { ExternalLink, ShieldCheck, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StickyActionBar } from "../components/core/StickyActionBar";

const walletOptions = [
  {
    name: "TON Space",
    description: "Simple, familiar, and tightly connected to Telegram-first TON usage.",
    url: "https://wallet.ton.org/",
  },
  {
    name: "Tonkeeper",
    description: "A popular TON wallet with a clear setup flow for new users.",
    url: "https://tonkeeper.com/",
  },
];

export function WalletOnboardingScreen() {
  const navigate = useNavigate();

  return (
    <div className="page-stack">
      <section className="hero-card">
        <span className="eyebrow">New to TON?</span>
        <h1 className="headline">Start here and come back in a minute.</h1>
        <p className="lead-copy">
          NEURO helps after you have a TON wallet. Pick one below, create it, secure your recovery
          phrase, get some TON, then return to activate an income plan.
        </p>
      </section>

      <section className="card">
        <div className="section-intro section-intro--row">
          <div>
            <span className="eyebrow">Step guide</span>
            <h2>A smooth way in</h2>
          </div>
          <Wallet />
        </div>

        <ol className="step-list">
          <li>
            <strong>Choose a wallet</strong>
            <span>Pick a trusted TON wallet that feels comfortable on mobile.</span>
          </li>
          <li>
            <strong>Create it carefully</strong>
            <span>Write down your recovery phrase and keep it somewhere safe and offline.</span>
          </li>
          <li>
            <strong>Add TON</strong>
            <span>Buy, receive, or transfer TON into the wallet before returning to NEURO.</span>
          </li>
          <li>
            <strong>Connect and continue</strong>
            <span>Once connected, NEURO can generate a plan in clear human language.</span>
          </li>
        </ol>
      </section>

      <section className="feature-grid">
        {walletOptions.map((walletOption) => (
          <a
            key={walletOption.name}
            className="card link-card"
            href={walletOption.url}
            target="_blank"
            rel="noreferrer"
          >
            <div className="section-intro section-intro--row">
              <div>
                <h3>{walletOption.name}</h3>
                <p className="muted">{walletOption.description}</p>
              </div>
              <ExternalLink />
            </div>
          </a>
        ))}
      </section>

      <section className="card">
        <div className="section-intro section-intro--row">
          <div>
            <span className="eyebrow">Safety first</span>
            <h2>Protect your recovery phrase</h2>
          </div>
          <ShieldCheck />
        </div>
        <p className="muted">
          NEURO will never ask for your recovery phrase. Keep it private. Whoever has it can control
          your wallet.
        </p>
      </section>

      <StickyActionBar
        primaryLabel="Continue to plans"
        secondaryLabel="Back"
        onPrimaryClick={() => navigate("/plans")}
        onSecondaryClick={() => navigate("/")}
        helper="You can connect a wallet anytime from the top-right button."
      />
    </div>
  );
}
