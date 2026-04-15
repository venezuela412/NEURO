import type { ExecutionReceipt, PersistedPortfolioState } from "@neuro/shared";
import { getDb } from "./db";

interface PortfolioStateRow {
  wallet_address: string;
  state_json: string;
  updated_at: string;
}

interface ExecutionReceiptRow {
  id: string;
  wallet_address: string;
  receipt_json: string;
  created_at: string;
}

function normalizeWalletAddress(walletAddress: string) {
  return walletAddress.trim();
}

export async function getPersistedPortfolioState(walletAddress: string) {
  const db = await getDb();
  const normalized = normalizeWalletAddress(walletAddress);
  const result = await db.query<PortfolioStateRow>(
    "SELECT wallet_address, state_json, updated_at FROM portfolio_state WHERE wallet_address = $1",
    [normalized],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return JSON.parse(result.rows[0].state_json) as PersistedPortfolioState;
}

export async function savePersistedPortfolioState(state: PersistedPortfolioState) {
  const db = await getDb();
  const normalized = normalizeWalletAddress(state.walletAddress);
  const updatedAt = state.updatedAt;

  await db.query(
    `
      INSERT INTO portfolio_state (wallet_address, state_json, updated_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (wallet_address)
      DO UPDATE SET state_json = EXCLUDED.state_json, updated_at = EXCLUDED.updated_at
    `,
    [normalized, JSON.stringify(state), updatedAt],
  );
}

export async function addExecutionReceipt(walletAddress: string, receipt: ExecutionReceipt) {
  const db = await getDb();
  const normalized = normalizeWalletAddress(walletAddress);

  await db.query(
    `
      INSERT INTO execution_receipts (id, wallet_address, receipt_json, created_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id)
      DO UPDATE SET receipt_json = EXCLUDED.receipt_json, created_at = EXCLUDED.created_at
    `,
    [receipt.id, normalized, JSON.stringify(receipt), receipt.createdAt],
  );
}

export async function listExecutionReceipts(walletAddress: string) {
  const db = await getDb();
  const normalized = normalizeWalletAddress(walletAddress);
  const result = await db.query<ExecutionReceiptRow>(
    `
      SELECT id, wallet_address, receipt_json, created_at
      FROM execution_receipts
      WHERE wallet_address = $1
      ORDER BY created_at DESC
    `,
    [normalized],
  );

  return result.rows.map((row) => JSON.parse(row.receipt_json) as ExecutionReceipt);
}
