import { Omniston } from "@ston-fi/omniston-sdk-react";
import { useAppStore } from "../store/appStore";

function getOmnistonUrl() {
  if (import.meta.env.VITE_STONFI_API_URL) {
    return import.meta.env.VITE_STONFI_API_URL;
  }

  return useAppStore.getState().isTestnet
    ? "wss://omni-ws-sandbox.ston.fi"
    : "wss://omni-ws.ston.fi";
}

export function createOmnistonClient() {
  return new Omniston({
    apiUrl: getOmnistonUrl(),
  });
}
