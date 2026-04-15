import Fastify from "fastify";

import { createMockPortfolio, getNeuroOverview } from "@neuro/adapters";

const server = Fastify({
  logger: true,
});

server.get("/health", async () => ({
  ok: true,
  service: "neuro-control-plane",
}));

server.get("/overview", async () => getNeuroOverview());

server.get("/portfolio/demo", async () => createMockPortfolio(100));

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
