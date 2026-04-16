import { beginCell, Cell, loadMessage, storeMessage, type Message } from "@ton/core";
import { TonClient } from "@ton/ton";
import type { ExecutionReceipt } from "@neuro/shared";

function getTonClient() {
  return new TonClient({
    endpoint: process.env.TON_RPC_ENDPOINT ?? "https://toncenter.com/api/v2/jsonRPC",
  });
}

function getNormalizedExtMessageHash(message: Message) {
  if (message.info.type !== "external-in") {
    throw new Error(`Message must be "external-in", got ${message.info.type}`);
  }

  const normalizedMessage = {
    ...message,
    init: null,
    info: {
      ...message.info,
      src: undefined,
      importFee: 0n,
    },
  };

  return beginCell()
    .store(storeMessage(normalizedMessage, { forceRef: true }))
    .endCell()
    .hash();
}

async function retry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

export async function reconcileTonExternalMessage(
  boc: string,
  options?: {
    retries?: number;
    intervalMs?: number;
  },
) {
  const client = getTonClient();
  const retriesCount = options?.retries ?? 5;
  const intervalMs = options?.intervalMs ?? 1500;
  const inMessage = loadMessage(Cell.fromBase64(boc).beginParse());

  if (inMessage.info.type !== "external-in") {
    throw new Error(`Message must be "external-in", got ${inMessage.info.type}`);
  }

  const targetHash = getNormalizedExtMessageHash(inMessage);
  const account = inMessage.info.dest;

  for (let attempt = 0; attempt < retriesCount; attempt += 1) {
    const transactions = await retry(
      () =>
        client.getTransactions(account, {
          limit: 10,
          archival: true,
        }),
      3,
      1000,
    );

    for (const transaction of transactions) {
      if (transaction.inMessage?.info.type !== "external-in") {
        continue;
      }

      const inMessageHash = getNormalizedExtMessageHash(transaction.inMessage);
      if (inMessageHash.equals(targetHash)) {
        return {
          transactionHash: transaction.hash().toString("hex"),
          accountAddress: account.toString(),
          found: true,
        };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return {
    found: false,
    accountAddress: account.toString(),
  };
}

export async function reconcileExecutionReceipt(receipt: ExecutionReceipt) {
  if (receipt.mode !== "tonstakers-stake") {
    return {
      receipt: {
        ...receipt,
        status: receipt.status === "captured" ? "confirmed" : receipt.status,
        reconciledAt: new Date().toISOString(),
      } satisfies ExecutionReceipt,
      changed: false,
    };
  }

  try {
    const match = await reconcileTonExternalMessage(receipt.reference);
    const now = new Date().toISOString();

    if (match.found) {
      return {
        changed: true,
        receipt: {
          ...receipt,
          status: "confirmed",
          transactionHash: match.transactionHash,
          accountAddress: match.accountAddress,
          reconciledAt: now,
          lastCheckedAt: now,
          summary: "Tonstakers staking request was located on-chain and confirmed by NEURO.",
          errorMessage: undefined,
        } satisfies ExecutionReceipt,
      };
    }

    return {
      changed: true,
      receipt: {
        ...receipt,
        status: "reconciling",
        accountAddress: match.accountAddress,
        lastCheckedAt: now,
        summary: "Tonstakers staking request was submitted and is still being checked on-chain.",
        errorMessage: undefined,
      } satisfies ExecutionReceipt,
    };
  } catch (error) {
    return {
      changed: true,
      receipt: {
        ...receipt,
        status: "failed",
        lastCheckedAt: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : "Unknown reconciliation error",
        summary: "NEURO could not confirm this request on-chain yet. You can retry reconciliation.",
      } satisfies ExecutionReceipt,
    };
  }
}
