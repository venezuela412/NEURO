import PgBoss from "pg-boss";
import { OmniChainSolver } from "./solver";
import { addAdminLog } from "./repository";

let boss: PgBoss | null = null;

export async function getQueue() {
  if (boss) return boss;

  if (!process.env.DATABASE_URL) {
    console.log("No DATABASE_URL set. Skipping PgBoss initialization (Running in local generic mode without queues).");
    return null;
  }

  boss = new PgBoss({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: false } : undefined,
  });

  boss.on("error", (error) => console.error("PgBoss Error:", error));

  await boss.start();
  console.log("PgBoss Control Plane Queue Started");

  return boss;
}

export async function scheduleAutoCompoundJob() {
  const queue = await getQueue();
  if (!queue) return;

  // Schedule harvest every 6 hours
  await queue.schedule("vault-harvest", "0 */6 * * *", { trigger: "cron" });

  // Register the harvest worker
  await queue.work("vault-harvest", async (jobs) => {
    for (const job of jobs) {
      await addAdminLog("info", "queue", `[HARVEST] Job ${job.id} started`);

      try {
        // Step 1: Check if compounding is profitable
        const result = await OmniChainSolver.computeAutoCompoundForVault();

        if (!result.isProfitable) {
          await addAdminLog("info", "queue",
            `[HARVEST] Skipping — yield (${(result.profitToMint / 1e9).toFixed(4)} TON) ` +
            `below cost threshold (${result.costEstimateTon} TON). TVL=${result.tvlTon.toFixed(2)} TON`
          );
          continue;
        }

        // Step 2: Execute compound if profitable
        // This is where the vault executor would:
        // 1. Call ExecDelegate to unstake tsTON from Tonstakers
        // 2. Collect returned TON
        // 3. Call ReportYield on vault with the profit
        const profitTon = result.profitToMint / 1e9;

        await addAdminLog("info", "queue",
          `[HARVEST] Compound profitable! Yield=${profitTon.toFixed(4)} TON, ` +
          `APY=${((result.apyEstimate ?? 0) * 100).toFixed(2)}%. ` +
          `Executing vault harvest...`
        );

        // TODO: Wire to vault-executor.ts when ExecDelegate is ready
        // For now, log the decision but don't execute on-chain
        // This will be real once the Tonstakers whitelist is set
        await addAdminLog("info", "queue",
          `[HARVEST] Job ${job.id} completed. Ready for ExecDelegate execution.`
        );

      } catch (error) {
        await addAdminLog("error", "queue",
          `[HARVEST] Job ${job.id} failed: ${error instanceof Error ? error.message : "unknown"}`
        );
      }
    }
  });

  // Schedule daily strategy health check
  await queue.schedule("strategy-health", "0 4 * * *", { trigger: "cron" });

  await queue.work("strategy-health", async (jobs) => {
    for (const job of jobs) {
      try {
        const health = await OmniChainSolver.evaluateStrategyHealth();
        await addAdminLog("info", "strategy",
          `[HEALTH] TVL=${health.vaultTvlTon.toFixed(2)} TON, ` +
          `APY=${((health.tonstakersApy ?? 0) * 100).toFixed(2)}%, ` +
          `compound_profitable=${health.isCompoundProfitable}`
        );
      } catch (error) {
        await addAdminLog("error", "strategy",
          `[HEALTH] Check failed: ${error instanceof Error ? error.message : "unknown"}`
        );
      }
    }
  });
}
