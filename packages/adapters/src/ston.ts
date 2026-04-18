import type { ExecutionProvider } from "./execution";
import type { TonConnectUI } from "@tonconnect/ui";

export interface StonfiExecutionPreview {
  amountTon: number;
  amountNano: string;
  expectedOutputNano?: string;
  minimumOutputNano?: string;
  quoteResult?: any; // The actual quote object from Omniston if available
}

export class StonfiExecutionProvider implements ExecutionProvider<StonfiExecutionPreview> {
  id = "stonfi";

  constructor(
    private connector: TonConnectUI,
    private omnistonClient?: any // The initialized Omniston client
  ) {}

  async quote(amountTon: number): Promise<StonfiExecutionPreview> {
    // In a real STON quote, we would fetch the quote from the Omniston client.
    // For now, we stub the baseline properties since Omniston's RFQ happens via WebSocket asynchronously.
    const amountNano = Math.round(amountTon * 1_000_000_000).toString();
    return {
      amountTon,
      amountNano,
    };
  }

  async execute(quote: StonfiExecutionPreview): Promise<{ hash?: string; boc?: string }> {
    if (!this.omnistonClient) {
      throw new Error("Omniston client not provided to STON.fi provider");
    }

    if (!quote.quoteResult || !quote.quoteResult.quote) {
      throw new Error("Missing RFQ quote result for STON.fi execution");
    }

    // Usually with Omniston, we build the swap transaction using the quote we received.
    const tx = await this.omnistonClient.buildSwapTransaction({
      quote: quote.quoteResult.quote,
      senderAddress: this.connector.account?.address,
      slippageTolerance: 0.01,
    });

    const result = await this.connector.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 60 * 10,
      messages: [
        {
          address: tx.to,
          amount: tx.value.toString(),
          payload: tx.payload,
        },
      ],
    });

    return { boc: result.boc };
  }
}
