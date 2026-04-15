import type { ActivityEvent, ExecutionReceipt, PersistedPortfolioState } from "@neuro/shared";
import { buildPortfolioSnapshot, getPlanDefinition } from "@neuro/domain";
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

function buildServerEvent(title: string, description: string, tone: ActivityEvent["tone"]): ActivityEvent {
  return {
    id: `server-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title,
    description,
    tone,
    timestampLabel: "Just now",
  };
}

export async function replacePersistedPortfolioState(state: PersistedPortfolioState) {
  await savePersistedPortfolioState(state);
  if (state.executionReceipt) {
    await addExecutionReceipt(state.walletAddress, state.executionReceipt);
  }
}

export function appendServerActivity(
  state: PersistedPortfolioState,
  event: ActivityEvent,
): PersistedPortfolioState {
  if (!state.portfolio) {
    return state;
  }

  return {
    ...state,
    portfolio: {
      ...state.portfolio,
      activity: [event, ...state.portfolio.activity],
    },
    updatedAt: new Date().toISOString(),
  };
}

export function buildPortfolioActionEvent(
  action: "switch-to-safety" | "withdraw",
  amountTon?: number,
): ActivityEvent {
  if (action === "switch-to-safety") {
    return buildServerEvent(
      "Moved to safety",
      "NEURO switched the plan into a calmer mode and preserved the activity trail.",
      "calm",
    );
  }

  return buildServerEvent(
    "Withdrawal prepared",
    typeof amountTon === "number"
      ? `NEURO marked ${amountTon.toFixed(2)} TON as ready to withdraw and reset the active plan state.`
      : "NEURO prepared a withdrawal and reset the active plan state.",
    "positive",
  );
}

function buildServerReceipt(
  walletAddress: string,
  mode: ExecutionReceipt["mode"],
  summary: string,
): ExecutionReceipt {
  return {
    id: `receipt-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    planId: mode === "move-to-safety" ? "exit-to-safety" : "safe-income",
    mode,
    reference: `${walletAddress}-${mode}-${Date.now()}`,
    summary,
    address: walletAddress,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
}

export async function applySwitchToSafety(walletAddress: string) {
  const current = await getPersistedPortfolioState(walletAddress);
  if (!current?.portfolio) {
    return null;
  }

  const amountTon = current.portfolio.netEstimatedValueTon;
  const safeRecommendation = {
    plan: getPlanDefinition("exit-to-safety"),
    reasons: ["Moved from a higher-movement plan into a calmer mode."],
    riskLabel: "Low" as const,
    estimatedAnnualRange: { low: 3, high: 6 },
    estimatedMonthlyIncomeTon: { low: 0, high: 0 },
    fallbackLabel: "Stay in the safest supported income mode",
    executionPreview: "Move into the safest supported mode and preserve exit flexibility.",
  };
  const nextPortfolio = buildPortfolioSnapshot(safeRecommendation, amountTon);
  const receipt = buildServerReceipt(
    walletAddress,
    "move-to-safety",
    "NEURO moved the active plan into a safer mode and refreshed the portfolio state.",
  );

  const nextState = appendServerActivity(
    {
      ...current,
      portfolio: nextPortfolio,
      executionStatus: "success",
      executionReceipt: receipt,
      updatedAt: new Date().toISOString(),
    },
    buildPortfolioActionEvent("switch-to-safety"),
  );

  await replacePersistedPortfolioState(nextState);

  return {
    portfolio: nextPortfolio,
    executionReceipt: receipt,
  };
}

export async function applyWithdraw(walletAddress: string, requestedAmountTon?: number) {
  const current = await getPersistedPortfolioState(walletAddress);
  if (!current?.portfolio) {
    return null;
  }

  const available = current.portfolio.availableToWithdrawTon;
  const amountTon =
    typeof requestedAmountTon === "number" && Number.isFinite(requestedAmountTon) && requestedAmountTon > 0
      ? Math.min(requestedAmountTon, available)
      : available;

  const receipt = buildServerReceipt(
    walletAddress,
    "withdraw",
    `Withdrawal prepared for ${amountTon.toFixed(2)} TON from your active plan.`,
  );

  const nextState = appendServerActivity(
    {
      ...current,
      portfolio: {
        ...current.portfolio,
        availableToWithdrawTon: Number((current.portfolio.availableToWithdrawTon - amountTon).toFixed(2)),
        currentModeLabel: "Withdrawal in progress",
        lastOptimizationLabel: `Prepared ${amountTon.toFixed(2)} TON for withdrawal`,
      },
      executionStatus: "success",
      executionReceipt: receipt,
      updatedAt: new Date().toISOString(),
    },
    buildPortfolioActionEvent("withdraw", amountTon),
  );

  await replacePersistedPortfolioState(nextState);

  return {
    portfolio: nextState.portfolio!,
    executionReceipt: receipt,
  };
}
