/**
 * Post-deploy setup: SetWhitelist + UpdateOperator
 * Uses the OWNER's wallet to set these (but since operator deployed,
 * we need to use Tonkeeper links for owner-only operations).
 * 
 * Wait — actually the owner IS the Tonkeeper wallet. We can't sign as owner.
 * But the operator CAN'T do owner-only operations.
 * 
 * Let's use the Tonkeeper links approach again, but this time
 * the contract IS deployed so they should work.
 */
const { beginCell, Address, toNano, Cell } = require("@ton/core");

const VAULT_ADDRESS = "EQDPZVeJvyS43Wk3FGlUmnTLxFJdbD-8HpW86_4VLGQS7L1y";
const TONSTAKERS_POOL = "EQCkWxfyhAkim3g2DjKQQg8T5P4g-Q1-K_jErGcDJZ4i-vqR";

// Read operator address from .env
const fs = require("fs");
const { mnemonicToPrivateKey } = require("@ton/crypto");
const { WalletContractV4 } = require("@ton/ton");

const OPCODES = {
  UpdateOperator: 1643308500,
  SetWhitelist: 993790908,
};

async function main() {
  const envContent = fs.readFileSync(require("path").join(__dirname, ".env"), "utf-8");
  const mnemonicLine = envContent.match(/^NEURO_TREASURY_MNEMONIC=(.+)$/m);
  const mnemonic = mnemonicLine[1].trim().split(" ");
  const keyPair = await mnemonicToPrivateKey(mnemonic);
  const operatorWallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });

  // UpdateOperator link
  const updateOpBody = beginCell()
    .storeUint(OPCODES.UpdateOperator, 32)
    .storeAddress(operatorWallet.address)
    .endCell();
  const updateOpBoc = updateOpBody.toBoc().toString("base64url");
  const updateOpLink = `https://app.tonkeeper.com/transfer/${VAULT_ADDRESS}?amount=${toNano("0.03").toString()}&bin=${updateOpBoc}`;

  // SetWhitelist link  
  const whitelistBody = beginCell()
    .storeUint(OPCODES.SetWhitelist, 32)
    .storeUint(1, 8)
    .storeAddress(Address.parse(TONSTAKERS_POOL))
    .endCell();
  const whitelistBoc = whitelistBody.toBoc().toString("base64url");
  const whitelistLink = `https://app.tonkeeper.com/transfer/${VAULT_ADDRESS}?amount=${toNano("0.03").toString()}&bin=${whitelistBoc}`;

  console.log("\n═══════════════════════════════════════");
  console.log("LINK A — SET OPERATOR:");
  console.log(updateOpLink);
  console.log("\n═══════════════════════════════════════");
  console.log("LINK B — WHITELIST TONSTAKERS:");
  console.log(whitelistLink);
  console.log("\n═══════════════════════════════════════\n");
}

main().catch(console.error);
