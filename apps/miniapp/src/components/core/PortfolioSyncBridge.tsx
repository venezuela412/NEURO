import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { PersistedPortfolioState, SignedActionProof, WalletSession } from "@neuro/shared";
import {
  fetchPersistedPortfolioState,
  savePersistedPortfolioStateAuthenticated,
} from "../../lib/controlPlane";
import { useWalletActionAuth } from "../../hooks/useWalletActionAuth";
import { useNeuroWallet } from "../../hooks/useTonWallet";
import { useAppStore } from "../../store/appStore";

/** Stable JSON for equality — never include a ticking clock (that caused infinite re-renders / React #185). */
function serializePersistableState(state: PersistedPortfolioState) {
  return JSON.stringify(state, (key, value) => (key === "updatedAt" ? undefined : value));
}

function withPersistTimestamp(state: PersistedPortfolioState): PersistedPortfolioState {
  return { ...state, updatedAt: new Date().toISOString() };
}

/**
 * Build a lightweight proof for state persistence WITHOUT opening the wallet.
 * This is NOT a cryptographic signature — it's a simple integrity token
 * that proves the request came from the app with the user's address.
 * Critical operations (deposits, withdrawals) still require real wallet signing.
 */
function buildSilentPersistProof(walletAddress: string, payload: string): SignedActionProof {
  const nonce = crypto.randomUUID();
  const timestamp = Math.floor(Date.now() / 1000);
  const domain = typeof window !== "undefined" ? window.location.hostname : "localhost";

  return {
    action: "persist-state",
    nonce,
    walletAddress,
    timestamp,
    domain,
    signature: `silent:${nonce}:${timestamp}`, // Not a real sig — server should accept for persist-state only
    payload: {
      type: "text",
      text: [
        "NEURO protected action",
        `Action: persist-state`,
        `Payload: ${payload}`,
        `Nonce: ${nonce}`,
        `Domain: ${domain}`,
      ].join("\n"),
    },
  };
}

interface PersistPortfolioPayload {
  state: PersistedPortfolioState;
  proof: SignedActionProof;
  session?: WalletSession | null;
}

export function PortfolioSyncBridge() {
  const wallet = useNeuroWallet();
  const recommendation = useAppStore((state) => state.recommendation);
  const feePreview = useAppStore((state) => state.feePreview);
  const portfolio = useAppStore((state) => state.portfolio);
  const executionStatus = useAppStore((state) => state.executionStatus);
  const executionReceipt = useAppStore((state) => state.executionReceipt);
  const routeQualityScore = useAppStore((state) => state.routeQualityScore);
  const applyPersistedPortfolioState = useAppStore((state) => state.applyPersistedPortfolioState);
  const setPortfolioHydrating = useAppStore((state) => state.setPortfolioHydrating);
  const { ensureSession } = useWalletActionAuth();

  const lastSerializedRef = useRef<string>("");

  const persistedQuery = useQuery({
    queryKey: ["portfolio-state", wallet.address],
    queryFn: () => fetchPersistedPortfolioState(wallet.address),
    enabled: wallet.connected && Boolean(wallet.address),
    staleTime: 15_000,
  });

  const persistMutation = useMutation({
    mutationFn: async ({ state, proof, session }: PersistPortfolioPayload) =>
      savePersistedPortfolioStateAuthenticated(state, proof, session),
  });

  useEffect(() => {
    setPortfolioHydrating(persistedQuery.isLoading);
  }, [persistedQuery.isLoading, setPortfolioHydrating]);

  useEffect(() => {
    if (!wallet.connected || !wallet.address || !persistedQuery.data) {
      return;
    }

    const serialized = serializePersistableState(persistedQuery.data);
    lastSerializedRef.current = serialized;
    applyPersistedPortfolioState(persistedQuery.data);
  }, [applyPersistedPortfolioState, persistedQuery.data, wallet.address, wallet.connected]);

  // Referral processing logic
  useEffect(() => {
    if (wallet.connected && wallet.address) {
      try {
        const startParam = (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param;
        if (startParam && startParam.startsWith("ref_")) {
          // Don't await, let it process in background
          fetch(`/api/users/${wallet.address}/referral`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ referralCode: startParam })
          }).catch(console.error);
        }
      } catch (e) {
        console.error("Failed to process referral", e);
      }
    }
  }, [wallet.connected, wallet.address]);

  const currentState = useMemo<PersistedPortfolioState | null>(() => {
    if (!wallet.connected || !wallet.address) {
      return null;
    }

    return {
      walletAddress: wallet.address,
      recommendation,
      feePreview,
      portfolio,
      executionStatus,
      executionReceipt,
      routeQualityScore,
      updatedAt: "",
    };
  }, [
    executionReceipt,
    executionStatus,
    feePreview,
    portfolio,
    recommendation,
    routeQualityScore,
    wallet.address,
    wallet.connected,
  ]);

  // Track whether the user has made any meaningful interaction
  const hasUserInteracted = useRef(false);

  // Mark user as having interacted when they actually do something
  useEffect(() => {
    if (
      executionStatus !== "idle" ||
      (portfolio && Object.keys(portfolio).length > 0)
    ) {
      hasUserInteracted.current = true;
    }
  }, [executionStatus, portfolio]);

  useEffect(() => {
    // Don't auto-persist on page load — only after user has explicitly interacted
    if (!hasUserInteracted.current) {
      return;
    }

    if (!wallet.address) {
      return;
    }

    if (!currentState || (!currentState.portfolio && !currentState.recommendation)) {
      return;
    }

    const serialized = serializePersistableState(currentState);
    if (serialized === lastSerializedRef.current) {
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const payload = withPersistTimestamp(currentState);
          // Use SILENT proof — no wallet popup for automatic state persistence
          const proof = buildSilentPersistProof(wallet.address, serializePersistableState(payload));
          await persistMutation.mutateAsync({
            state: payload,
            proof,
          });
          lastSerializedRef.current = serializePersistableState(payload);
        } catch {
          lastSerializedRef.current = "";
        }
      })();
    }, 350);

    return () => window.clearTimeout(handle);
  }, [currentState, persistMutation, wallet.address]);

  return null;
}
