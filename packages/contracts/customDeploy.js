const { mnemonicToPrivateKey } = require("@ton/crypto");
const { WalletContractV5R1, WalletContractV4, TonClient, toNano } = require("@ton/ton");
const { getHttpEndpoint } = require("@orbs-network/ton-access");
const { NeuroVault } = require("./build/NeuroVault/NeuroVault_NeuroVault");

async function deploy() {
    console.log("Starting custom deployment...");
    const mnemonics = "steel duck polar omit unable seed profit awful spell blame arrest north degree siren skull hawk gun math turtle wide iron useless upset exhaust".split(" ");
    const keyPair = await mnemonicToPrivateKey(mnemonics);
    
    // Mainnet Ton Access endpoint
    const endpoint = await getHttpEndpoint({ network: "mainnet" });
    const client = new TonClient({ endpoint });
    console.log("Using endpoint:", endpoint);

    const wallet5 = WalletContractV5R1.create({ workchain: 0, publicKey: keyPair.publicKey });
    const wallet4 = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    
    const bal5 = await client.getBalance(wallet5.address);
    const bal4 = await client.getBalance(wallet4.address);
    
    console.log("W5 Balance:", bal5.toString());
    console.log("V4R2 Balance:", bal4.toString());
    
    let activeWallet;
    if (bal5 > 0n) activeWallet = wallet5;
    else if (bal4 > 0n) activeWallet = wallet4;
    else {
        console.error("NO FUNDED WALLET ON TESTNET!");
        return;
    }
    
    console.log("Active wallet chosen:", activeWallet.address.toString({ testOnly: true }));
    
    const vault = NeuroVault.fromInit(activeWallet.address);
    console.log("Deploying Vault to:", vault.address.toString({ testOnly: true }));
    
    const sender = client.open(activeWallet).sender(keyPair.secretKey);
    const openedVault = client.open(vault);
    
    await openedVault.send(sender, { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });
    console.log("DEPLOYMENT EXECUTED SUCCESSFULLY! 🚀");
}
deploy().catch(console.error);
