import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { PortfolioSyncBridge } from "../components/core/PortfolioSyncBridge";

const TON_MANIFEST_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/tonconnect-manifest.json`
    : "https://example.com/tonconnect-manifest.json";

export function AppProviders({ children }: PropsWithChildren) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <TonConnectUIProvider
      manifestUrl={TON_MANIFEST_URL}
      language="en"
      restoreConnection
      actionsConfiguration={{ twaReturnUrl: "https://t.me" }}
      walletsPreferredFeatures={{
        sendTransaction: {
          minMessages: 1,
        },
      }}
      analytics={{ mode: "off" }}
    >
      <QueryClientProvider client={queryClient}>
        <PortfolioSyncBridge />
        {children}
      </QueryClientProvider>
    </TonConnectUIProvider>
  );
}
