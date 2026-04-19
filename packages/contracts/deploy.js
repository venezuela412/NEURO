/**
 * NeuroVault v2 Deployment Script
 * 
 * Deploys the NeuroVault contract with proper TEP-64 on-chain jetton metadata.
 * Uses tonapi.io for reads and toncenter for sends.
 * 
 * Usage: 
 *   $env:WALLET_MNEMONIC = "word1 word2 ..."
 *   node deploy.js
 */

const { mnemonicToPrivateKey } = require("@ton/crypto");
const { WalletContractV4, TonClient, toNano, beginCell, Dictionary, internal } = require("@ton/ton");
const { NeuroVault } = require("./dist/build/NeuroVault/NeuroVault_NeuroVault");
const crypto = require("crypto");
const https = require("https");

// ─────────────── Helpers ───────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { "Accept": "application/json" } }, (res) => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error(`Parse error: ${data.substring(0, 200)}`)); }
            });
        }).on("error", reject);
    });
}

// ─────────────── TEP-64 On-Chain Metadata ───────────────
function buildOnchainContent() {
    const dict = Dictionary.empty(Dictionary.Keys.Buffer(32), Dictionary.Values.Cell());

    function snakeCell(text) {
        return beginCell()
            .storeUint(0, 8)
            .storeStringTail(text)
            .endCell();
    }

    function sha256(str) {
        return crypto.createHash("sha256").update(str).digest();
    }

    dict.set(sha256("name"),        snakeCell("NeuroTON"));
    dict.set(sha256("description"), snakeCell("Liquid Staking Token for NeuroVault. Deposit TON, receive nTON."));
    dict.set(sha256("symbol"),      snakeCell("nTON"));
    dict.set(sha256("decimals"),    snakeCell("9"));
    dict.set(sha256("image"),       snakeCell("https://neuroton-lime.vercel.app/nton-logo.png"));

    return beginCell()
        .storeUint(0, 8)
        .storeDict(dict)
        .endCell();
}

// ─────────────── Main ───────────────
async function deploy() {
    console.log("═══════════════════════════════════════════════════");
    console.log("   NeuroVault v2 — Mainnet Deployment");
    console.log("═══════════════════════════════════════════════════\n");

    // 1. Load wallet
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) {
        console.error("❌ WALLET_MNEMONIC not set");
        process.exit(1);
    }

    const keyPair = await mnemonicToPrivateKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    const ownerAddress = wallet.address;
    console.log(`🔑 Owner: ${ownerAddress.toString()}`);

    // 2. Check balance via TonAPI (reliable)
    const walletRaw = ownerAddress.toRawString();
    const info = await fetchJSON(`https://tonapi.io/v2/accounts/${encodeURIComponent(ownerAddress.toString())}`);
    const balance = BigInt(info.balance || 0);
    console.log(`💰 Balance: ${Number(balance) / 1e9} TON`);
    console.log(`   Status: ${info.status}`);

    if (balance < toNano("0.06")) {
        console.error(`❌ Need at least 0.06 TON, have ${Number(balance) / 1e9}`);
        process.exit(1);
    }

    // 3. Build metadata & compute address
    const content = buildOnchainContent();
    const vault = await NeuroVault.fromInit(ownerAddress, content);
    console.log(`\n🏦 New vault: ${vault.address.toString()}`);

    // Check if already active
    const vaultInfo = await fetchJSON(`https://tonapi.io/v2/accounts/${encodeURIComponent(vault.address.toString())}`);
    if (vaultInfo.status === "active" && BigInt(vaultInfo.balance || 0) > 0n) {
        console.log(`\n✅ Already deployed! Balance: ${Number(BigInt(vaultInfo.balance)) / 1e9} TON`);
        console.log(`\n📌 NEURO_VAULT_ADDRESS=${vault.address.toString()}`);
        return;
    }

    // 4. Get seqno via TonAPI
    const seqnoData = await fetchJSON(`https://tonapi.io/v2/blockchain/accounts/${encodeURIComponent(ownerAddress.toString())}/methods/seqno`);
    if (!seqnoData.success) {
        console.error("❌ Could not get wallet seqno:", JSON.stringify(seqnoData));
        process.exit(1);
    }
    const seqno = parseInt(seqnoData.stack[0].num, 16);
    console.log(`   Seqno: ${seqno}`);

    // 5. Build & sign the deploy transaction
    console.log("\n🚀 Signing and sending deploy tx...");

    const deployBody = beginCell()
        .storeUint(2490013878, 32) // Deploy opcode
        .storeUint(0, 64)          // queryId
        .endCell();

    const transfer = wallet.createTransfer({
        seqno: seqno,
        secretKey: keyPair.secretKey,
        messages: [
            internal({
                to: vault.address,
                value: toNano("0.05"),
                bounce: false,
                init: vault.init,
                body: deployBody,
            }),
        ],
    });

    // 6. Send via TonCenter (with retry)
    // We need TonClient for sendExternalMessage
    const client = new TonClient({
        endpoint: "https://toncenter.com/api/v2/jsonRPC",
        timeout: 30000,
    });

    let sent = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            await client.sendExternalMessage(wallet, transfer);
            sent = true;
            console.log("   ✅ Transaction sent!");
            break;
        } catch (e) {
            console.log(`   Attempt ${attempt}/3 failed: ${e.message?.substring(0, 80)}`);
            if (attempt < 3) {
                console.log("   Waiting 5s before retry...");
                await sleep(5000);
            }
        }
    }

    if (!sent) {
        console.error("❌ Could not send transaction after 3 attempts");
        console.log("   Try again later or fund the wallet with more TON");
        process.exit(1);
    }

    // 7. Wait for deployment
    console.log("\n⏳ Waiting for on-chain confirmation...");
    for (let i = 0; i < 40; i++) {
        await sleep(3000);
        const check = await fetchJSON(`https://tonapi.io/v2/accounts/${encodeURIComponent(vault.address.toString())}`);
        if (check.status === "active") {
            console.log(`\n✅ DEPLOYED! Balance: ${Number(BigInt(check.balance || 0)) / 1e9} TON`);
            break;
        }
        process.stdout.write(".");
        if (i === 39) {
            console.log("\n⚠️  Timed out. Check manually:");
            console.log(`   https://tonviewer.com/${vault.address.toString()}`);
        }
    }

    // 8. Verify get_jetton_data
    console.log("\n🔍 Verifying jetton data...");
    await sleep(5000);

    const jettonCheck = await fetchJSON(
        `https://tonapi.io/v2/blockchain/accounts/${encodeURIComponent(vault.address.toString())}/methods/get_jetton_data`
    );
    
    if (jettonCheck.success) {
        console.log("✅ get_jetton_data() SUCCESS!");
        console.log(`   Decoded stack: ${JSON.stringify(jettonCheck.decoded)}`);
    } else {
        console.log(`⚠️  get_jetton_data() exit code: ${jettonCheck.exit_code}`);
    }

    // 9. Output
    console.log("\n═══════════════════════════════════════════════════");
    console.log("   DEPLOYMENT COMPLETE");
    console.log("═══════════════════════════════════════════════════");
    console.log(`\n   📌 UPDATE your .env:`);
    console.log(`   NEURO_VAULT_ADDRESS=${vault.address.toString()}`);
    console.log(`\n   🔗 https://tonviewer.com/${vault.address.toString()}`);
    console.log("═══════════════════════════════════════════════════\n");
}

deploy().catch((err) => {
    console.error("Fatal:", err.message || err);
    process.exit(1);
});
