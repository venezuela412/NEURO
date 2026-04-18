import { mnemonicToPrivateKey } from "@ton/crypto";
import { WalletContractV4 } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient } from "@ton/ton";

async function check() {
    const mnemonics = "steel duck polar omit unable seed profit awful spell blame arrest north degree siren skull hawk gun math turtle wide iron useless upset exhaust".split(" ");
    const keyPair = await mnemonicToPrivateKey(mnemonics);
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    
    console.log("Wallet address:", wallet.address.toString({ testOnly: true }));
    
    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const client = new TonClient({ endpoint });
    
    const balance = await client.getBalance(wallet.address);
    console.log("Balance:", balance.toString());
    
    const state = await client.getContractState(wallet.address);
    console.log("State:", state.state);
}

check().catch(console.error);
