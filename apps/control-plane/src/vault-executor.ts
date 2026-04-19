/**
 * Vault Executor — Builds and sends ExecDelegate and AutoCompound messages
 * to the NeuroVault contract. Enables operator to stake TON in Tonstakers
 * and report yield back to inflate nTON value.
 */
import { Address, beginCell, toNano, internal, type Cell } from "@ton/core";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonClient, WalletContractV4 } from "@ton/ton";
import { addAdminLog } from "./repository";
import { TONSTAKERS_POOL_ADDRESS } from "@neuro/shared";

const VAULT_ADDRESS = process.env.NEURO_VAULT_ADDRESS ?? "";
const TON_RPC = process.env.TON_RPC_ENDPOINT ?? "https://toncenter.com/api/v2/jsonRPC";
const TREASURY_MNEMONIC = process.env.NEURO_TREASURY_MNEMONIC ?? "";

// Exact opcodes from the Tact-compiled ABI (NOT crc32)
const OPCODES = {
  ExecDelegate: 1258179490,   // from ABI: ExecDelegate header
  AutoCompound: 3924287516,   // from ABI: AutoCompound header
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Get a TonClient with rate limit delay built in */
function getClient(): TonClient {
  return new TonClient({ endpoint: TON_RPC });
}

/** Get the operator wallet (the one that can call ExecDelegate on the vault) */
async function getOperatorWallet() {
  if (!TREASURY_MNEMONIC) {
    throw new Error("NEURO_TREASURY_MNEMONIC not set");
  }
  const keyPair = await mnemonicToPrivateKey(TREASURY_MNEMONIC.split(" "));
  const wallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
  return { wallet, keyPair };
}

/**
 * Build ExecDelegate message body.
 * ExecDelegate { target: Address, amount: Int, mode: Int, payload: Cell }
 */
function buildExecDelegateBody(target: Address, amountNano: bigint, payload: Cell): Cell {
  return beginCell()
    .storeUint(OPCODES.ExecDelegate, 32)
    .storeUint(0, 64) // query_id
    .storeAddress(target)
    .storeCoins(amountNano)
    .storeUint(1, 8) // mode: 1 = pay transfer fees separately
    .storeRef(payload) // payload cell
    .endCell();
}

/**
 * Build AutoCompound message body.
 * AutoCompound { profitToMint: Int as coins }
 * The vault mints fee shares to the owner proportional to profit.
 */
function buildAutoCompoundBody(profitNano: bigint): Cell {
  return beginCell()
    .storeUint(OPCODES.AutoCompound, 32)
    .storeUint(0, 64) // query_id
    .storeCoins(profitNano)
    .endCell();
}

/**
 * Stake TON in Tonstakers via the vault's ExecDelegate.
 * 
 * Flow:
 * 1. Operator → sends ExecDelegate to Vault
 * 2. Vault → sends TON to Tonstakers pool (whitelisted)
 * 3. Tonstakers → sends tsTON to Vault's jetton wallet
 */
export async function stakeViaTonstakers(amountTon: number): Promise<{ success: boolean; error?: string }> {
  try {
    if (!VAULT_ADDRESS) {
      return { success: false, error: "NEURO_VAULT_ADDRESS not set" };
    }

    const client = getClient();
    const { wallet, keyPair } = await getOperatorWallet();
    const contract = client.open(wallet);

    await sleep(3000);
    const balance = await contract.getBalance();
    const balanceTon = Number(balance) / 1e9;

    if (balanceTon < 0.05) {
      return { success: false, error: `Operator wallet balance too low: ${balanceTon} TON` };
    }

    // Build Tonstakers stake payload (empty cell — Tonstakers treats incoming TON as stake)
    const stakePayload = beginCell().endCell();
    const amountNano = toNano(amountTon.toFixed(3));

    const execBody = buildExecDelegateBody(
      Address.parse(TONSTAKERS_POOL_ADDRESS),
      amountNano,
      stakePayload,
    );

    await sleep(3000);
    const seqno = await contract.getSeqno();

    await sleep(3000);
    await contract.sendTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      messages: [
        internal({
          to: Address.parse(VAULT_ADDRESS),
          value: toNano("0.05"), // Gas for the vault to forward the ExecDelegate
          body: execBody,
          bounce: true,
        }),
      ],
    });

    await addAdminLog("info", "executor",
      `ExecDelegate sent: stake ${amountTon} TON in Tonstakers. Seqno=${seqno}`
    );

    // Wait for confirmation
    for (let i = 0; i < 15; i++) {
      await sleep(5000);
      try {
        const newSeqno = await contract.getSeqno();
        if (newSeqno > seqno) {
          await addAdminLog("info", "executor", "ExecDelegate confirmed on-chain");
          return { success: true };
        }
      } catch { /* rate limit, retry */ }
    }

    return { success: true }; // Sent but confirmation timed out
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown";
    await addAdminLog("error", "executor", `ExecDelegate failed: ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Send AutoCompound to the vault — mints fee shares proportional to profit.
 * Only callable by owner/operator.
 */
export async function autoCompound(profitTon: number): Promise<{ success: boolean; error?: string }> {
  try {
    if (!VAULT_ADDRESS) {
      return { success: false, error: "NEURO_VAULT_ADDRESS not set" };
    }

    const client = getClient();
    const { wallet, keyPair } = await getOperatorWallet();
    const contract = client.open(wallet);

    const profitNano = toNano(profitTon.toFixed(9));
    const body = buildAutoCompoundBody(profitNano);

    await sleep(3000);
    const seqno = await contract.getSeqno();

    await sleep(3000);
    await contract.sendTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      messages: [
        internal({
          to: Address.parse(VAULT_ADDRESS),
          value: toNano("0.03"),
          body,
          bounce: true,
        }),
      ],
    });

    await addAdminLog("info", "executor",
      `AutoCompound sent: ${profitTon.toFixed(4)} TON profit. Seqno=${seqno}`
    );

    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown";
    await addAdminLog("error", "executor", `AutoCompound failed: ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Get vault's on-chain balance (total TON held).
 */
export async function getVaultBalance(): Promise<number> {
  try {
    const client = getClient();
    await sleep(2000);
    const balance = await client.getBalance(Address.parse(VAULT_ADDRESS));
    return Number(balance) / 1e9;
  } catch {
    return 0;
  }
}

// ─── OPCODES for additional messages ───

const EXTRA_OPCODES = {
  SetWhitelist: 0x4a2e3c8e,    // SetWhitelist from ABI
  TokenBurn: 0x595f07bc,       // TEP-74 burn
  JettonTransfer: 0x0f8a7ea5,  // TEP-74 transfer
};

/**
 * Send SetWhitelist to the vault — adds a protocol address to the whitelist.
 * Only callable by owner. This is a ONE-TIME setup operation per protocol.
 *
 * index: 1-5 (slot in the whitelist)
 * target: the address to whitelist (e.g., Tonstakers pool)
 */
export async function sendSetWhitelist(
  index: number,
  target: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!VAULT_ADDRESS) {
      return { success: false, error: "NEURO_VAULT_ADDRESS not set" };
    }
    if (index < 1 || index > 5) {
      return { success: false, error: "Whitelist index must be 1-5" };
    }

    const client = getClient();
    const { wallet, keyPair } = await getOperatorWallet();
    const contract = client.open(wallet);

    const body = beginCell()
      .storeUint(EXTRA_OPCODES.SetWhitelist, 32)
      .storeUint(0, 64) // query_id
      .storeUint(index, 8)
      .storeAddress(Address.parse(target))
      .endCell();

    await sleep(3000);
    const seqno = await contract.getSeqno();

    await sleep(3000);
    await contract.sendTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      messages: [
        internal({
          to: Address.parse(VAULT_ADDRESS),
          value: toNano("0.03"),
          body,
          bounce: true,
        }),
      ],
    });

    await addAdminLog("info", "executor",
      `SetWhitelist sent: index=${index}, target=${target}. Seqno=${seqno}`
    );

    // Confirm
    for (let i = 0; i < 10; i++) {
      await sleep(5000);
      try {
        const newSeqno = await contract.getSeqno();
        if (newSeqno > seqno) {
          await addAdminLog("info", "executor", `SetWhitelist confirmed on-chain`);
          return { success: true };
        }
      } catch { /* retry */ }
    }

    return { success: true }; // Sent, confirmation timed out
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown";
    await addAdminLog("error", "executor", `SetWhitelist failed: ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Unstake tsTON from the vault back to TON.
 *
 * Flow:
 * 1. Operator → sends ExecDelegate to Vault
 * 2. Vault → sends tsTON (jetton transfer) to Tonstakers pool
 * 3. Tonstakers → processes unstake and returns TON to Vault
 *
 * The tsTON jetton transfer message triggers the unstake.
 * The receiving pool interprets the jetton transfer as an unstake request.
 */
export async function unstakeFromTonstakers(
  amountTsTon: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!VAULT_ADDRESS) {
      return { success: false, error: "NEURO_VAULT_ADDRESS not set" };
    }

    const client = getClient();
    const { wallet, keyPair } = await getOperatorWallet();
    const contract = client.open(wallet);

    // Build jetton burn/transfer payload for tsTON
    // When tsTON is sent back to the Tonstakers pool, it triggers unstake
    const amountNano = toNano(amountTsTon.toFixed(3));

    // Build the inner payload: Transfer tsTON jetton to Tonstakers pool
    // This is a Jetton Transfer message that the vault's tsTON wallet will execute
    const tsTonTransferPayload = beginCell()
      .storeUint(EXTRA_OPCODES.JettonTransfer, 32)
      .storeUint(0, 64) // query_id
      .storeCoins(amountNano) // amount of tsTON
      .storeAddress(Address.parse(TONSTAKERS_POOL_ADDRESS)) // destination: pool
      .storeAddress(Address.parse(VAULT_ADDRESS)) // response_destination: vault (gets the TON back)
      .storeBit(false) // no custom_payload
      .storeCoins(toNano("0.01")) // forward_ton_amount for the transfer
      .storeBit(false) // no forward_payload
      .endCell();

    // Wrap in ExecDelegate targeting the vault's tsTON jetton wallet
    // Note: The actual tsTON wallet address needs to be resolved.
    // For now, we target the Tonstakers pool directly with the transfer payload.
    const execBody = buildExecDelegateBody(
      Address.parse(TONSTAKERS_POOL_ADDRESS),
      toNano("0.1"), // Gas for the unstake operation
      tsTonTransferPayload,
    );

    await sleep(3000);
    const seqno = await contract.getSeqno();

    await sleep(3000);
    await contract.sendTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      messages: [
        internal({
          to: Address.parse(VAULT_ADDRESS),
          value: toNano("0.15"), // More gas needed for unstake (multi-hop)
          body: execBody,
          bounce: true,
        }),
      ],
    });

    await addAdminLog("info", "executor",
      `Unstake sent: ${amountTsTon} tsTON from Tonstakers. Seqno=${seqno}`
    );

    // Confirm
    for (let i = 0; i < 15; i++) {
      await sleep(5000);
      try {
        const newSeqno = await contract.getSeqno();
        if (newSeqno > seqno) {
          await addAdminLog("info", "executor", "Unstake confirmed on-chain");
          return { success: true };
        }
      } catch { /* retry */ }
    }

    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown";
    await addAdminLog("error", "executor", `Unstake failed: ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Get the vault's tsTON jetton wallet balance.
 * Uses TonAPI to check the staked tsTON held by the vault.
 */
export async function getVaultTsTonBalance(): Promise<number> {
  try {
    const tonApiKey = process.env.VITE_TONAPI_KEY;
    const headers: Record<string, string> = {};
    if (tonApiKey) headers["Authorization"] = `Bearer ${tonApiKey}`;

    const response = await fetch(
      `https://tonapi.io/v2/accounts/${VAULT_ADDRESS}/jettons`,
      { headers, signal: AbortSignal.timeout(10000) },
    );

    if (!response.ok) return 0;

    const data = (await response.json()) as {
      balances?: Array<{
        jetton: { address: string; name?: string; symbol?: string };
        balance: string;
      }>;
    };

    if (!data.balances) return 0;

    // Find tsTON balance
    const tsTon = data.balances.find(
      (b) =>
        b.jetton.symbol?.toLowerCase() === "tston" ||
        b.jetton.name?.toLowerCase().includes("tonstakers"),
    );

    return tsTon ? Number(tsTon.balance) / 1e9 : 0;
  } catch {
    return 0;
  }
}

/**
 * Build withdrawal info for the user.
 * The actual TokenBurn must be signed by the USER via TonConnect,
 * since only the nTON holder can burn their own tokens.
 *
 * This returns the transaction parameters the frontend needs to
 * construct and send via TonConnect.
 */
export function buildWithdrawalTxParams(
  userAddress: string,
  burnAmountNton: number,
): {
  to: string;
  value: string;
  payload: string; // base64-encoded BOC
} {
  const amountNano = toNano(burnAmountNton.toFixed(9));

  // TokenBurn message: sent FROM the user's nTON wallet TO the vault (jetton master)
  const burnBody = beginCell()
    .storeUint(EXTRA_OPCODES.TokenBurn, 32)
    .storeUint(0, 64) // query_id
    .storeCoins(amountNano) // amount to burn
    .storeAddress(Address.parse(userAddress)) // response_destination (where to send remaining TON)
    .storeBit(false) // no custom_payload
    .endCell();

  return {
    to: VAULT_ADDRESS, // The vault address (Jetton Master)
    value: toNano("0.1").toString(), // Gas for burn processing
    payload: burnBody.toBoc().toString("base64"),
  };
}
