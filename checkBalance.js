const { mnemonicToPrivateKey } = require("@ton/crypto");
const { WalletContractV5R1, WalletContractV4, TonClient, toNano } = require("@ton/ton");

async function check() {
    const mnemonics = "steel duck polar omit unable seed profit awful spell blame arrest north degree siren skull hawk gun math turtle wide iron useless upset exhaust".split(" ");
    const keyPair = await mnemonicToPrivateKey(mnemonics);
    const client = new TonClient({ endpoint: "https://toncenter.com/api/v2/jsonRPC" });
    
    const w5 = WalletContractV5R1.create({ workchain: 0, publicKey: keyPair.publicKey });
    const w4 = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });

    console.log("W5 Address:", w5.address.toString({ testOnly: false }));
    console.log("V4 Address:", w4.address.toString({ testOnly: false }));

    const bal5 = await client.getBalance(w5.address);
    const bal4 = await client.getBalance(w4.address);
    console.log("Mainnet W5 Balance:", bal5.toString());
    console.log("Mainnet V4 Balance:", bal4.toString());
}
check().catch(console.error);
