import { Shield, Sparkles } from "lucide-react";
import { TonConnectButton } from "@tonconnect/ui-react";
import { APP_NAME } from "@neuro/shared";

export function TopBar() {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <Sparkles size={16} />
        </div>
        <div>
          <p className="eyebrow">Telegram-native TON income</p>
          <h1 className="brand-title">{APP_NAME}</h1>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="safety-pill">
          <Shield size={14} />
          Safety first
        </div>
        <TonConnectButton className="wallet-button" />
      </div>
    </header>
  );
}
