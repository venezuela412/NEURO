/**
 * Auto-deploy script: polls the deployer wallet until it has enough balance,
 * then automatically deploys the hardened NeuroVault v3.
 */

const { mnemonicToPrivateKey } = require("@ton/crypto");
const { WalletContractV4, TonClient, toNano, beginCell, Dictionary, internal } = require("@ton/ton");
const { NeuroVault } = require("./dist/build/NeuroVault/NeuroVault_NeuroVault");
const crypto = require("crypto");
const https = require("https");

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

function buildOnchainContent() {
    const dict = Dictionary.empty(Dictionary.Keys.Buffer(32), Dictionary.Values.Cell());
    function snakeCell(text) {
        return beginCell().storeUint(0, 8).storeStringTail(text).endCell();
    }
    function sha256(str) {
        return crypto.createHash("sha256").update(str).digest();
    }
    dict.set(sha256("name"),        snakeCell("NeuroTON"));
    dict.set(sha256("description"), snakeCell("Liquid Staking Token for NeuroVault. Deposit TON, receive nTON."));
    dict.set(sha256("symbol"),      snakeCell("nTON"));
    dict.set(sha256("decimals"),    snakeCell("9"));
    dict.set(sha256("image"),       snakeCell("https://neuroton-lime.vercel.app/nton-logo.png"));
    return beginCell().storeUint(0, 8).storeDict(dict).endCell();
}

async function main() {
    console.log("═══════════════════════════════════════════════════");
    console.log("   NeuroVault v3 — HARDENED — Auto-Deploy");
    console.log("═══════════════════════════════════════════════════\n");

    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) { console.error("❌ WALLET_MNEMONIC not set"); process.exit(1); }

    const keyPair = await mnemonicToPrivateKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    const ownerAddress = wallet.address;

    const content = buildOnchainContent();
    const vault = await NeuroVault.fromInit(ownerAddress, content);
    
    console.log(`🔑 Deployer: ${ownerAddress.toString()}`);
    console.log(`🏦 Target vault: ${vault.address.toString()}`);

    // Check if already deployed
    const vaultInfo = await fetchJSON(`https://tonapi.io/v2/accounts/${encodeURIComponent(vault.address.toString())}`);
    if (vaultInfo.status === "active") {
        // Verify it's the v3 contract by checking isPaused getter
        const pauseCheck = await fetchJSON(
            `https://tonapi.io/v2/blockchain/accounts/${encodeURIComponent(vault.address.toString())}/methods/isPaused`
        );
        if (pauseCheck.success) {
            console.log("\n✅ Hardened v3 already deployed and verified!");
            console.log(`   isPaused: ${pauseCheck.stack[0].num === "0x0" ? "false" : "true"}`);
            console.log(`\n📌 NEURO_VAULT_ADDRESS=${vault.address.toString()}`);
            return;
        }
    }

    // Poll for balance
    const MIN_BALANCE = 50000000n; // 0.05 TON
    console.log(`\n⏳ Waiting for deployer to have ≥0.05 TON...`);
    console.log(`   Send TON to: ${ownerAddress.toString()}\n`);

    while (true) {
        const info = await fetchJSON(`https://tonapi.io/v2/accounts/${encodeURIComponent(ownerAddress.toString())}`);
        const balance = BigInt(info.balance || 0);
        process.stdout.write(`\r   Balance: ${(Number(balance) / 1e9).toFixed(4)} TON`);
        
        if (balance >= MIN_BALANCE) {
            console.log(" — SUFFICIENT!\n");
            break;
        }
        await sleep(5000);
    }

    // Get seqno
    const seqnoData = await fetchJSON(`https://tonapi.io/v2/blockchain/accounts/${encodeURIComponent(ownerAddress.toString())}/methods/seqno`);
    const seqno = parseInt(seqnoData.stack[0].num, 16);
    console.log(`   Seqno: ${seqno}`);

    // Build deploy tx
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
                value: toNano("0.03"),
                bounce: false,
                init: vault.init,
                body: deployBody,
            }),
        ],
    });

    // Send
    console.log("\n🚀 Deploying hardened vault...");
    const client = new TonClient({ endpoint: "https://toncenter.com/api/v2/jsonRPC", timeout: 30000 });

    let sent = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            await client.sendExternalMessage(wallet, transfer);
            sent = true;
            console.log("   ✅ Transaction sent!");
            break;
        } catch (e) {
            console.log(`   Attempt ${attempt}/5: ${e.message?.substring(0, 60)}`);
            await sleep(3000);
        }
    }

    if (!sent) { console.error("❌ Failed to send"); process.exit(1); }

    // Wait for deployment
    console.log("\n⏳ Waiting for on-chain confirmation...");
    for (let i = 0; i < 40; i++) {
        await sleep(3000);
        const check = await fetchJSON(`https://tonapi.io/v2/accounts/${encodeURIComponent(vault.address.toString())}`);
        if (check.status === "active") {
            console.log(`\n✅ DEPLOYED!`);
            break;
        }
        process.stdout.write(".");
    }

    // Verify hardened getters
    console.log("\n🔍 Verifying hardened contract...");
    await sleep(5000);

    const tests = [
        { name: "get_jetton_data", path: "get_jetton_data" },
        { name: "isPaused",        path: "isPaused" },
        { name: "sharePrice",      path: "sharePrice" },
        { name: "depositFee",      path: "depositFee" },
        { name: "maxDelegatePercent", path: "maxDelegatePercent" },
        { name: "tvl",             path: "tvl" },
    ];

    for (const test of tests) {
        const result = await fetchJSON(
            `https://tonapi.io/v2/blockchain/accounts/${encodeURIComponent(vault.address.toString())}/methods/${test.path}`
        );
        const status = result.success ? "✅" : "❌";
        let value = "";
        if (result.success && result.stack && result.stack[0]) {
            if (result.stack[0].type === "num") {
                value = ` = ${parseInt(result.stack[0].num, 16)}`;
            } else if (result.decoded) {
                value = ` (decoded)`;
            }
        }
        console.log(`   ${status} ${test.name}${value}`);
    }

    console.log("\n═══════════════════════════════════════════════════");
    console.log("   🛡️  HARDENED VAULT DEPLOYED");
    console.log("═══════════════════════════════════════════════════");
    console.log(`\n   📌 NEURO_VAULT_ADDRESS=${vault.address.toString()}`);
    console.log(`   🔗 https://tonviewer.com/${vault.address.toString()}`);
    console.log("═══════════════════════════════════════════════════\n");
}

main().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
