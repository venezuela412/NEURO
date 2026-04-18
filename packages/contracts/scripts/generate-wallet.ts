import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import { WalletContractV4 } from "@ton/ton";

async function generate() {
    const mnemonics = await mnemonicNew(24);
    const keyPair = await mnemonicToPrivateKey(mnemonics);
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey 
    });
    
    console.log("\n=============================================");
    console.log("🔥 NEURO TREASURY WALLET GENERATED 🔥");
    console.log("=============================================\n");
    console.log("ADDRESS:");
    console.log(wallet.address.toString({ testOnly: true }));
    console.log("\nMNEMONIC (Save this securely!):");
    console.log(mnemonics.join(" "));
    console.log("\n=============================================\n");
}

generate().catch(console.error);
