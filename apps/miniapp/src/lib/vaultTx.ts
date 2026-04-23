/**
 * Vault Transaction Builder — Constructs on-chain messages for the NeuroVault v3.
 *
 * SECURITY:
 * - All transactions are signed by the USER via TonConnect (non-custodial).
 * - Vault address is hardcoded to prevent DNS/API spoofing.
 * - Message bodies match Tact ABI exactly (verified from compiled bindings).
 * - No private keys touch this file — everything is TonConnect.
 */

import { beginCell, toNano, Address } from "@ton/core";

// ── Hardened v3 Vault Address (immutable on-chain) ──
export const NEURO_VAULT_ADDRESS = "EQCjAVxDnmPPJfld77JuZuGdjN6OvWIrkwiDa8dwxyZ5ZyWQ";

// ── Opcodes from Tact-compiled ABI ──
const OPCODES = {
  deposit: 0x8ea64828, // Deposit { intent: uint8 }
  tokenBurn: 0x595f07bc, // TokenBurn { queryId: uint64, amount: coins, ... }
} as const;

// ═══════════════════════════════════════════════════
// DEPOSIT — Send TON to Vault, receive nTON
// ═══════════════════════════════════════════════════

/**
 * Build a deposit transaction for TonConnect.
 *
 * @param amountTon - Amount of TON to deposit (e.g., 10.5)
 * @param intent - Strategy intent (1 = Safe, 2 = HiFi)
 * @returns TonConnect-ready message object
 */
export function buildDepositMessage(amountTon: number, intent: number = 1) {
  const payload = beginCell()
    .storeUint(OPCODES.deposit, 32)
    .storeUint(intent, 8)
    .endCell();

  return {
    address: NEURO_VAULT_ADDRESS,
    amount: toNano(amountTon.toFixed(9)).toString(),
    payload: payload.toBoc().toString("base64"),
  };
}


// ═══════════════════════════════════════════════════
// WITHDRAWAL — Burn nTON, receive TON back
// ═══════════════════════════════════════════════════

/**
 * Build a withdrawal (burn) transaction for TonConnect.
 * The user sends a TokenBurn to their OWN nTON wallet,
 * which notifies the vault to release underlying TON.
 *
 * @param burnAmountNton - Amount of nTON to burn (e.g., 5.0)
 * @param userAddress - User's TON address (response destination for released TON)
 * @param userNtonWalletAddress - User's nTON jetton wallet address
 * @returns TonConnect-ready message object
 */
export function buildWithdrawalMessage(
  burnAmountNton: number,
  userAddress: string,
  userNtonWalletAddress: string,
) {
  const payload = beginCell()
    .storeUint(OPCODES.tokenBurn, 32)
    .storeUint(0, 64)  // queryId
    .storeCoins(toNano(burnAmountNton.toFixed(9))) // amount to burn
    .storeAddress(Address.parse(userAddress))       // response_destination
    .storeBit(false)    // no custom_payload
    .endCell();

  return {
    address: userNtonWalletAddress,  // Send to USER's nTON wallet, NOT the vault
    amount: toNano("0.1").toString(), // Gas for burn processing
    payload: payload.toBoc().toString("base64"),
  };
}

// ═══════════════════════════════════════════════════
// ON-CHAIN GETTERS via TonAPI
// ═══════════════════════════════════════════════════

/** Get share price: how much TON per 1 nTON (e.g., 1.05 means 5% yield) */
// [FIX C4 + L1] Returns null on failure instead of fake numbers. No longer clamps below 1.0.
export async function getSharePrice(_goal: string = 'safe'): Promise<number | null> {
  try {
    const res = await fetch(
      `https://tonapi.io/v2/blockchain/accounts/${encodeURIComponent(NEURO_VAULT_ADDRESS)}/methods/sharePrice`
    );
    const data = await res.json();
    if (data.success && data.stack?.[0]?.num) {
      return Number(data.stack[0].num) / 1e9;
    }
    return null; // [FIX C4] No fake fallback
  } catch {
    return null; // [FIX C4] No fake fallback
  }
}

/** Get vault TVL in TON */
// [FIX C4] Returns null on failure instead of hardcoded fake numbers.
export async function getVaultTVL(): Promise<number | null> {
  try {
    const res = await fetch(
      `https://tonapi.io/v2/blockchain/accounts/${encodeURIComponent(NEURO_VAULT_ADDRESS)}/methods/tvl`
    );
    const data = await res.json();
    if (data.success && data.stack?.[0]?.num) {
      return Number(data.stack[0].num) / 1e9;
    }
    // Fallback to raw balance if getter fails
    const rawRes = await fetch(`https://tonapi.io/v2/accounts/${encodeURIComponent(NEURO_VAULT_ADDRESS)}`);
    const rawData = await rawRes.json();
    return rawData.balance ? Number(rawData.balance) / 1e9 : null;
  } catch {
    return null; // [FIX C4] No fake fallback
  }
}

/** Check if vault is paused */
export async function getIsPaused(): Promise<boolean> {
  try {
    const res = await fetch(
      `https://tonapi.io/v2/blockchain/accounts/${encodeURIComponent(NEURO_VAULT_ADDRESS)}/methods/isPaused`
    );
    const data = await res.json();
    return data.success && data.stack?.[0]?.num !== "0x0";
  } catch {
    return false;
  }
}

/** Get user's nTON jetton wallet address from the vault */
export async function getUserNtonWalletAddress(userAddress: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://tonapi.io/v2/blockchain/accounts/${encodeURIComponent(NEURO_VAULT_ADDRESS)}/methods/get_wallet_address?args=${encodeURIComponent(userAddress)}`
    );
    const data = await res.json();
    if (data.success && data.decoded?.jetton_wallet_address) {
      return data.decoded.jetton_wallet_address as string;
    }
    return null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════
// TRANSACTION HISTORY
// ═══════════════════════════════════════════════════

export interface VaultTransaction {
  hash: string;
  time: number;
  type: "deposit" | "withdrawal" | "yield" | "compound" | "unknown";
  amount: number;
  status: "success" | "failed";
}

/** Get user's transactions related to the vault */
/** Alias for getVaultTVL */
export const getTVL = getVaultTVL;

/** Get user's nTON share balance */
export async function getUserShares(userAddress: string): Promise<number> {
  try {
    // First get the user's nTON jetton wallet address
    const walletAddr = await getUserNtonWalletAddress(userAddress);
    if (!walletAddr) return 0;
    // Then query it for balance
    const res = await fetch(
      `https://tonapi.io/v2/blockchain/accounts/${encodeURIComponent(walletAddr)}/methods/get_wallet_data`
    );
    const data = await res.json();
    if (data.success && data.stack?.[0]?.num) {
      return Number(data.stack[0].num) / 1e9;
    }
    return 0;
  } catch {
    return 0;
  }
}

// [FIX C3] Removed all fake/simulated "Yield Payout" transactions.
// Transaction history now shows ONLY real on-chain data.
export async function getTransactionHistory(userAddress: string, _goal: string = 'safe'): Promise<Array<{
  type: string;
  amount: string;
  timestamp: number;
  hash: string;
}>> {
  const txs = await getUserVaultTransactions(userAddress);
  return txs.map(tx => ({
    type: tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
    amount: tx.amount.toFixed(4),
    timestamp: tx.time,
    hash: tx.hash,
  })).slice(0, 20);
}

export async function getUserVaultTransactions(userAddress: string): Promise<VaultTransaction[]> {
  try {
    const res = await fetch(
      `https://tonapi.io/v2/accounts/${encodeURIComponent(userAddress)}/events?limit=50`
    );
    const data = await res.json();
    if (!data.events) return [];

    const vaultAddr = Address.parse(NEURO_VAULT_ADDRESS).toRawString();

    return data.events
      .filter((evt: any) => {
        const actions = evt.actions || [];
        return actions.some((a: any) => {
          const src = a.TonTransfer?.sender?.address || a.JettonTransfer?.sender?.address || "";
          const dst = a.TonTransfer?.recipient?.address || a.JettonTransfer?.recipient?.address || "";
          return src === vaultAddr || dst === vaultAddr ||
                 a.TonTransfer?.sender?.address?.includes(vaultAddr) ||
                 a.TonTransfer?.recipient?.address?.includes(vaultAddr);
        });
      })
      .map((evt: any): VaultTransaction => {
        const action = evt.actions?.[0];
        const tonTransfer = action?.TonTransfer;
        const jettonTransfer = action?.JettonTransfer;

        const amount = tonTransfer
          ? Number(tonTransfer.amount) / 1e9
          : jettonTransfer
            ? Number(jettonTransfer.amount) / 1e9
            : 0;

        const isToVault = tonTransfer?.recipient?.address === vaultAddr;
        let type: VaultTransaction["type"] = "unknown";
        if (isToVault) type = "deposit";
        else if (jettonTransfer) type = "withdrawal";
        else type = "yield";

        return {
          hash: evt.event_id || "",
          time: evt.timestamp || 0,
          type,
          amount: Math.abs(amount),
          status: evt.in_progress ? "failed" : "success",
        };
      })
      .filter((tx: VaultTransaction) => tx.amount >= 0.001)
      .slice(0, 20);
  } catch {
    return [];
  }
}
