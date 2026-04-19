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
