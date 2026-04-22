import { beginCell, toNano, Address } from '@ton/core';
import { TonClient, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { NeuroMaster } from '../build/NeuroVault/NeuroVault_NeuroMaster';

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

import { getHttpEndpoint } from '@orbs-network/ton-access';

async function main() {
    // 1. Initialize TonClient via free orbs-network endpoint (no API key needed)
    const endpoint = await getHttpEndpoint({ network: 'mainnet' });
    const client = new TonClient({ endpoint });
    console.log('✅ Connected to TON mainnet via', endpoint);

    // 2. Fetch Keeper Mnemonic — MUST be set as env var, never hardcoded
    const mnemonic = process.env.NEURO_TREASURY_MNEMONIC;
    if (!mnemonic) {
        console.error('❌ Set NEURO_TREASURY_MNEMONIC env var (24-word phrase)');
        process.exit(1);
    }
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
    const ownerAddress = wallet.address; 
    const keeperAddress = wallet.address;
    
    // Jetton Content — nTON token metadata (v2: generates fresh address)
    const jettonContent = beginCell()
        .storeUint(1, 8)   // on-chain metadata format
        .storeStringTail("nTON")
        .endCell();

    console.log('Initializing NeuroMaster...');
    const masterInit = await NeuroMaster.fromInit(ownerAddress, keeperAddress, jettonContent);
    const masterAddress = masterInit.address;
    
    console.log('NeuroMaster expected address:', masterAddress.toString({ testOnly: false }));

    // Check if already deployed
    const isDeployed = await client.isContractDeployed(masterAddress);
    if (isDeployed) {
        console.log('NeuroMaster is already deployed at this address!');
        console.log(`View it: https://tonviewer.com/${masterAddress.toString({ testOnly: false })}`);
        return;
    }

    // 5. Deploy with retry
    console.log('Deploying NeuroMaster to Mainnet...');
    
    const seqno = await walletContract.getSeqno();
    console.log('Current seqno:', seqno);
    
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
                body: beginCell().storeUint(0x946a98b6, 32).storeUint(0, 64).endCell() // Tact Deploy{queryId: 0}
            })
        ]
    });

    console.log('Deployment transaction sent! Waiting for confirmation...');
    
    // Wait for seqno to increment (confirms the tx was processed)
    for (let i = 0; i < 30; i++) {
        await sleep(2000);
        try {
            const currentSeqno = await walletContract.getSeqno();
            if (currentSeqno > seqno) {
                console.log('✅ Transaction confirmed!');
                break;
            }
        } catch {
            // RPC hiccup, keep retrying
        }
        process.stdout.write('.');
    }

    // Verify deployment
    await sleep(3000);
    const deployed = await client.isContractDeployed(masterAddress);
    if (deployed) {
        console.log(`\n✅ NeuroMaster deployed successfully!`);
    } else {
        console.log(`\n⚠️  Contract may still be deploying. Check in a few seconds.`);
    }
    
    console.log(`\n📋 NEW CONTRACT ADDRESS: ${masterAddress.toString({ testOnly: false })}`);
    console.log(`🔗 View it: https://tonviewer.com/${masterAddress.toString({ testOnly: false })}`);
    console.log(`\n⚠️  UPDATE your .env files with:`);
    console.log(`   NEURO_VAULT_ADDRESS=${masterAddress.toString({ testOnly: false })}`);
    console.log(`   VITE_NEURO_VAULT_ADDRESS=${masterAddress.toString({ testOnly: false })}`);
}

main().catch(console.error);
