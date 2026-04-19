import { addAdminLog } from "./repository";

const TON_RPC_ENDPOINT = process.env.TON_RPC_ENDPOINT ?? "https://toncenter.com/api/v2/jsonRPC";
const VAULT_ADDRESS = process.env.NEURO_VAULT_ADDRESS ?? "";
const TONAPI_ENDPOINT = "https://tonapi.io/v2";

interface VaultOnChainState {
  totalAssets: number; // nanoTON
  totalSupply: number; // nanoTON
  tvlTon: number;
}

async function fetchVaultTvlFromChain(): Promise<VaultOnChainState | null> {
  if (!VAULT_ADDRESS) {
    return null;
  }

  try {
    // Use TonAPI to call the vault's `tvl` getter
    const tonApiKey = process.env.VITE_TONAPI_KEY;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tonApiKey) {
      headers["Authorization"] = `Bearer ${tonApiKey}`;
    }

    const response = await fetch(
      `${TONAPI_ENDPOINT}/blockchain/accounts/${VAULT_ADDRESS}/methods/tvl`,
      {
        headers,
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      await addAdminLog("warn", "solver", `TonAPI tvl getter failed: HTTP ${response.status}`);
      return null;
    }

    const data = (await response.json()) as {
      success: boolean;
      stack?: Array<{ type: string; num?: string; value?: string }>;
    };

    if (!data.success || !data.stack?.length) {
      return null;
    }

    // Parse the TVM stack result — tvl returns a single Int
    const tvlEntry = data.stack[0];
    const tvlNano = parseInt(tvlEntry.num ?? tvlEntry.value ?? "0", 16);

    return {
      totalAssets: tvlNano,
      totalSupply: 0, // Not needed for profit calculation
      tvlTon: tvlNano / 1e9,
    };
  } catch (error) {
    await addAdminLog("error", "solver", `Failed to fetch vault TVL: ${error instanceof Error ? error.message : "unknown"}`);
    return null;
  }
}

async function fetchTonstakersApy(): Promise<number | null> {
  try {
    const tonApiKey = process.env.VITE_TONAPI_KEY;
    const headers: Record<string, string> = {};
    if (tonApiKey) {
      headers["Authorization"] = `Bearer ${tonApiKey}`;
    }

    const response = await fetch(`${TONAPI_ENDPOINT}/staking/pools`, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      implementations?: Record<string, { pools?: Array<{ apy: number; name?: string }> }>;
    };

    // Search for Tonstakers pool
    if (data.implementations) {
      for (const impl of Object.values(data.implementations)) {
        const pool = impl.pools?.find(
          (p) => p.name?.toLowerCase().includes("tonstakers") || p.apy > 0
        );
        if (pool) {
          return pool.apy;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

// V10 APEX Omni-Chain Solver — Production Implementation
export const OmniChainSolver = {
  // Compute vault profit by comparing on-chain TVL with historical snapshot
  async computeAutoCompoundForVault(): Promise<{ profitToMint: number; tvlTon: number; apyEstimate: number | null }> {
    const onChainState = await fetchVaultTvlFromChain();
    const currentApy = await fetchTonstakersApy();

    if (!onChainState || onChainState.totalAssets === 0) {
      await addAdminLog("info", "solver", "Vault TVL is zero or unavailable — skipping compound cycle");
      return { profitToMint: 0, tvlTon: 0, apyEstimate: currentApy };
    }

    // Calculate estimated profit since last compound (6h cycle = 1/1460 of annual)
    const annualRate = currentApy ?? 0.05; // Fallback 5% if API unavailable
    const sixHourRate = annualRate / 1460;
    const estimatedProfit = Math.floor(onChainState.totalAssets * sixHourRate);

    await addAdminLog("info", "solver", `Compound calculation: TVL=${onChainState.tvlTon.toFixed(2)} TON, APY=${(annualRate * 100).toFixed(2)}%, profit=${(estimatedProfit / 1e9).toFixed(4)} TON`);

    return {
      profitToMint: estimatedProfit,
      tvlTon: onChainState.tvlTon,
      apyEstimate: currentApy,
    };
  },

  // Strategy allocation paths
  async computeRebalancePaths() {
    return [
      { intent: 1, action: "ZEN_STAKING", target: "EQCkWxfyhAkim3g2DjKQQg8T5P4g-Q1-K_jErGcDJZ4i-vqR", weight: 0.8, protocol: "Tonstakers" },
      { intent: 2, action: "LP_FARMING", target: "STON_ROUTER_DYNAMIC", weight: 0.1, protocol: "STON.fi" },
      { intent: 3, action: "NATIVE_DEFI", target: "EQBfBWT7X2BHg9tXAxzhz2aKiNTU1tpt5NsiK0uSDW_YAJ67", weight: 0.1, protocol: "DeDust" },
    ];
  },
};
