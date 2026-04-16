import { Omniston } from "@ston-fi/omniston-sdk-react";

function getOmnistonUrl() {
  if (import.meta.env.VITE_STONFI_API_URL) {
    return import.meta.env.VITE_STONFI_API_URL;
  }

  return import.meta.env.VITE_TON_NETWORK === "testnet"
    ? "wss://omni-ws-sandbox.ston.fi"
    : "wss://omni-ws.ston.fi";
}

export function createOmnistonClient() {
  return new Omniston({
    apiUrl: getOmnistonUrl(),
  });
}
