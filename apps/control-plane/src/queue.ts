/**
 * Background Job Queue — Autonomous strategy execution engine.
 *
 * Cron jobs:
 * - vault-harvest (every 6h): Check profitability → stake idle TON → compound yield
 * - market-scan (every 5min): Scan all DEXes, rank opportunities, update route quality
 * - strategy-health (daily): Full health assessment and reporting
 * - rebalance-check (every 1h): Evaluate if rebalancing would be profitable
 */
import PgBoss from "pg-boss";
import { OmniChainSolver } from "./solver";
import { addAdminLog } from "./repository";
import {
  stakeViaTonstakers,
  autoCompound,
  getVaultBalance,
  getVaultTsTonBalance,
} from "./vault-executor";
import { scanMarketOpportunities } from "./market-scanner";
import { GAS_COSTS } from "@neuro/shared";

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

  // ═══════════════════════════════════════════════════════
  // JOB 1: VAULT HARVEST — Every 6 hours
  // The core profit-generation loop:
  // 1. Check vault for idle TON → stake in Tonstakers
  // 2. Check if compound is profitable → execute if yes
  // 3. Log all decisions for admin transparency
  // ═══════════════════════════════════════════════════════

  await queue.schedule("vault-harvest", "0 */6 * * *", { trigger: "cron" });

  await queue.work("vault-harvest", async (jobs) => {
    for (const job of jobs) {
      await addAdminLog("info", "queue", `[HARVEST] Job ${job.id} started`);

      try {
        // Step 1: Check for idle TON in the vault that should be staked
        const result = await OmniChainSolver.computeAutoCompoundForVault();
        const idleTon = result.idleTon;

        if (idleTon > 3) {
          // We have idle TON above the minimum deposit threshold (3 TON)
          // Stake it in the best available protocol
          await addAdminLog("info", "queue",
            `[HARVEST] Found ${idleTon.toFixed(2)} idle TON in vault. Initiating stake...`,
          );

          const stakeAmount = idleTon - 0.5; // Keep 0.5 TON for gas
          if (stakeAmount > 3) {
            const stakeResult = await stakeViaTonstakers(stakeAmount);
            if (stakeResult.success) {
              await addAdminLog("info", "queue",
                `[HARVEST] Successfully staked ${stakeAmount.toFixed(2)} TON in Tonstakers`,
              );
            } else {
              await addAdminLog("warn", "queue",
                `[HARVEST] Staking failed: ${stakeResult.error}`,
              );
            }
          }
        }

        // Step 2: Check if compound is profitable
        if (!result.isProfitable) {
          await addAdminLog("info", "queue",
            `[HARVEST] Skipping compound — yield (${(result.profitToMint / 1e9).toFixed(4)} TON) ` +
            `below cost threshold (${result.costEstimateTon} TON). TVL=${result.tvlTon.toFixed(2)} TON`,
          );
          continue;
        }

        // Step 3: Execute compound — report profit to vault
        const profitTon = result.profitToMint / 1e9;

        await addAdminLog("info", "queue",
          `[HARVEST] Compound profitable! Yield=${profitTon.toFixed(4)} TON, ` +
          `APY=${((result.apyEstimate ?? 0) * 100).toFixed(2)}%. ` +
          `Executing AutoCompound...`,
        );

        const compoundResult = await autoCompound(profitTon);

        if (compoundResult.success) {
          await addAdminLog("info", "queue",
            `[HARVEST] AutoCompound executed successfully. ` +
            `${profitTon.toFixed(4)} TON profit registered. nTON value increased.`,
          );
        } else {
          await addAdminLog("error", "queue",
            `[HARVEST] AutoCompound failed: ${compoundResult.error}`,
          );
        }

        await addAdminLog("info", "queue",
          `[HARVEST] Job ${job.id} completed.`,
        );
      } catch (error) {
        await addAdminLog("error", "queue",
          `[HARVEST] Job ${job.id} failed: ${error instanceof Error ? error.message : "unknown"}`,
        );
      }
    }
  });

  // ═══════════════════════════════════════════════════════
  // JOB 2: MARKET SCANNER — Every 5 minutes
  // Continuous intelligence gathering:
  // - Fetch APYs from all DEXes (Tonstakers, STON.fi, DeDust)
  // - Rank pools by risk-adjusted return
  // - Update route quality score
  // - Detect new opportunities
  // ═══════════════════════════════════════════════════════

  await queue.schedule("market-scan", "*/5 * * * *", { trigger: "cron" });

  await queue.work("market-scan", async (jobs) => {
    for (const job of jobs) {
      try {
        const currentApy = OmniChainSolver.getLastKnownApy() ?? undefined;
        const scan = await scanMarketOpportunities(currentApy, OmniChainSolver._lastKnownTvl);

        // Cache results in solver
        OmniChainSolver._lastScanResult = scan;
        OmniChainSolver._lastMarketData = scan.marketData;

        // Only log significant changes
        if (scan.rebalanceRecommended) {
          await addAdminLog("warn", "scanner",
            `[SCAN] Rebalance recommended: ${scan.rebalanceReason}`,
          );
        }
      } catch (error) {
        await addAdminLog("error", "scanner",
          `[SCAN] Failed: ${error instanceof Error ? error.message : "unknown"}`,
        );
      }
    }
  });

  // ═══════════════════════════════════════════════════════
  // JOB 3: STRATEGY HEALTH — Daily at 4 AM UTC
  // Full health assessment and reporting
  // ═══════════════════════════════════════════════════════

  await queue.schedule("strategy-health", "0 4 * * *", { trigger: "cron" });

  await queue.work("strategy-health", async (jobs) => {
    for (const job of jobs) {
      try {
        const health = await OmniChainSolver.evaluateStrategyHealth();

        await addAdminLog("info", "strategy",
          `[HEALTH] TVL=${health.vaultTvlTon.toFixed(2)} TON, ` +
          `idle=${health.vaultIdleTon.toFixed(2)} TON, ` +
          `staked=${health.vaultStakedTon.toFixed(2)} TON, ` +
          `best APY=${((health.bestOverallApy ?? 0) * 100).toFixed(2)}% (${health.bestOverallProtocol}), ` +
          `route_quality=${health.routeQualityScore.toFixed(2)}, ` +
          `efficiency=${(health.allocationEfficiency * 100).toFixed(0)}%, ` +
          `compound_profitable=${health.isCompoundProfitable}, ` +
          `rebalance=${health.rebalanceRecommended ? "YES" : "NO"}`,
        );

        if (health.marketScanSummary) {
          await addAdminLog("info", "strategy",
            `[HEALTH] Market: ${health.marketScanSummary.totalPoolsScanned} pools, ` +
            `${health.marketScanSummary.safePoolsFound} safe, ` +
            `${health.marketScanSummary.protocolsOnline} protocols online. ` +
            `Best staking: ${health.marketScanSummary.bestStakingApy ? `${(health.marketScanSummary.bestStakingApy * 100).toFixed(1)}%` : "N/A"}, ` +
            `Best LP: ${health.marketScanSummary.bestLpApy ? `${(health.marketScanSummary.bestLpApy * 100).toFixed(1)}%` : "N/A"}`,
          );
        }
      } catch (error) {
        await addAdminLog("error", "strategy",
          `[HEALTH] Check failed: ${error instanceof Error ? error.message : "unknown"}`,
        );
      }
    }
  });

  // ═══════════════════════════════════════════════════════
  // JOB 4: REBALANCE CHECK — Every hour
  // Evaluates whether shifting allocation would be profitable
  // Only logs recommendations — actual rebalancing requires admin trigger
  // ═══════════════════════════════════════════════════════

  await queue.schedule("rebalance-check", "15 * * * *", { trigger: "cron" });

  await queue.work("rebalance-check", async (jobs) => {
    for (const job of jobs) {
      try {
        const allocation = await OmniChainSolver.computeRebalancePaths();
        const activeStrategies = allocation.filter((a) => a.weight > 0);

        if (activeStrategies.length > 1) {
          await addAdminLog("info", "rebalancer",
            `[REBALANCE] Optimal allocation: ${activeStrategies.map(
              (a) => `${a.protocol}=${(a.weight * 100).toFixed(0)}%@${((a.currentApy ?? 0) * 100).toFixed(1)}%`
            ).join(", ")}`,
          );
        }
      } catch (error) {
        await addAdminLog("error", "rebalancer",
          `[REBALANCE] Check failed: ${error instanceof Error ? error.message : "unknown"}`,
        );
      }
    }
  });
}
