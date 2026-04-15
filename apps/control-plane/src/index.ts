import Fastify from "fastify";
import cors from "@fastify/cors";

import {
  buildPlanPreviewResponse,
  createMockPortfolio,
  getDefaultPlanRecommendationInput,
  getNeuroOverview,
} from "@neuro/adapters";
import type { PlanRecommendationInput } from "@neuro/shared";

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
