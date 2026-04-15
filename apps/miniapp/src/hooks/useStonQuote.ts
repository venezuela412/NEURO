import { useMemo } from "react";
import {
  Blockchain,
  SettlementMethod,
  type QuoteRequest,
  type QuoteResponseEvent,
  useConnectionStatus,
  useRfq,
} from "@ston-fi/omniston-sdk-react";
import { useAppStore } from "../store/appStore";

const TON_NATIVE_ADDRESS = "";

interface UseStonQuoteOptions {
  amountTon?: number;
  goal?: "protect" | "earn" | "grow";
  enabled?: boolean;
}

function getRiskSlippageBps(riskPreference: "low" | "medium" | "high") {
  if (riskPreference === "low") {
    return 20;
  }

  if (riskPreference === "high") {
    return 80;
  }

  return 40;
}

function deriveRouteQualityScore(event: QuoteResponseEvent | undefined) {
  if (!event || !("type" in event)) {
    return null;
  }

  if (event.type === "quoteUpdated") {
    return 0.9;
  }

  if (event.type === "ack") {
    return 0.72;
  }

  if (event.type === "noQuote") {
    return 0.45;
  }

  return null;
}

export function useStonQuote(options: UseStonQuoteOptions = {}) {
  const storeAmountTon = useAppStore((state) => state.amountTon);
  const storeGoal = useAppStore((state) => state.goal);
  const riskPreference = useAppStore((state) => state.riskPreference);
  const connectionStatus = useConnectionStatus();

  const amountTon = options.amountTon ?? storeAmountTon;
  const goal = options.goal ?? storeGoal;
  const enabled = (options.enabled ?? true) && amountTon > 0 && goal !== "protect" && connectionStatus === "ready";

  const quoteRequest = useMemo<QuoteRequest>(
    () => ({
      settlementMethods: [SettlementMethod.SETTLEMENT_METHOD_SWAP],
      askAssetAddress: {
        blockchain: Blockchain.TON,
        address: TON_NATIVE_ADDRESS,
      },
      bidAssetAddress: {
        blockchain: Blockchain.TON,
        address: TON_NATIVE_ADDRESS,
      },
      amount: {
        bidUnits: String(Math.round(amountTon * 1_000_000_000)),
      },
      settlementParams: {
        maxPriceSlippageBps: getRiskSlippageBps(riskPreference),
      },
    }),
    [amountTon, riskPreference],
  );

  const quote = useRfq(quoteRequest, {
    enabled,
  });

  return {
    enabled,
    connectionStatus,
    quote,
    isLoading: quote.isLoading || quote.isPending,
    routeQualityScore: deriveRouteQualityScore(quote.data),
    routeEventType: quote.data?.type,
    rfqId: "rfqId" in (quote.data ?? {}) ? quote.data.rfqId : undefined,
  };
}
