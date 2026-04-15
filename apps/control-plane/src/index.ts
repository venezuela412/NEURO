import Fastify from "fastify";
import cors from "@fastify/cors";

import {
  buildPlanPreviewResponse,
  createMockPortfolio,
  getDefaultPlanRecommendationInput,
  getNeuroOverview,
} from "@neuro/adapters";
import type { PersistedPortfolioState, PlanRecommendationInput } from "@neuro/shared";
import {
  addExecutionReceipt,
  getPersistedPortfolioState,
  listExecutionReceipts,
  savePersistedPortfolioState,
} from "./repository";

const server = Fastify({
  logger: true,
});

await server.register(cors, {
  origin: true,
});

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
  const body = request.body ?? {};
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

server.put<{ Params: { walletAddress: string }; Body: PersistedPortfolioState }>(
  "/portfolio/:walletAddress/state",
  async (request) => {
    const state = {
      ...request.body,
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
