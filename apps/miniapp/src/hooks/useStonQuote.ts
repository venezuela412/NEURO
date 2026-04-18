import { useMemo } from "react";
import {
  Blockchain,
  GaslessSettlement,
  SettlementMethod,
  type QuoteRequest,
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

function hasEventType(value: unknown): value is { type: string } {
  return typeof value === "object" && value !== null && "type" in value;
}

function deriveRouteQualityScore(event: unknown) {
  if (!hasEventType(event)) {
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
        gaslessSettlement: GaslessSettlement.GASLESS_SETTLEMENT_PROHIBITED,
        maxPriceSlippageBps: getRiskSlippageBps(riskPreference),
      },
    }),
    [amountTon, riskPreference],
  );

  const quote = useRfq(quoteRequest, {
    enabled,
  });

  const routeQualityScore = deriveRouteQualityScore(quote.data);
  const routeEventType = hasEventType(quote.data) ? quote.data.type : undefined;
  const rfqId =
    typeof quote.data === "object" && quote.data !== null && "rfqId" in quote.data
      ? String(quote.data.rfqId)
      : undefined;

  return {
    enabled,
    connectionStatus,
    isLoading: quote.isLoading || quote.isPending,
    routeQualityScore,
    routeEventType,
    rfqId,
    hasLiveQuote: routeQualityScore !== null,
    quoteData: quote.data,
  };
}
