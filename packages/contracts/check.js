const { mnemonicToPrivateKey } = require('@ton/crypto');
const { WalletContractV4, WalletContractV5R1, TonClient } = require('@ton/ton');

async function check() {
    const mnemonics = "steel duck polar omit unable seed profit awful spell blame arrest north degree siren skull hawk gun math turtle wide iron useless upset exhaust".split(" ");
    const keyPair = await mnemonicToPrivateKey(mnemonics);
    const wallet4 = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    const wallet5 = WalletContractV5R1.create({ workchain: 0, publicKey: keyPair.publicKey });
    
    console.log("V4R2 Address:", wallet4.address.toString({ testOnly: true }));
    console.log("V5R1 Address:", wallet5.address.toString({ testOnly: true }));
    
    const client = new TonClient({
        endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
    });
    
    try {
        const bal4 = await client.getBalance(wallet4.address);
        console.log("Balance V4R2:", bal4.toString());
    } catch(e) { console.log("Bal4 err", e.message); }
    try {
        const bal5 = await client.getBalance(wallet5.address);
        console.log("Balance V5R1:", bal5.toString());
    } catch(e) { console.log("Bal5 err", e.message); }
}
check().catch(console.error);
