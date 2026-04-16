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
  consumeNonce,
  getPersistedPortfolioState,
  isNonceConsumed,
  listExecutionReceipts,
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

server.get("/health", async () => ({
  ok: true,
  service: "neuro-control-plane",
}));

server.get("/overview", async () => getNeuroOverview());

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
  const result = await applySwitchToSafety(request.params.walletAddress);
  if (!result) {
    reply.code(404);
    return { error: "not_found" };
  }

  return result;
});

server.post<{ Params: { walletAddress: string }; Body: { amountTon?: number } }>(
  "/portfolio/:walletAddress/withdraw",
  async (request, reply) => {
    const parsed = withdrawBodySchema.safeParse(request.body ?? {});
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

    const result = await applyWithdraw(request.params.walletAddress, parsed.data.amountTon);
  if (!result) {
    reply.code(404);
    return { error: "not_found" };
  }

  return result;
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
