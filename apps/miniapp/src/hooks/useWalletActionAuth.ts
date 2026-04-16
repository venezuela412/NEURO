import { useTonConnectUI } from "@tonconnect/ui-react";
import type { SignedActionProof } from "@neuro/shared";
import { useNeuroWallet } from "./useTonWallet";

function getTonNetwork() {
  return import.meta.env.VITE_TON_NETWORK === "testnet" ? "-3" : "-239";
}

function getDomain() {
  if (typeof window === "undefined") {
    return "localhost";
  }

  return window.location.hostname;
}

interface WalletActionAuthController {
  signAction: (action: string, payload: string) => Promise<SignedActionProof>;
}

function buildNonce() {
  return crypto.randomUUID();
}

export function useWalletActionAuth(): WalletActionAuthController {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useNeuroWallet();

  async function signAction(action: string, payload: string): Promise<SignedActionProof> {
    if (!wallet.address) {
      throw new Error("Wallet address is required");
    }

    const nonce = buildNonce();
    const message = [
      "NEURO protected action",
      `Action: ${action}`,
      `Payload: ${payload}`,
      `Nonce: ${nonce}`,
      `Domain: ${getDomain()}`,
    ].join("\n");

    const result = await tonConnectUI.signData({
      type: "text",
      text: message,
      network: getTonNetwork(),
      from: wallet.address,
    });

    return {
      action,
      nonce,
      walletAddress: result.address,
      timestamp: result.timestamp,
      domain: result.domain,
      signature: result.signature,
      payload: {
        type: "text",
        text: message,
      },
    };
  }

  return {
    signAction,
  };
}
