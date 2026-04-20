import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { z } from "zod";
import crypto from "crypto";

import {
  buildPlanPreviewResponse,
  createMockPortfolio,
  getDefaultPlanRecommendationInput,
  getNeuroOverview,
} from "@neuro/adapters";
import type { PersistedPortfolioState, PlanRecommendationInput } from "@neuro/shared";
import {
  addAdminLog,
  addExecutionReceipt,
  applySwitchToSafety,
  applyWithdraw,
  cleanupExpiredSessions,
  countExecutionReceiptRows,
  countPortfolioRows,
  createWalletSession,
  getWalletSession,
  consumeNonce,
  getPersistedPortfolioState,
  getTotalFeesAccrued,
  isNonceConsumed,
  listAdminLogs,
  listExecutionReceipts,
  listFeeAccruals,
  listPortfolioSummariesForAdmin,
  listRecentExecutionReceiptsForAdmin,
  reconcilePersistedExecution,
  savePersistedPortfolioState,
} from "./repository";
import { verifySignedAction } from "./security";

const server = Fastify({
  logger: true,
  bodyLimit: 128 * 1024,
});

await server.register(cors, {
  origin: true,
});

await server.register(rateLimit, {
  global: true,
  max: 120,
  timeWindow: "1 minute",
});

const planPreviewSchema = z.object({
  amountTon: z.number().finite().positive().max(1_000_000).optional(),
  goal: z.enum(["protect", "earn", "grow"]).optional(),
  wantsFlexibility: z.boolean().optional(),
  riskPreference: z.enum(["low", "medium", "high"]).optional(),
  hasWallet: z.boolean().optional(),
  gasReserveTon: z.number().finite().nonnegative().optional(),
  routeQualityScore: z.number().finite().min(0).max(1).optional(),
  safePathAvailable: z.boolean().optional(),
  hasActivePlan: z.boolean().optional(),
});

const signedActionSchema = z.object({
  action: z.string().min(1).max(64),
  walletAddress: z.string().min(5).max(128),
  publicKey: z.string().optional(),
  walletStateInit: z.string().optional(),
  domain: z.string().min(1).max(255),
  timestamp: z.number().int().nonnegative(),
  nonce: z.string().min(8).max(128),
  signature: z.string().min(16),
  payload: z.object({
    type: z.literal("text"),
    text: z.string().min(1).max(2048),
  }),
});

const persistedStateSchema = z.object({
  walletAddress: z.string().min(5).max(128),
  recommendation: z.any().nullable(),
  feePreview: z.any().nullable(),
  portfolio: z.any().nullable(),
  executionStatus: z.enum([
    "idle",
    "preparing",
    "ready-to-sign",
    "waiting-for-wallet",
    "submitted",
    "confirming",
    "success",
    "retry-needed",
    "fallback-available",
    "failed-safely",
  ]),
  executionReceipt: z.any().nullable(),
  routeQualityScore: z.number().finite().min(0).max(1),
  updatedAt: z.string().min(10).max(64),
});

const persistedStateMutationSchema = z.object({
  state: persistedStateSchema,
  proof: signedActionSchema,
});

const withdrawBodySchema = z.object({
  amountTon: z.number().finite().positive().max(1_000_000).optional(),
  proof: signedActionSchema,
});

const signedMutationSchema = z.object({
  proof: signedActionSchema,
});

const sessionMutationSchema = z.object({
  sessionToken: z.string().min(16).optional(),
  proof: signedActionSchema.optional(),
});

async function requireSignedAction(walletAddress: string, proof: z.infer<typeof signedActionSchema>) {
  if (proof.walletAddress !== walletAddress) {
    throw new Error("wallet_mismatch");
  }

  if (await isNonceConsumed(walletAddress, proof.nonce)) {
    throw new Error("replayed_proof");
  }

  const allowed = await verifySignedAction(proof, walletAddress);
  if (!allowed) {
    throw new Error("invalid_signature");
  }

  await consumeNonce(walletAddress, proof.nonce);
}

async function requireWalletAuthorization(
  walletAddress: string,
  payload: z.infer<typeof sessionMutationSchema>,
) {
  if (payload.sessionToken) {
    const session = await getWalletSession(walletAddress, payload.sessionToken);
    if (session) {
      return {
        mode: "session" as const,
        sessionToken: session.session_id,
        expiresAt: session.expires_at,
      };
    }
  }

  if (!payload.proof) {
    throw new Error("missing_proof");
  }

  await requireSignedAction(walletAddress, payload.proof);
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await createWalletSession(walletAddress, sessionToken, expiresAt);
  return {
    mode: "proof" as const,
    sessionToken,
    expiresAt,
  };
}

// ==================== PUBLIC ROUTES ====================

server.get("/health", async () => ({
  ok: true,
  service: "neuro-control-plane",
  timestamp: new Date().toISOString(),
}));

server.get("/overview", async () => getNeuroOverview());

// ==================== ADMIN AUTH ====================

function requireAdminToken(request: { headers: Record<string, string | string[] | undefined> }) {
  const configured = process.env.NEURO_ADMIN_TOKEN?.trim();
  if (!configured) {
    return { ok: false as const, reason: "not_configured" as const };
  }

  const header =
    (typeof request.headers["x-neuro-admin-token"] === "string"
      ? request.headers["x-neuro-admin-token"]
      : Array.isArray(request.headers["x-neuro-admin-token"])
        ? request.headers["x-neuro-admin-token"][0]
        : undefined) ?? "";

  const auth =
    typeof request.headers.authorization === "string"
      ? request.headers.authorization
      : Array.isArray(request.headers.authorization)
        ? request.headers.authorization[0]
        : "";

  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  try {
    const configuredBuffer = Buffer.from(configured);
    const headerBuffer = Buffer.from(header);
    const bearerBuffer = Buffer.from(bearer);

    const isHeaderValid = headerBuffer.length === configuredBuffer.length && crypto.timingSafeEqual(headerBuffer, configuredBuffer);
    const isBearerValid = bearerBuffer.length === configuredBuffer.length && crypto.timingSafeEqual(bearerBuffer, configuredBuffer);

    if (isHeaderValid || isBearerValid) {
      return { ok: true as const };
    }
  } catch {
    // Fallback if there's any buffer parsing issue
  }

  return { ok: false as const, reason: "forbidden" as const };
}

function handleAdminAuth(request: { headers: Record<string, string | string[] | undefined> }, reply: any) {
  const auth = requireAdminToken(request);
  if (!auth.ok) {
    if (auth.reason === "not_configured") {
      reply.code(503);
      return {
        error: "admin_not_configured",
        hint: "Set NEURO_ADMIN_TOKEN on the control plane, then call with header X-Neuro-Admin-Token or Authorization: Bearer <token>.",
      };
    }
    reply.code(403);
    return { error: "forbidden" };
  }
  return null; // Auth OK
}

// ==================== ADMIN ROUTES ====================

server.get("/admin/summary", async (request, reply) => {
  const authError = handleAdminAuth(request, reply);
  if (authError) return authError;

  const [portfolioCount, executionCount, portfolios, executions, totalFees] = await Promise.all([
    countPortfolioRows(),
    countExecutionReceiptRows(),
    listPortfolioSummariesForAdmin(200),
    listRecentExecutionReceiptsForAdmin(100),
    getTotalFeesAccrued(),
  ]);

  return {
    portfolioCount,
    executionReceiptCount: executionCount,
    totalFeesAccruedTon: totalFees,
    portfolios,
    recentExecutions: executions,
  };
});

server.get("/admin/fees", async (request, reply) => {
  const authError = handleAdminAuth(request, reply);
  if (authError) return authError;

  const [fees, totalFees] = await Promise.all([
    listFeeAccruals(200),
    getTotalFeesAccrued(),
  ]);

  return {
    totalFeesAccruedTon: totalFees,
    feeHistory: fees,
  };
});

server.get("/admin/logs", async (request, reply) => {
  const authError = handleAdminAuth(request, reply);
  if (authError) return authError;

  const logs = await listAdminLogs(500);
  return { logs };
});

server.get("/admin/health", async (request, reply) => {
  const authError = handleAdminAuth(request, reply);
  if (authError) return authError;

  const [portfolioCount, executionCount] = await Promise.all([
    countPortfolioRows(),
    countExecutionReceiptRows(),
  ]);

  // Check external service connectivity
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

  // Tonstakers API check
  try {
    const start = Date.now();
    const response = await fetch("https://tonapi.io/v2/staking/pools", {
      signal: AbortSignal.timeout(5000),
    });
    checks.tonstakers_api = {
      status: response.ok ? "healthy" : "degraded",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    checks.tonstakers_api = {
      status: "down",
      error: error instanceof Error ? error.message : "Unknown",
    };
  }

  // STON.fi API check
  try {
    const start = Date.now();
    const response = await fetch("https://api.ston.fi/v1/assets", {
      signal: AbortSignal.timeout(5000),
    });
    checks.stonfi_api = {
      status: response.ok ? "healthy" : "degraded",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    checks.stonfi_api = {
      status: "down",
      error: error instanceof Error ? error.message : "Unknown",
    };
  }

  // TON RPC check
  try {
    const start = Date.now();
    const endpoint = process.env.TON_RPC_ENDPOINT ?? "https://toncenter.com/api/v2/jsonRPC";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: 1, jsonrpc: "2.0", method: "getMasterchainInfo", params: {} }),
      signal: AbortSignal.timeout(5000),
    });
    checks.ton_rpc = {
      status: response.ok ? "healthy" : "degraded",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    checks.ton_rpc = {
      status: "down",
      error: error instanceof Error ? error.message : "Unknown",
    };
  }

  return {
    database: {
      portfolioCount,
      executionReceiptCount: executionCount,
    },
    protocols: checks,
    vaultAddress: process.env.NEURO_VAULT_ADDRESS ?? "not_configured",
    timestamp: new Date().toISOString(),
  };
});

server.post("/admin/reconcile-all", async (request, reply) => {
  const authError = handleAdminAuth(request, reply);
  if (authError) return authError;

  const executions = await listRecentExecutionReceiptsForAdmin(50);
  const pending = executions.filter((e) => e.status === "submitted" || e.status === "reconciling");

  let reconciled = 0;
  let failed = 0;

  for (const exec of pending) {
    try {
      await reconcilePersistedExecution(exec.walletAddress, exec.receiptId);
      reconciled++;
    } catch {
      failed++;
    }
  }

  await addAdminLog("info", "reconciliation", `Bulk reconcile: ${reconciled} succeeded, ${failed} failed`, {
    reconciled,
    failed,
    totalPending: pending.length,
  });

  return { reconciled, failed, totalPending: pending.length };
});

server.post("/admin/cleanup-sessions", async (request, reply) => {
  const authError = handleAdminAuth(request, reply);
  if (authError) return authError;

  await cleanupExpiredSessions();
  return { ok: true, message: "Expired sessions cleaned up" };
});

// ==================== MANUAL HARVEST TRIGGER ====================

server.post("/admin/trigger-harvest", async (request, reply) => {
  const authError = handleAdminAuth(request, reply);
  if (authError) return authError;

  await addAdminLog("info", "admin", "[MANUAL] Harvest triggered by admin");

  try {
    const { OmniChainSolver } = await import("./solver");
    const { stakeViaTonstakers, autoCompound, getVaultBalance } = await import("./vault-executor");

    // Step 1: Check vault balance for idle TON
    const idleTon = await getVaultBalance(); // already in TON, not nanoton

    await addAdminLog("info", "admin", `[MANUAL] Vault idle balance: ${idleTon.toFixed(4)} TON`);

    let stakeResult = null;
    if (idleTon > 3.5) {
      // Keep 0.5 TON for gas, stake the rest
      const stakeAmount = idleTon - 0.5;
      await addAdminLog("info", "admin", `[MANUAL] Staking ${stakeAmount.toFixed(4)} TON in Tonstakers...`);
      stakeResult = await stakeViaTonstakers(stakeAmount);
      await addAdminLog("info", "admin", `[MANUAL] Stake result: ${stakeResult.success ? "SUCCESS" : stakeResult.error}`);
    } else {
      await addAdminLog("info", "admin", `[MANUAL] Idle balance ${idleTon.toFixed(4)} TON below 3.5 threshold — skipping stake`);
    }

    // Step 2: Check if compound is profitable
    const compoundInfo = await OmniChainSolver.computeAutoCompoundForVault();

    let compoundResult = null;
    if (compoundInfo.isProfitable) {
      const profitTon = compoundInfo.profitToMint / 1e9;
      await addAdminLog("info", "admin", `[MANUAL] Compounding ${profitTon.toFixed(6)} TON profit...`);
      compoundResult = await autoCompound(profitTon);
      await addAdminLog("info", "admin", `[MANUAL] Compound result: ${compoundResult.success ? "SUCCESS" : compoundResult.error}`);
    } else {
      await addAdminLog("info", "admin", `[MANUAL] Compound not profitable yet — TVL: ${compoundInfo.tvlTon.toFixed(2)} TON`);
    }

    return {
      ok: true,
      idleTon,
      stake: stakeResult ?? { skipped: true, reason: `idle ${idleTon.toFixed(2)} < 3.5 TON` },
      compound: compoundResult ?? { skipped: true, reason: compoundInfo.isProfitable ? "error" : "not profitable yet" },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown";
    await addAdminLog("error", "admin", `[MANUAL] Harvest failed: ${msg}`);
    return reply.status(500).send({ ok: false, error: msg });
  }
});

// ==================== PORTFOLIO ROUTES ====================

server.get<{ Querystring: { amount?: string } }>("/portfolio/demo", async (request) => {
  const amount = Number(request.query.amount ?? 100);
  return createMockPortfolio(Number.isFinite(amount) && amount > 0 ? amount : 100);
});

server.post<{ Body: Partial<PlanRecommendationInput> }>("/plan/preview", async (request) => {
  const body = planPreviewSchema.parse(request.body ?? {});
  const amountTon =
    typeof body.amountTon === "number" && Number.isFinite(body.amountTon) && body.amountTon > 0
      ? body.amountTon
      : 100;

  return buildPlanPreviewResponse(
    getDefaultPlanRecommendationInput({
      ...body,
      amountTon,
    }),
  );
});

server.get<{ Params: { walletAddress: string } }>("/portfolio/:walletAddress/state", async (request, reply) => {
  const state = await getPersistedPortfolioState(request.params.walletAddress);
  if (!state) {
    reply.code(404);
    return { error: "not_found" };
  }

  return state;
});

server.put<{ Params: { walletAddress: string }; Body: z.infer<typeof persistedStateMutationSchema> }>(
  "/portfolio/:walletAddress/state",
  async (request, reply) => {
    const parsed = persistedStateMutationSchema.safeParse({
      ...request.body,
      state: {
        ...(request.body?.state ?? {}),
        walletAddress: request.params.walletAddress,
      },
    });
    if (!parsed.success) {
      reply.code(400);
      return { error: "invalid_state" };
    }

    try {
      await requireSignedAction(request.params.walletAddress, parsed.data.proof);
    } catch (error) {
      reply.code(403);
      return { error: error instanceof Error ? error.message : "forbidden" };
    }

    const state = {
      ...parsed.data.state,
      walletAddress: request.params.walletAddress,
    };
    await savePersistedPortfolioState(state);
    if (state.executionReceipt) {
      await addExecutionReceipt(state.walletAddress, state.executionReceipt);
    }

    await addAdminLog("info", "portfolio", `State updated for ${state.walletAddress}`, {
      walletAddress: state.walletAddress,
      executionStatus: state.executionStatus,
    });

    return {
      ok: true,
      updatedAt: state.updatedAt,
    };
  },
);

server.get<{ Params: { walletAddress: string } }>("/portfolio/:walletAddress/executions", async (request) => {
  return {
    items: await listExecutionReceipts(request.params.walletAddress),
  };
});

server.post<{ Params: { walletAddress: string }; Body: { proof: z.infer<typeof signedActionSchema> } }>(
  "/portfolio/:walletAddress/session",
  async (request, reply) => {
    const parsed = signedMutationSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      reply.code(400);
      return { error: "invalid_payload" };
    }

    try {
      await requireSignedAction(request.params.walletAddress, parsed.data.proof);
    } catch (error) {
      reply.code(403);
      return { error: error instanceof Error ? error.message : "forbidden" };
    }

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await createWalletSession(request.params.walletAddress, sessionToken, expiresAt);
    return {
      ok: true,
      sessionToken,
      expiresAt,
    };
  },
);

server.post<{ Params: { walletAddress: string; executionId: string } }>(
  "/portfolio/:walletAddress/executions/:executionId/reconcile",
  async (request, reply) => {
    const parsed = z
      .object({
        sessionToken: z.string().min(16).optional(),
        proof: signedActionSchema.optional(),
      })
      .safeParse(request.body ?? {});

    if (!parsed.success) {
      reply.code(400);
      return { error: "invalid_payload" };
    }

    try {
      await requireWalletAuthorization(request.params.walletAddress, parsed.data);
    } catch (error) {
      reply.code(403);
      return { error: error instanceof Error ? error.message : "forbidden" };
    }

    const result = await reconcilePersistedExecution(
      request.params.walletAddress,
      request.params.executionId,
    );
    if (!result) {
      reply.code(404);
      return { error: "not_found" };
    }

    return result;
  },
);

server.post<{ Params: { walletAddress: string } }>("/portfolio/:walletAddress/switch-to-safety", async (request, reply) => {
  const parsed = sessionMutationSchema.safeParse(request.body ?? {});
  if (!parsed.success) {
    reply.code(400);
    return { error: "invalid_payload" };
  }
  try {
    const auth = await requireWalletAuthorization(request.params.walletAddress, parsed.data);
    const result = await applySwitchToSafety(request.params.walletAddress);
    if (!result) {
      reply.code(404);
      return { error: "not_found" };
    }

    await addAdminLog("info", "portfolio", `Switch to safety for ${request.params.walletAddress}`);

    return {
      ...result,
      sessionToken: auth.sessionToken,
      sessionExpiresAt: auth.expiresAt,
    };
  } catch (error) {
    await addAdminLog("error", "portfolio", `Switch to safety failed: ${error instanceof Error ? error.message : "unknown"}`, {
      walletAddress: request.params.walletAddress,
    });
    reply.code(403);
    return { error: error instanceof Error ? error.message : "forbidden" };
  }
});

server.post<{ Params: { walletAddress: string }; Body: { amountTon?: number } }>(
  "/portfolio/:walletAddress/withdraw",
  async (request, reply) => {
    const parsed = z
      .object({
        amountTon: z.number().finite().positive().max(1_000_000).optional(),
        sessionToken: z.string().min(16).optional(),
        proof: signedActionSchema.optional(),
      })
      .safeParse(request.body ?? {});
    if (!parsed.success) {
      reply.code(400);
      return { error: "invalid_payload" };
    }
    try {
      const auth = await requireWalletAuthorization(request.params.walletAddress, parsed.data);
      const result = await applyWithdraw(request.params.walletAddress, parsed.data.amountTon);
      if (!result) {
        reply.code(404);
        return { error: "not_found" };
      }

      await addAdminLog("info", "portfolio", `Withdrawal for ${request.params.walletAddress}: ${parsed.data.amountTon ?? "full"} TON`);

      return {
        ...result,
        sessionToken: auth.sessionToken,
        sessionExpiresAt: auth.expiresAt,
      };
    } catch (error) {
      await addAdminLog("error", "portfolio", `Withdrawal failed: ${error instanceof Error ? error.message : "unknown"}`, {
        walletAddress: request.params.walletAddress,
      });
      reply.code(403);
      return { error: error instanceof Error ? error.message : "forbidden" };
    }
  },
);

// ==================== SOLVER CRON ====================

import { OmniChainSolver } from "./solver";

server.post("/api/solver/cron", async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    // SECURITY: Require explicit CRON_SECRET — no default fallbacks
    if (!cronSecret) {
      reply.code(503);
      return { error: "cron_not_configured", hint: "Set CRON_SECRET environment variable" };
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      reply.code(401);
      return { error: "unauthorized" };
    }

    // 1. Compute auto-compound for vault
    const compoundData = await OmniChainSolver.computeAutoCompoundForVault();

    // 2. Derive strategy rebalancing
    const strategies = await OmniChainSolver.computeRebalancePaths();

    await addAdminLog("info", "solver", `Auto-compound resolved: profit=${compoundData.profitToMint}, strategies=${strategies.length}`, {
      profitToMint: compoundData.profitToMint,
      strategiesCount: strategies.length,
    });

    return {
      success: true,
      profitResolved: compoundData.profitToMint,
      strategiesPushed: strategies.length,
      action: "AUTO_COMPOUND_AND_REBALANCE",
    };
  } catch (error) {
    server.log.error(error);
    await addAdminLog("error", "solver", `Solver execution failed: ${error instanceof Error ? error.message : "unknown"}`);
    reply.code(500);
    return { error: "solver_execution_failed" };
  }
});

// ==================== STRATEGY HEALTH ====================

server.get("/api/strategy-health", async (request, reply) => {
  const auth = requireAdminToken(request);
  if (!auth.ok) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  try {
    const health = await OmniChainSolver.evaluateStrategyHealth();
    return reply.send({
      ok: true,
      ...health,
    });
  } catch (error) {
    return reply.status(500).send({
      ok: false,
      error: error instanceof Error ? error.message : "unknown",
    });
  }
});

// ==================== MARKET INTELLIGENCE ENDPOINTS ====================

import { scanMarketOpportunities, getLastScanResult } from "./market-scanner";
import { sendSetWhitelist, buildWithdrawalTxParams, getVaultTsTonBalance } from "./vault-executor";
import { APPROVED_TOKENS, checkPoolSafety, assessTokenRisk } from "./token-safety";

// GET /api/market-scan — Latest market scanner results (admin)
server.get("/api/market-scan", async (request, reply) => {
  const auth = requireAdminToken(request);
  if (!auth.ok) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  try {
    // Use cached scan if recent, otherwise run fresh
    let scan = getLastScanResult();
    if (!scan || Date.now() - new Date(scan.scannedAt).getTime() > 10 * 60 * 1000) {
      scan = await scanMarketOpportunities(
        OmniChainSolver.getLastKnownApy() ?? undefined,
        OmniChainSolver._lastKnownTvl,
      );
    }

    return reply.send({
      ok: true,
      totalPoolsScanned: scan.marketData.totalPoolsScanned,
      safePoolsFound: scan.marketData.safePools,
      protocolsOnline: scan.marketData.totalProtocolsScanned,
      routeQualityScore: scan.routeQualityScore,
      bestYieldProtocol: scan.bestYieldProtocol,
      bestYieldApy: scan.bestYieldApy,
      rebalanceRecommended: scan.rebalanceRecommended,
      rebalanceReason: scan.rebalanceReason,
      allocationEfficiency: scan.currentAllocationEfficiency,
      pools: scan.marketData.pools.map((p) => ({
        protocol: p.protocol,
        name: p.poolName,
        apy: p.apy,
        riskAdjustedApy: p.riskAdjustedApy,
        tvlTon: p.tvlTon,
        category: p.category,
        safe: p.safetyReport?.overallSafe ?? true,
        riskScore: p.safetyReport?.riskScore ?? 1,
      })),
      scannedAt: scan.scannedAt,
    });
  } catch (error) {
    return reply.status(500).send({
      ok: false,
      error: error instanceof Error ? error.message : "unknown",
    });
  }
});

// GET /api/pool-opportunities — Ranked investment opportunities (admin)
server.get("/api/pool-opportunities", async (request, reply) => {
  const auth = requireAdminToken(request);
  if (!auth.ok) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  try {
    const scan = getLastScanResult();
    if (!scan) {
      return reply.send({ ok: true, opportunities: [], message: "No scan data available yet" });
    }

    return reply.send({
      ok: true,
      opportunities: scan.rankedOpportunities.map((o) => ({
        rank: o.rank,
        protocol: o.pool.protocol,
        poolName: o.pool.poolName,
        apy: o.pool.apy,
        riskAdjustedApy: o.pool.riskAdjustedApy,
        sharpeRatio: o.sharpeRatio,
        netApyAfterCosts: o.netApyAfterCosts,
        recommendedWeight: o.recommendedWeight,
        tvlTon: o.pool.tvlTon,
        category: o.pool.category,
        safe: o.pool.safetyReport?.overallSafe ?? true,
        reason: o.reason,
      })),
    });
  } catch (error) {
    return reply.status(500).send({
      ok: false,
      error: error instanceof Error ? error.message : "unknown",
    });
  }
});

// POST /api/whitelist/set — One-time vault whitelist configuration (admin)
server.post<{ Body: { index: number; target: string } }>(
  "/api/whitelist/set",
  async (request, reply) => {
    const auth = requireAdminToken(request);
    if (!auth.ok) {
      return reply.status(401).send({ error: "unauthorized" });
    }

    const { index, target } = request.body ?? {};
    if (!index || !target || typeof index !== "number" || typeof target !== "string") {
      return reply.status(400).send({ error: "invalid_payload", hint: "Required: { index: 1-5, target: 'EQ...' }" });
    }

    try {
      const result = await sendSetWhitelist(index, target);
      return reply.send({ ok: result.success, ...result });
    } catch (error) {
      return reply.status(500).send({
        ok: false,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  },
);

// GET /api/rebalance/evaluate — Check if rebalancing is recommended (admin)
server.get("/api/rebalance/evaluate", async (request, reply) => {
  const auth = requireAdminToken(request);
  if (!auth.ok) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  try {
    const allocation = await OmniChainSolver.computeRebalancePaths();
    const scan = getLastScanResult();

    return reply.send({
      ok: true,
      currentAllocation: allocation.filter((a) => a.weight > 0),
      optimalAllocation: allocation,
      rebalanceRecommended: scan?.rebalanceRecommended ?? false,
      rebalanceReason: scan?.rebalanceReason ?? null,
      allocationEfficiency: scan?.currentAllocationEfficiency ?? 0,
      vaultInfo: {
        tvlTon: OmniChainSolver._lastKnownTvl,
        tsTonBalance: await getVaultTsTonBalance(),
      },
    });
  } catch (error) {
    return reply.status(500).send({
      ok: false,
      error: error instanceof Error ? error.message : "unknown",
    });
  }
});

// POST /api/withdrawal/build — Build withdrawal tx params for frontend (public, auth required)
server.post<{ Body: { walletAddress: string; burnAmountNton: number } }>(
  "/api/withdrawal/build",
  async (request, reply) => {
    const { walletAddress, burnAmountNton } = request.body ?? {};
    if (!walletAddress || !burnAmountNton || burnAmountNton <= 0) {
      return reply.status(400).send({ error: "invalid_payload" });
    }

    try {
      const txParams = buildWithdrawalTxParams(walletAddress, burnAmountNton);
      return reply.send({
        ok: true,
        txParams,
        instruction: "Send this transaction via TonConnect to burn nTON and receive TON back.",
      });
    } catch (error) {
      return reply.status(500).send({
        ok: false,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  },
);

// GET /api/approved-tokens — List all approved tokens for the UI
server.get("/api/approved-tokens", async (_request, reply) => {
  return reply.send({
    ok: true,
    tokens: APPROVED_TOKENS.map((t) => ({
      symbol: t.symbol,
      name: t.name,
      address: t.address,
      category: t.category,
    })),
  });
});

// GET /api/treasury-check — Check treasury (operator) wallet status (admin)
server.get("/api/treasury-check", async (request, reply) => {
  const auth = requireAdminToken(request);
  if (!auth.ok) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  try {
    const { mnemonicToPrivateKey } = await import("@ton/crypto");
    const { WalletContractV4, TonClient } = await import("@ton/ton");

    const mnemonic = process.env.NEURO_TREASURY_MNEMONIC ?? "";
    if (!mnemonic) {
      return reply.send({ ok: false, error: "NEURO_TREASURY_MNEMONIC not set" });
    }

    const keyPair = await mnemonicToPrivateKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
    const address = wallet.address.toString();

    const client = new TonClient({ endpoint: process.env.TON_RPC_ENDPOINT ?? "https://toncenter.com/api/v2/jsonRPC" });
    const balance = await client.getBalance(wallet.address);

    return reply.send({
      ok: true,
      treasuryAddress: address,
      balanceTon: Number(balance) / 1e9,
      vaultAddress: process.env.NEURO_VAULT_ADDRESS ?? "NOT SET",
      needsFunding: Number(balance) / 1e9 < 0.1,
      minRecommendedTon: 0.5,
    });
  } catch (error) {
    return reply.status(500).send({
      ok: false,
      error: error instanceof Error ? error.message : "unknown",
    });
  }
});

// ==================== STARTUP ====================

import { scheduleAutoCompoundJob } from "./queue";

const port = Number(process.env.PORT ?? 8787);

server
  .listen({ port, host: "0.0.0.0" })
  .then(async () => {
    server.log.info(`NEURO control plane listening on ${port}`);
    try {
      await scheduleAutoCompoundJob();
    } catch (e) {
      server.log.warn(`Non-fatal: queue scheduling failed: ${e}`);
    }
    try {
      await addAdminLog("info", "system", `Control plane started on port ${port}`);
    } catch (e) {
      server.log.warn(`Non-fatal: admin log write failed: ${e}`);
    }
  })
  .catch((error) => {
    server.log.error(error);
    process.exit(1);
  });
