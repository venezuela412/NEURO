import { beginCell, toNano, Address } from '@ton/core';
import { TonClient, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { NeuroMaster } from '../build/NeuroVault/NeuroVault_NeuroMaster';

import { getHttpEndpoint } from '@orbs-network/ton-access';

async function main() {
    // 1. Initialize TonClient for Mainnet
    const endpoint = await getHttpEndpoint(); // Gets a random unthrottled mainnet RPC
    const client = new TonClient({
        endpoint,
    });

    // 2. Fetch Keeper Mnemonic
    const mnemonic = process.env.NEURO_TREASURY_MNEMONIC || 'solar remain someone weekend adjust sell mother day gather sock paper cart elbow jungle since ocean scissors this salute group entire turkey orbit fashion';
    const key = await mnemonicToPrivateKey(mnemonic.split(' '));

    // 3. Setup Keeper Wallet
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const walletContract = client.open(wallet);
    
    // Check balance
    let balance: bigint;
    try {
        balance = await walletContract.getBalance();
        console.log('Keeper Wallet Address:', wallet.address.toString({ testOnly: false }));
        console.log('Keeper Wallet Balance:', Number(balance) / 1e9, 'TON');
    } catch (e) {
        console.error('Failed to get wallet balance. The wallet might be uninitialized on mainnet.');
        throw e;
    }

    if (balance < toNano('0.2')) {
        throw new Error('Insufficient balance. Please fund the wallet with at least 0.2 TON.');
    }

    // 4. Setup NeuroMaster initial data
    // We set the Keeper as both Owner and Keeper for now, can be updated later if needed.
    const ownerAddress = wallet.address; 
    const keeperAddress = wallet.address;
    
    // Minimal Jetton Content (could be updated later to IPFS JSON)
    const jettonContent = beginCell().storeUint(0, 8).endCell();

    console.log('Initializing NeuroMaster...');
    const masterInit = await NeuroMaster.fromInit(ownerAddress, keeperAddress, jettonContent);
    const masterAddress = masterInit.address;
    
    console.log('NeuroMaster expected address:', masterAddress.toString({ testOnly: false }));

    // Check if already deployed
    const isDeployed = await client.isContractDeployed(masterAddress);
    if (isDeployed) {
        console.log('NeuroMaster is already deployed at this address!');
        return;
    }

    // 5. Deploy
    console.log('Deploying NeuroMaster to Mainnet...');
    
    const seqno = await walletContract.getSeqno();
    
    await walletContract.sendTransfer({
        seqno,
        secretKey: key.secretKey,
        messages: [
            internal({
                to: masterAddress,
                value: toNano('0.15'), // Gas for deployment
                init: {
                    code: masterInit.init!.code,
                    data: masterInit.init!.data
                },
                body: beginCell().storeUint(0, 32).storeStringTail("Deploy").endCell()
            })
        ]
    });

    console.log('Deployment transaction sent. Wait a few seconds to confirm on-chain.');
    console.log(`Explore it at: https://tonviewer.com/${masterAddress.toString({ testOnly: false })}`);
}

main().catch(console.error);
