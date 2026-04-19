import { ArrowLeft, Pickaxe, LayoutGrid, Activity, HelpCircle, Wallet } from "lucide-react";
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
  { to: "/plans", label: "Earn", icon: Pickaxe },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/active", label: "My Plan", icon: LayoutGrid },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/faq", label: "Help", icon: HelpCircle },
];

const titles: Record<string, string> = {
  "/": "Welcome",
  "/onboarding": "Getting Started",
  "/plans": "Choose how to earn",
  "/wallet": "Your wallet",
  "/result": "Your recommended plan",
  "/active": "Your active plan",
  "/activity": "Activity log",
  "/faq": "Help & FAQ",
};

export function AppShell({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();
  const wallet = useNeuroWallet();
  const telegramEnv = useTelegramEnv();
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
            <div className="brand-badge" aria-hidden="true">
              N
            </div>
          )}

          <div className="brand-text">
            <Link to="/plans" className="brand-link">
              {APP_NAME}
            </Link>
            <p className="header-subtitle">
              {titles[location.pathname] ?? "Put your TON to work"}
            </p>
          </div>
        </div>

        <div className="app-header-right">
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
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={() => {
                if (!isActive) impactLight();
              }}
              className={clsx(
                "bottom-nav-item",
                isActive && "bottom-nav-item--active"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="bottom-nav-pill"
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                />
              )}
              <Icon size={18} className="bottom-nav-icon" />
              <span className="bottom-nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
