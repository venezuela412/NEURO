import { Link, useNavigate } from "react-router-dom";
import { APP_TAGLINE } from "@neuro/shared";

export function LandingScreen() {
  const navigate = useNavigate();

  return (
    <section className="landing-minimal" aria-labelledby="landing-title">
      <h1 id="landing-title" className="landing-minimal-title">
        {APP_TAGLINE}
      </h1>
      <p className="landing-minimal-line muted">Simple income plans for your TON.</p>
      <button type="button" className="button button-primary landing-minimal-cta" onClick={() => navigate("/plans")}>
        Start
      </button>
      <p className="landing-minimal-foot">
        <Link to="/onboarding" className="landing-minimal-link">
          New to TON?
        </Link>
      </p>
    </section>
  );
}
