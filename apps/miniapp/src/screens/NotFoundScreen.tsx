import { Link } from "react-router-dom";

export function NotFoundScreen() {
  return (
    <div className="card page-stack center-stack">
      <span className="eyebrow">Lost your route</span>
      <h1 className="headline-sm">This plan page does not exist.</h1>
      <p className="muted">
        Head back to NEURO and we will get your TON back on a clear path.
      </p>
      <Link className="button button-primary" to="/">
        Return home
      </Link>
    </div>
  );
}
