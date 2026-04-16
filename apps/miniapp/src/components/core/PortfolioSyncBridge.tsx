import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { PersistedPortfolioState, SignedActionProof } from "@neuro/shared";
import {
  fetchPersistedPortfolioState,
  savePersistedPortfolioStateAuthenticated,
} from "../../lib/controlPlane";
import { useWalletActionAuth } from "../../hooks/useWalletActionAuth";
import { useNeuroWallet } from "../../hooks/useTonWallet";
import { useAppStore } from "../../store/appStore";

function serializeState(state: PersistedPortfolioState) {
  return JSON.stringify(state);
}

interface PersistPortfolioPayload {
  state: PersistedPortfolioState;
  proof: SignedActionProof;
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
  const { signAction } = useWalletActionAuth();

  const lastSerializedRef = useRef<string>("");

  const persistedQuery = useQuery({
    queryKey: ["portfolio-state", wallet.address],
    queryFn: () => fetchPersistedPortfolioState(wallet.address),
    enabled: wallet.connected && Boolean(wallet.address),
    staleTime: 15_000,
  });

  const persistMutation = useMutation({
    mutationFn: async ({ state, proof }: PersistPortfolioPayload) =>
      savePersistedPortfolioStateAuthenticated(state, proof),
  });

  useEffect(() => {
    setPortfolioHydrating(persistedQuery.isLoading);
  }, [persistedQuery.isLoading, setPortfolioHydrating]);

  useEffect(() => {
    if (!wallet.connected || !wallet.address || !persistedQuery.data) {
      return;
    }

    const serialized = serializeState(persistedQuery.data);
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
      updatedAt: new Date().toISOString(),
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

    const serialized = serializeState(currentState);
    if (serialized === lastSerializedRef.current) {
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const proof = await signAction("persist-state", serialized);
          lastSerializedRef.current = serialized;
          await persistMutation.mutateAsync({
            state: currentState,
            proof,
          });
        } catch {
          lastSerializedRef.current = "";
        }
      })();
    }, 350);

    return () => window.clearTimeout(handle);
  }, [currentState, persistMutation, signAction]);

  return null;
}
