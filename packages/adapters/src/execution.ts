import type { ExecutionStatus } from "@neuro/shared";

export interface TonConnectMessage {
  address: string;
  amount: string;
  payload?: string;
}

export interface ExecutionProvider<TQuote> {
  id: string; // Identifier for the provider (e.g. 'stonfi', 'tonstakers')

  /**
   * Quotes the actual execution based on the amount.
   */
  quote(amountTon: number): Promise<TQuote>;

  /**
   * Executes the transaction using the underlying SDK/Connector.
   */
  execute(quote: TQuote): Promise<{ hash?: string; boc?: string }>;

  /**
   * (Optional) Local polling for visual feedback.
   */
  poll?(hashOrBoc: string): Promise<ExecutionStatus>;
}

