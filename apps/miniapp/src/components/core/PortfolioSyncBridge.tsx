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
  const { ensureSession, signAction } = useWalletActionAuth();

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

  useEffect(() => {
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
          const proof = await signAction("persist-state", serializePersistableState(payload));
          const session = await ensureSession(proof);
          await persistMutation.mutateAsync({
            state: payload,
            proof,
            session,
          });
          lastSerializedRef.current = serializePersistableState(payload);
        } catch {
          lastSerializedRef.current = "";
        }
      })();
    }, 350);

    return () => window.clearTimeout(handle);
  }, [currentState, ensureSession, persistMutation, signAction]);

  return null;
}
