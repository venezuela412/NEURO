import { useEffect, useState } from "react";

interface TelegramWebApp {
  platform?: string;
  colorScheme?: "light" | "dark";
  isExpanded?: boolean;
}

export interface TelegramEnvironmentState {
  isTelegram: boolean;
  platform: string;
  colorScheme: "light" | "dark";
  isExpanded: boolean;
}

function getBrowserFallback(): TelegramEnvironmentState {
  const prefersDark =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return {
    isTelegram: false,
    platform: "browser",
    colorScheme: prefersDark ? "dark" : "light",
    isExpanded: true,
  };
}

export function useTelegramEnv() {
  const [env, setEnv] = useState<TelegramEnvironmentState>(() =>
    typeof window === "undefined"
      ? { isTelegram: false, platform: "server", colorScheme: "dark", isExpanded: true }
      : getBrowserFallback(),
  );

  useEffect(() => {
    const telegram = (window as Window & { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;

    if (!telegram) {
      setEnv(getBrowserFallback());
      return;
    }

    setEnv({
      isTelegram: true,
      platform: telegram.platform ?? "telegram",
      colorScheme: telegram.colorScheme ?? "dark",
      isExpanded: telegram.isExpanded ?? true,
    });
  }, []);

  return env;
}
