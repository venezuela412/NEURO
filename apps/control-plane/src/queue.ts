import PgBoss from "pg-boss";

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

  // We schedule a CRON job to run every 6 hours to harvest Yields
  await queue.schedule("vault-harvest", "0 */6 * * *", { trigger: "cron" });
  
  // We register the worker to actually process it
  await queue.work("vault-harvest", async (jobs) => {
    for (const job of jobs) {
      console.log(`[HARVEST] Executing Vault Auto-Compounding Job ${job.id}`);
      
      // Here we would call the STON.fi Router to swap yields back to the principal, 
      // and then call ReportYield to mathematically issue the Performance fee!
      // Since this runs in the background, we rely on the Owner's delegated Exec authority.
      
      // PSEUDO-CODE FOR TON/STON.FI INTERACTION:
      /*
         const vault = await getNeuroVaultContract();
         const yields = await fetchActiveYields();
         const stonfiSwapPayload = buildStonfiSwap(yields);
         await vault.sendExecDelegate(stonfiSwapPayload);
         
         await vault.sendReportYield(totalProfitNano);
      */
      
      console.log(`[HARVEST] Completed.`);
    }
  });
}
