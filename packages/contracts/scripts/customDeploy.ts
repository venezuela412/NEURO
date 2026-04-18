import { mnemonicToPrivateKey } from "@ton/crypto";
import { WalletContractV5R1, WalletContractV4, TonClient, toNano } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { NeuroVault } from '../build/NeuroVault/NeuroVault_NeuroVault';

async function deploy() {
    console.log("Starting custom deployment...");
    const mnemonics = "steel duck polar omit unable seed profit awful spell blame arrest north degree siren skull hawk gun math turtle wide iron useless upset exhaust".split(" ");
    const keyPair = await mnemonicToPrivateKey(mnemonics);
    
    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const client = new TonClient({ endpoint });
    console.log("Using endpoint:", endpoint);

    // Test both W5 and V4R2 to see which one has the balance!
    const wallet5 = WalletContractV5R1.create({ workchain: 0, publicKey: keyPair.publicKey });
    const wallet4 = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    
    const bal5 = await client.getBalance(wallet5.address);
    const bal4 = await client.getBalance(wallet4.address);
    
    console.log("W5 Balance:", bal5.toString(), "Address:", wallet5.address.toString({ testOnly: true }));
    console.log("V4R2 Balance:", bal4.toString(), "Address:", wallet4.address.toString({ testOnly: true }));
    
    let activeWallet;
    if (bal5 > 0n) activeWallet = wallet5;
    else if (bal4 > 0n) activeWallet = wallet4;
    else {
        console.error("NO BALANCE ON EITHER WALLET VERSION!");
        return;
    }
    
    console.log("Using active wallet:", activeWallet.address.toString({ testOnly: true }));
    
    const vault = NeuroVault.fromInit(activeWallet.address);
    console.log("Deploying Vault to:", vault.address.toString({ testOnly: true }));
    
    const sender = client.open(activeWallet).sender(keyPair.secretKey);
    const openedVault = client.open(vault);
    
    await openedVault.send(sender, { value: toNano('0.05') }, { $$type: 'Deploy', queryId: 0n });
    console.log("Deployment message sent successfully!");
}
deploy().catch(console.error);
