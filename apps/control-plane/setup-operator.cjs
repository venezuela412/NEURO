/**
 * NeuroTON Operator Setup Script
 * ===============================
 * 
 * This script:
 * 1. Generates a NEW, dedicated operator wallet
 * 2. Saves the mnemonic securely to .env
 * 3. Builds deep links for Tonkeeper so you can:
 *    a) Send UpdateOperator from your MAIN wallet (authorizes the new operator)
 *    b) Send SetWhitelist from your MAIN wallet (authorizes Tonstakers)
 * 
 * YOUR MAIN WALLET MNEMONIC IS NEVER TOUCHED.
 * You sign transactions in Tonkeeper — we just build the links.
 */

const { mnemonicNew, mnemonicToPrivateKey } = require("@ton/crypto");
const { WalletContractV4 } = require("@ton/ton");
const { beginCell, Address, toNano } = require("@ton/core");
const fs = require("fs");
const path = require("path");

// ── Constants ──
const VAULT_ADDRESS = "EQCOs853wgjOcR_BPI1FBRniGu8RSiQLpyLeU6a2RqDDyMup";
const TONSTAKERS_POOL = "EQCkWxfyhAkim3g2DjKQQg8T5P4g-Q1-K_jErGcDJZ4i-vqR";

// Opcodes from compiled Tact ABI
const OPCODES = {
  UpdateOperator: 1643308500,  // storeUpdateOperator
  SetWhitelist:   993790908,   // storeSetWhitelist
};

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  NeuroTON — Secure Operator Wallet Setup             ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // ══════════════════════════════════════════
  // STEP 1: Generate new operator wallet
  // ══════════════════════════════════════════
  console.log("🔑 STEP 1: Generating new operator wallet...\n");

  const mnemonic = await mnemonicNew(24);
  const keyPair = await mnemonicToPrivateKey(mnemonic);
  const wallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
  const operatorAddress = wallet.address.toString({ bounceable: false });
  const operatorAddressBounceable = wallet.address.toString({ bounceable: true });

  console.log("   ✅ New operator wallet generated!");
  console.log(`   📍 Address (bounceable):     ${operatorAddressBounceable}`);
  console.log(`   📍 Address (non-bounceable): ${operatorAddress}`);
  console.log(`   🔐 Mnemonic: (saved to .env — see below)\n`);

  // ══════════════════════════════════════════
  // STEP 2: Save mnemonic to .env
  // ══════════════════════════════════════════
  console.log("💾 STEP 2: Saving operator mnemonic to .env...\n");

  const envPath = path.join(__dirname, ".env");
  let envContent = "";
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  // Remove old mnemonic line if present
  envContent = envContent.replace(/^NEURO_TREASURY_MNEMONIC=.*$/m, "").trim();
  
  // Add the new operator mnemonic
  envContent += `\n\n# Dedicated operator wallet — NOT your main wallet. Safe to store here.\nNEURO_TREASURY_MNEMONIC=${mnemonic.join(" ")}\n`;

  fs.writeFileSync(envPath, envContent);
  console.log(`   ✅ Saved to: ${envPath}`);
  console.log("   ⚠️  This is a DEDICATED operator wallet, NOT your main wallet.\n");

  // ══════════════════════════════════════════
  // STEP 3: Build Tonkeeper deep links
  // ══════════════════════════════════════════
  console.log("🔗 STEP 3: Building Tonkeeper deep links...\n");
  console.log("   You will sign these in Tonkeeper from your MAIN (owner) wallet.\n");

  // 3a. UpdateOperator — set the new operator address on the vault
  const updateOperatorBody = beginCell()
    .storeUint(OPCODES.UpdateOperator, 32)
    .storeAddress(wallet.address)
    .endCell();

  const updateOperatorBoc = updateOperatorBody.toBoc().toString("base64url");
  const updateOperatorLink = `https://app.tonkeeper.com/transfer/${VAULT_ADDRESS}?amount=${toNano("0.03").toString()}&bin=${updateOperatorBoc}`;

  console.log("   ─────────────────────────────────────────────────");
  console.log("   📋 LINK #1: Set New Operator on Vault");
  console.log("   (Authorizes the new wallet to stake & compound)");
  console.log("   ─────────────────────────────────────────────────");
  console.log(`\n   ${updateOperatorLink}\n`);

  // 3b. SetWhitelist — whitelist Tonstakers pool (index 1)
  const setWhitelistBody = beginCell()
    .storeUint(OPCODES.SetWhitelist, 32)
    .storeUint(1, 8)  // index = 1
    .storeAddress(Address.parse(TONSTAKERS_POOL))
    .endCell();

  const setWhitelistBoc = setWhitelistBody.toBoc().toString("base64url");
  const setWhitelistLink = `https://app.tonkeeper.com/transfer/${VAULT_ADDRESS}?amount=${toNano("0.03").toString()}&bin=${setWhitelistBoc}`;

  console.log("   ─────────────────────────────────────────────────");
  console.log("   📋 LINK #2: Whitelist Tonstakers Pool");
  console.log("   (Allows the vault to delegate TON to Tonstakers)");
  console.log("   ─────────────────────────────────────────────────");
  console.log(`\n   ${setWhitelistLink}\n`);

  // ══════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  📋 ACTION PLAN — Do these in order:                 ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log("║                                                      ║");
  console.log("║  STEP A: Fund the new operator wallet                ║");
  console.log("║  → Send 0.1 TON to the operator address below.      ║");
  console.log("║    This covers gas for deploying the wallet.         ║");
  console.log("║                                                      ║");
  console.log(`║  Operator: ${operatorAddress.slice(0, 40)}...      ║`);
  console.log("║                                                      ║");
  console.log("║  STEP B: Open LINK #1 in Tonkeeper                  ║");
  console.log("║  → Signs UpdateOperator with your MAIN wallet.      ║");
  console.log("║  → Cost: ~0.03 TON                                  ║");
  console.log("║                                                      ║");
  console.log("║  STEP C: Open LINK #2 in Tonkeeper                  ║");
  console.log("║  → Signs SetWhitelist with your MAIN wallet.        ║");
  console.log("║  → Cost: ~0.03 TON                                  ║");
  console.log("║                                                      ║");
  console.log("║  STEP D: Fund the vault with gas                    ║");
  console.log("║  → Send 0.5 TON to the vault address:               ║");
  console.log(`║    ${VAULT_ADDRESS}  ║`);
  console.log("║                                                      ║");
  console.log("║  STEP E: Start the control plane                    ║");
  console.log("║  → npx tsx src/index.ts                              ║");
  console.log("║                                                      ║");
  console.log("║  TOTAL COST: ~0.66 TON                               ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // Save links to file for easy access
  const linksFile = path.join(__dirname, "OPERATOR_SETUP_LINKS.txt");
  fs.writeFileSync(linksFile, [
    "NeuroTON Operator Setup Links",
    "==============================",
    "",
    `Operator Address: ${operatorAddress}`,
    `Operator Address (bounceable): ${operatorAddressBounceable}`,
    "",
    "LINK #1 — UpdateOperator (paste in browser or scan QR):",
    updateOperatorLink,
    "",
    "LINK #2 — SetWhitelist Tonstakers (paste in browser or scan QR):",
    setWhitelistLink,
    "",
    `Vault Address: ${VAULT_ADDRESS}`,
    `Tonstakers Pool: ${TONSTAKERS_POOL}`,
    "",
    "IMPORTANT: Sign both links from your MAIN (owner) wallet in Tonkeeper.",
  ].join("\n"));

  console.log(`📄 Links also saved to: ${linksFile}`);
  console.log("   Open these links on your phone where Tonkeeper is installed.\n");
}

main().catch(console.error);
