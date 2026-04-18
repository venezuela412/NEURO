import { ArrowLeft, BellDot, FlaskConical } from "lucide-react";
import { type PropsWithChildren, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { TonConnectButton } from "@tonconnect/ui-react";
import { APP_NAME } from "@neuro/shared";
import { useTelegramEnv } from "../../hooks/useTelegramEnv";
import { useNeuroWallet } from "../../hooks/useTonWallet";
import { useAppStore } from "../../store/appStore";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/plans", label: "Build" },
  { to: "/active", label: "Plan" },
  { to: "/activity", label: "Activity" },
];

const titles: Record<string, string> = {
  "/": "Home",
  "/onboarding": "New to TON?",
  "/plans": "Choose your goal",
  "/result": "Your recommended plan",
  "/active": "Your active plan",
  "/activity": "Activity feed",
};

export function AppShell({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();
  const wallet = useNeuroWallet();
  const telegramEnv = useTelegramEnv();
  const isTestnet = useAppStore((state) => state.isTestnet);
  const setIsTestnet = useAppStore((state) => state.setIsTestnet);
  const setHasWallet = useAppStore((state) => state.setHasWallet);
  const canGoBack = location.pathname !== "/";

  useEffect(() => {
    setHasWallet(wallet.connected);
  }, [setHasWallet, wallet.connected]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-left">
          {canGoBack ? (
            <button
              type="button"
              className="icon-button"
              aria-label="Go back"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <div className={`brand-badge ${isTestnet ? 'bg-amber-600' : ''}`} aria-hidden="true">
              N
            </div>
          )}

          <div className="brand-text">
            <Link to="/" className="brand-link flex items-center gap-2">
              {APP_NAME}
              {isTestnet && <span className="text-[10px] bg-amber-600/20 text-amber-500 px-1.5 py-0.5 rounded uppercase font-bold">Testnet</span>}
            </Link>
            {location.pathname !== "/" ? (
              <p className="header-subtitle">
                {titles[location.pathname] ?? "Put your TON to work"}{" "}
                · <span className="header-env">{telegramEnv.platform}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="app-header-right">
          <button 
            type="button" 
            className={`icon-button ${isTestnet ? 'text-amber-500' : 'icon-button-muted'}`} 
            aria-label="Toggle Testnet"
            onClick={() => setIsTestnet(!isTestnet)}
          >
            <FlaskConical size={18} />
          </button>
          <button type="button" className="icon-button icon-button-muted" aria-label="Alerts">
            <BellDot size={18} />
          </button>
          <div className="wallet-slot">
            {wallet.connected ? <span className="wallet-pill">{wallet.walletName}</span> : null}
            <TonConnectButton className="wallet-button" />
          </div>
        </div>
      </header>

      <main className="screen-frame">{children}</main>

      <nav className="bottom-nav" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => (isActive ? "bottom-nav-item active" : "bottom-nav-item")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
