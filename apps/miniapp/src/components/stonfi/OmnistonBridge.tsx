import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { Omniston, OmnistonProvider } from "@ston-fi/omniston-sdk-react";

function getOmnistonUrl() {
  if (import.meta.env.VITE_STONFI_API_URL) {
    return import.meta.env.VITE_STONFI_API_URL;
  }

  return import.meta.env.VITE_TON_NETWORK === "testnet"
    ? "wss://omni-ws-sandbox.ston.fi"
    : "wss://omni-ws.ston.fi";
}

export function OmnistonBridge({ children }: PropsWithChildren) {
  const omniston = useMemo(
    () =>
      new Omniston({
        apiUrl: getOmnistonUrl(),
      }),
    [],
  );

  return <OmnistonProvider omniston={omniston}>{children}</OmnistonProvider>;
}
