import { useEffect } from "react";

interface TelegramWebApp {
  platform?: string;
  colorScheme?: "light" | "dark";
  isExpanded?: boolean;
  themeParams?: Record<string, string>;
  ready?: () => void;
  expand?: () => void;
}

function toCssVarName(value: string) {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

export function TelegramBridge() {
  useEffect(() => {
    const webApp = (window as Window & { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;

    if (!webApp) {
      return;
    }

    webApp.ready?.();
    webApp.expand?.();

    document.documentElement.dataset.telegram = "true";
    document.documentElement.dataset.telegramTheme = webApp.colorScheme ?? "dark";

    Object.entries(webApp.themeParams ?? {}).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--tg-theme-${toCssVarName(key)}`, value);
    });
  }, []);

  return null;
}
