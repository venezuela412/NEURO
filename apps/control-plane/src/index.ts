import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { z } from "zod";

import {
  buildPlanPreviewResponse,
  createMockPortfolio,
  getDefaultPlanRecommendationInput,
  getNeuroOverview,
} from "@neuro/adapters";
import type { PersistedPortfolioState, PlanRecommendationInput } from "@neuro/shared";
import {
  addExecutionReceipt,
  applySwitchToSafety,
  applyWithdraw,
  countExecutionReceiptRows,
  countPortfolioRows,
  createWalletSession,
  getWalletSession,
  consumeNonce,
  getPersistedPortfolioState,
  isNonceConsumed,
  listExecutionReceipts,
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

server.get("/health", async () => ({
  ok: true,
  service: "neuro-control-plane",
}));

server.get("/overview", async () => getNeuroOverview());

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

  if (header === configured || bearer === configured) {
    return { ok: true as const };
  }

  return { ok: false as const, reason: "forbidden" as const };
}

server.get("/admin/summary", async (request, reply) => {
  const auth = requireAdminToken(request);
  if (!auth.ok) {
    if (auth.reason === "not_configured") {
      reply.code(503);
      return {
        error: "admin_not_configured",
        hint: "Set NEURO_ADMIN_TOKEN on the control plane, then call GET /admin/summary with header X-Neuro-Admin-Token or Authorization: Bearer <token>.",
      };
    }
    reply.code(403);
    return { error: "forbidden" };
  }

  const [portfolioCount, executionCount, portfolios, executions] = await Promise.all([
    countPortfolioRows(),
    countExecutionReceiptRows(),
    listPortfolioSummariesForAdmin(200),
    listRecentExecutionReceiptsForAdmin(100),
  ]);

  return {
    portfolioCount,
    executionReceiptCount: executionCount,
    portfolios,
    recentExecutions: executions,
    note: "Fees shown are MVP estimates from persisted portfolio state (estimatedFeeTon), not settled on-chain to a treasury yet.",
  };
});

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

    return {
      ...result,
      sessionToken: auth.sessionToken,
      sessionExpiresAt: auth.expiresAt,
    };
  } catch (error) {
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

      return {
        ...result,
        sessionToken: auth.sessionToken,
        sessionExpiresAt: auth.expiresAt,
      };
    } catch (error) {
      reply.code(403);
      return { error: error instanceof Error ? error.message : "forbidden" };
    }
  },
);

const port = Number(process.env.PORT ?? 8787);

server
  .listen({ port, host: "0.0.0.0" })
  .then(() => {
    server.log.info(`NEURO control plane listening on ${port}`);
  })
  .catch((error) => {
    server.log.error(error);
    process.exit(1);
  });
