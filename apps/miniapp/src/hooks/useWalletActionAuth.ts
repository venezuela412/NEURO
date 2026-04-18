import { useCallback, useState } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import type { SignedActionProof, WalletSession } from "@neuro/shared";
import { createWalletActionSession } from "../lib/controlPlane";
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
  ensureSession: (proof?: SignedActionProof) => Promise<WalletSession>;
  session: WalletSession | null;
}

function buildNonce() {
  return crypto.randomUUID();
}

function isSessionFresh(expiresAt: string, minimumMsRemaining = 15_000) {
  const expiresAtMs = Date.parse(expiresAt);
  return Number.isFinite(expiresAtMs) && expiresAtMs > globalThis.Date.now() + minimumMsRemaining;
}

export function useWalletActionAuth(): WalletActionAuthController {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useNeuroWallet();
  const [session, setSession] = useState<WalletSession | null>(null);

  const signAction = useCallback(
    async (action: string, payload: string): Promise<SignedActionProof> => {
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
        publicKey: tonConnectUI.account?.publicKey,
        walletStateInit: tonConnectUI.account?.walletStateInit,
        timestamp: result.timestamp,
        domain: result.domain,
        signature: result.signature,
        payload: {
          type: "text",
          text: message,
        },
      };
    },
    [tonConnectUI, wallet.address],
  );

  const ensureSession = useCallback(
    async (providedProof?: SignedActionProof): Promise<WalletSession> => {
      if (!wallet.address) {
        throw new Error("Wallet address is required");
      }

      if (session && session.walletAddress === wallet.address && isSessionFresh(session.expiresAt)) {
        return session;
      }

      const proof = providedProof ?? (await signAction("session", wallet.address));
      const nextSession = await createWalletActionSession(proof);
      setSession(nextSession);
      return nextSession;
    },
    [session, signAction, wallet.address],
  );

  return {
    signAction,
    ensureSession,
    session,
  };
}
