import { useMemo } from "react";
import { getMockTelegramEnvironment } from "@neuro/adapters";

export function useTelegramEnv() {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return {
        ...getMockTelegramEnvironment(),
        isTelegram: false,
      };
    }

    const telegram = (window as Window & { Telegram?: { WebApp?: { colorScheme?: "light" | "dark" } } })
      .Telegram?.WebApp;

    return {
      platform: telegram ? "telegram" : "browser",
      colorScheme: telegram?.colorScheme ?? "dark",
      isExpanded: true,
      isTelegram: Boolean(telegram),
    };
  }, []);
}
