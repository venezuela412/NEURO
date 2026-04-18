import { Link } from "react-router-dom";

export function TermsScreen() {
  return (
    <div className="card page-stack">
      <h1 className="headline-sm">Terms of Service</h1>
      <p className="body-copy muted">
        Welcome to NEURO. By accessing or using our frontend interface, you
        agree to these Terms of Service.
      </p>

      <h2 className="title text-base mt-4 font-semibold text-white">1. Nature of the Service</h2>
      <p className="body-copy muted">
        NEURO provides a web application (interface) that facilitates
        your interaction with autonomous smart contracts on the TON blockchain
        (like STON.fi, Tonstakers, among others). We are not a broker,
        financial institution, or creditor. We do not provide financial advice.
      </p>

      <h2 className="title text-base mt-4 font-semibold text-white">2. Non-Custodial</h2>
      <p className="body-copy muted">
        NEURO is entirely non-custodial. You are solely responsible for the custody
        of your cryptographic keys. At no point do we have access to your private
        keys or your funds.
      </p>

      <h2 className="title text-base mt-4 font-semibold text-white">3. Risks of Smart Contracts</h2>
      <p className="body-copy muted">
        Operating with smart contracts entails risks, including but not limited to
        bugs, hacks, or total loss of funds. Any Projected APY is variable and
        past returns are not indicative of future performance.
      </p>

      <div className="mt-8 flex justify-end">
        <Link className="button button-secondary" to="/">
          Back
        </Link>
      </div>
    </div>
  );
}
