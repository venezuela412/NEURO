import type { ActivityEvent, ExecutionReceipt, PersistedPortfolioState } from "@neuro/shared";
import { buildPortfolioSnapshot, getPlanDefinition } from "@neuro/domain";
import { getDb } from "./db";
import { reconcileExecutionReceipt } from "./reconciliation";

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

interface ConsumedNonceRow {
  wallet_address: string;
  nonce: string;
}

interface WalletSessionRow {
  session_id: string;
  wallet_address: string;
  issued_at: string;
  expires_at: string;
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

export async function addFeeAccrual(walletAddress: string, eventType: string, txHash: string, amountTon: number) {
  const db = await getDb();
  const normalized = normalizeWalletAddress(walletAddress);
  
  await db.query(
    `
      INSERT INTO fee_accrual (wallet_address, event_type, tx_hash, amount_ton)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
    `,
    [normalized, eventType, txHash, amountTon]
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

export async function isNonceConsumed(walletAddress: string, nonce: string) {
  const db = await getDb();
  const normalized = normalizeWalletAddress(walletAddress);
  const result = await db.query<ConsumedNonceRow>(
    `
      SELECT wallet_address, nonce
      FROM consumed_action_nonce
      WHERE wallet_address = $1 AND nonce = $2
      LIMIT 1
    `,
    [normalized, nonce],
  );

  return result.rows.length > 0;
}

export async function consumeNonce(walletAddress: string, nonce: string) {
  const db = await getDb();
  const normalized = normalizeWalletAddress(walletAddress);
  await db.query(
    `
      INSERT INTO consumed_action_nonce (wallet_address, nonce)
      VALUES ($1, $2)
      ON CONFLICT (wallet_address, nonce) DO NOTHING
    `,
    [normalized, nonce],
  );
}

export async function createWalletSession(walletAddress: string, sessionId: string, expiresAt: string) {
  const db = await getDb();
  const normalized = normalizeWalletAddress(walletAddress);
  const issuedAt = new Date().toISOString();
  await db.query(
    `
      INSERT INTO wallet_sessions (session_id, wallet_address, issued_at, expires_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (session_id)
      DO UPDATE SET wallet_address = EXCLUDED.wallet_address, issued_at = EXCLUDED.issued_at, expires_at = EXCLUDED.expires_at
    `,
    [sessionId, normalized, issuedAt, expiresAt],
  );
}

export async function getWalletSession(walletAddress: string, sessionId: string) {
  const db = await getDb();
  const normalized = normalizeWalletAddress(walletAddress);
  const result = await db.query<WalletSessionRow>(
    `
      SELECT session_id, wallet_address, issued_at, expires_at
      FROM wallet_sessions
      WHERE wallet_address = $1 AND session_id = $2
      LIMIT 1
    `,
    [normalized, sessionId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function deleteWalletSession(walletAddress: string, sessionId: string) {
  const db = await getDb();
  const normalized = normalizeWalletAddress(walletAddress);
  await db.query(
    `
      DELETE FROM wallet_sessions
      WHERE wallet_address = $1 AND session_id = $2
    `,
    [normalized, sessionId],
  );
}

export async function getExecutionReceipt(walletAddress: string, receiptId: string) {
  const db = await getDb();
  const normalized = normalizeWalletAddress(walletAddress);
  const result = await db.query<ExecutionReceiptRow>(
    `
      SELECT id, wallet_address, receipt_json, created_at
      FROM execution_receipts
      WHERE wallet_address = $1 AND id = $2
      LIMIT 1
    `,
    [normalized, receiptId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return JSON.parse(result.rows[0].receipt_json) as ExecutionReceipt;
}

export async function updateExecutionReceipt(walletAddress: string, receipt: ExecutionReceipt) {
  return addExecutionReceipt(walletAddress, receipt);
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

export async function reconcilePersistedExecution(walletAddress: string, receiptId: string) {
  const current = await getPersistedPortfolioState(walletAddress);
  if (!current) {
    return null;
  }

  const receipt = await getExecutionReceipt(walletAddress, receiptId);
  if (!receipt) {
    return null;
  }

  const result = await reconcileExecutionReceipt(receipt);
  const updatedReceipt = result.receipt;
  await updateExecutionReceipt(walletAddress, updatedReceipt);

  let nextState: PersistedPortfolioState = {
    ...current,
    executionReceipt:
      current.executionReceipt?.id === updatedReceipt.id ? updatedReceipt : current.executionReceipt,
    executionStatus:
      updatedReceipt.status === "confirmed"
        ? "success"
        : updatedReceipt.status === "failed"
          ? "failed-safely"
          : "confirming",
    updatedAt: new Date().toISOString(),
  };

  const activity =
    updatedReceipt.status === "confirmed"
      ? buildServerEvent(
          "Execution confirmed",
          "NEURO located the submitted request on-chain and marked it confirmed.",
          "positive",
        )
      : updatedReceipt.status === "failed"
        ? buildServerEvent(
            "Execution needs review",
            updatedReceipt.errorMessage ?? "NEURO could not confirm the request on-chain yet.",
            "warning",
          )
        : buildServerEvent(
            "Execution still reconciling",
            "NEURO checked the chain and the request is still pending confirmation.",
            "calm",
          );

  nextState = appendServerActivity(nextState, activity);
  await savePersistedPortfolioState(nextState);

  // If newly confirmed, we accrue the fee based on the snapshot values.
  if (current.executionStatus !== "success" && updatedReceipt.status === "confirmed" && current.portfolio) {
    const feeAmount = current.portfolio.estimatedFeeTon || 0;
    if (feeAmount > 0) {
      await addFeeAccrual(walletAddress, updatedReceipt.mode, updatedReceipt.transactionHash || "", feeAmount);
    }
  }

  return {
    portfolio: nextState.portfolio,
    executionReceipt: updatedReceipt,
    executionStatus: nextState.executionStatus,
  };
}

export interface AdminPortfolioRow {
  walletAddress: string;
  updatedAt: string;
  principalTon: number | null;
  estimatedFeeTon: number | null;
  activePlanId: string | null;
}

export interface AdminExecutionRow {
  walletAddress: string;
  receiptId: string;
  createdAt: string;
  planId: string | null;
  status: string | null;
  mode: string | null;
}

export async function listPortfolioSummariesForAdmin(limit = 200): Promise<AdminPortfolioRow[]> {
  const db = await getDb();
  const cap = Math.min(Math.max(limit, 1), 500);
  const result = await db.query<{ wallet_address: string; state_json: string; updated_at: string }>(
    "SELECT wallet_address, state_json, updated_at FROM portfolio_state ORDER BY updated_at DESC LIMIT $1",
    [cap],
  );

  return result.rows.map((row) => {
    let principalTon: number | null = null;
    let estimatedFeeTon: number | null = null;
    let activePlanId: string | null = null;
    try {
      const state = JSON.parse(row.state_json) as PersistedPortfolioState;
      if (state.portfolio) {
        principalTon = state.portfolio.principalTon;
        estimatedFeeTon = state.portfolio.estimatedFeeTon;
        activePlanId = state.portfolio.activePlanId;
      }
    } catch {
      // ignore parse errors for admin read
    }

    return {
      walletAddress: row.wallet_address,
      updatedAt: row.updated_at,
      principalTon,
      estimatedFeeTon,
      activePlanId,
    };
  });
}

export async function listRecentExecutionReceiptsForAdmin(limit = 100): Promise<AdminExecutionRow[]> {
  const db = await getDb();
  const cap = Math.min(Math.max(limit, 1), 500);
  const result = await db.query<{ wallet_address: string; receipt_json: string; created_at: string }>(
    `
      SELECT wallet_address, receipt_json, created_at
      FROM execution_receipts
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [cap],
  );

  return result.rows.map((row) => {
    let planId: string | null = null;
    let status: string | null = null;
    let mode: string | null = null;
    let receiptId = "";
    try {
      const receipt = JSON.parse(row.receipt_json) as ExecutionReceipt;
      receiptId = receipt.id;
      planId = receipt.planId;
      status = receipt.status;
      mode = receipt.mode;
    } catch {
      receiptId = "parse-error";
    }

    return {
      walletAddress: row.wallet_address,
      receiptId,
      createdAt: row.created_at,
      planId,
      status,
      mode,
    };
  });
}

export async function countPortfolioRows(): Promise<number> {
  const db = await getDb();
  const result = await db.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM portfolio_state");
  return Number(result.rows[0]?.count ?? 0);
}

export async function countExecutionReceiptRows(): Promise<number> {
  const db = await getDb();
  const result = await db.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM execution_receipts");
  return Number(result.rows[0]?.count ?? 0);
}
