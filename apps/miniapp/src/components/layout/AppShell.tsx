import { ArrowLeft, BellDot, FlaskConical } from "lucide-react";
import { type PropsWithChildren, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { TonConnectButton } from "@tonconnect/ui-react";
import { APP_NAME } from "@neuro/shared";
import { AnimatePresence, motion } from "framer-motion";
import { useTelegramEnv } from "../../hooks/useTelegramEnv";
import { useNeuroWallet } from "../../hooks/useTonWallet";
import { useAppStore } from "../../store/appStore";
import { useHaptics } from "../../hooks/useHaptics";
import clsx from "clsx";

const navItems = [
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
  const { impactLight } = useHaptics();

  const isOnboarding = location.pathname === "/";
  const canGoBack = !isOnboarding && location.pathname !== "/plans";

  useEffect(() => {
    setHasWallet(wallet.connected);
  }, [setHasWallet, wallet.connected]);

  // Onboarding: full-bleed, no chrome
  if (isOnboarding) {
    return (
      <div className={clsx("app-shell", !telegramEnv.isTelegram && "browser-mode")}>
        <main className="onboarding-frame">
          {children}
        </main>
      </div>
    );
  }

  // Normal app pages: header + scrollable content + bottom nav
  return (
    <div className={clsx("app-shell", !telegramEnv.isTelegram && "browser-mode")}>
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
            <div className={clsx("brand-badge", isTestnet && "bg-amber-600")} aria-hidden="true">
              N
            </div>
          )}

          <div className="brand-text">
            <Link to="/plans" className="brand-link">
              {APP_NAME}
              {isTestnet && <span className="testnet-badge">Testnet</span>}
            </Link>
            <p className="header-subtitle">
              {titles[location.pathname] ?? "Put your TON to work"}
            </p>
          </div>
        </div>

        <div className="app-header-right">
          <button
            type="button"
            className={clsx("icon-button", isTestnet ? "text-amber-500" : "icon-button-muted")}
            aria-label="Toggle Testnet"
            onClick={() => setIsTestnet(!isTestnet)}
          >
            <FlaskConical size={18} />
          </button>
          <div className="wallet-slot">
            <TonConnectButton className="wallet-button" />
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <main className="screen-frame" key={location.pathname}>
          {children}
        </main>
      </AnimatePresence>

      <nav className="bottom-nav" aria-label="Primary">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={() => {
                if (!isActive) impactLight();
              }}
              className={clsx(
                "bottom-nav-item relative overflow-hidden",
                isActive ? "text-white" : "text-[var(--text-muted)] hover:text-white/80"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-white/10 rounded-[16px]"
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
