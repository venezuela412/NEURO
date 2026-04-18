import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";

interface TelegramWebApp {
  platform?: string;
  colorScheme?: "light" | "dark";
  isExpanded?: boolean;
  themeParams?: Record<string, string>;
  initDataUnsafe?: {
    start_param?: string;
  };
  ready?: () => void;
  expand?: () => void;
}

function toCssVarName(value: string) {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

export function TelegramBridge() {
  const navigate = useNavigate();
  const setGoal = useAppStore((state) => state.setGoal);
  const isInitialized = useRef(false);

  useEffect(() => {
    const webApp = (window as Window & { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;

    if (!webApp) {
      // For local testing, you can simulate "?tgWebAppStartParam=plan_safe"
      const params = new URLSearchParams(window.location.search);
      const testParam = params.get("tgWebAppStartParam");
      if (testParam && !isInitialized.current) {
        isInitialized.current = true;
        if (testParam === "plan_safe") setGoal("protect");
        else if (testParam === "plan_balanced") setGoal("earn");
        else if (testParam === "plan_growth") setGoal("grow");
        navigate("/plans");
      }
      return;
    }

    webApp.ready?.();
    webApp.expand?.();

    document.documentElement.dataset.telegram = "true";
    document.documentElement.dataset.telegramTheme = webApp.colorScheme ?? "dark";

    Object.entries(webApp.themeParams ?? {}).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--tg-theme-${toCssVarName(key)}`, value);
    });

    if (webApp.initDataUnsafe?.start_param && !isInitialized.current) {
      isInitialized.current = true;
      const param = webApp.initDataUnsafe.start_param;
      if (param === "plan_safe") setGoal("protect");
      else if (param === "plan_balanced") setGoal("earn");
      else if (param === "plan_growth") setGoal("grow");
      
      // Auto redirect to plans explicitly since they chose a deep link
      navigate("/plans");
    }
  }, [navigate, setGoal]);

  return null;
}
