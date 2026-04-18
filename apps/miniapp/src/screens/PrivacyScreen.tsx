import { Link } from "react-router-dom";

export function PrivacyScreen() {
  return (
    <div className="card page-stack">
      <h1 className="headline-sm">Privacy Policy</h1>
      <p className="body-copy muted">
        NEURO respects your privacy. By using our Telegram Mini App, you agree to
        our internal data handling guidelines.
      </p>

      <h2 className="title text-base mt-4 font-semibold text-white">1. Data Minimization</h2>
      <p className="body-copy muted">
        We prioritize retaining as little sensitive information as possible.
        Your wallet addresses and balances are publicly available on the
        blockchain and read directly via TonAPI.
      </p>

      <h2 className="title text-base mt-4 font-semibold text-white">2. Telegram Context</h2>
      <p className="body-copy muted">
        We use the Telegram Web Apps SDK to contextualize your session. We receive
        your user ID and language code in order to tailor the experience, but we
        do not link your Telegram account to your blockchain identity for tracking
        purposes outside this service.
      </p>

      <h2 className="title text-base mt-4 font-semibold text-white">3. Third Party Services</h2>
      <p className="body-copy muted">
        To fulfill your execution routing, we communicate with external smart
        contract APIs like STON.fi or Tonstakers, as well as the TON blockchain RPC
        nodes. Refer to their respective privacy policies to understand their
        data practices.
      </p>

      <div className="mt-8 flex justify-end">
        <Link className="button button-secondary" to="/">
          Back
        </Link>
      </div>
    </div>
  );
}
