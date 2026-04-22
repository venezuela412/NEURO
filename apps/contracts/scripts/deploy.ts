import { beginCell, toNano, Address, external, storeMessage } from '@ton/core';
import { TonClient, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { NeuroMaster } from '../build/NeuroVault/NeuroVault_NeuroMaster';
import { getHttpEndpoint } from '@orbs-network/ton-access';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, label: string, maxRetries = 5): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (e: any) {
            const status = e?.response?.status || e?.status;
            if (attempt === maxRetries) throw e;
            const delay = Math.min(2000 * Math.pow(2, attempt - 1), 15000);
            console.log(`  ⚠️  ${label} failed (${status || e.message}), retry ${attempt}/${maxRetries} in ${delay/1000}s...`);
            await sleep(delay);
        }
    }
    throw new Error('Unreachable');
}

async function main() {
    console.log('⏳ Waiting 5s for rate limits to reset...');
    await sleep(5000);

    // 1. Connect via orbs (reads work fine)
    const endpoint = await getHttpEndpoint({ network: 'mainnet' });
    const client = new TonClient({ endpoint });
    console.log('✅ Connected via orbs:', endpoint);

    // 2. TONAPI key for sending transactions (reads via orbs, writes via tonapi.io)
    const tonapiKey = 'AHOUDU55XSKJ42QAAAAJCI3JPJFNK35PQFOC55UYIYOC2K2HVD52ZAEMKRWIKXR2EGFCV4Y';

    // 3. Fetch Keeper Mnemonic
    const mnemonic = process.env.NEURO_TREASURY_MNEMONIC;
    if (!mnemonic) {
        console.error('❌ Set NEURO_TREASURY_MNEMONIC env var (24-word phrase)');
        process.exit(1);
    }
    const key = await mnemonicToPrivateKey(mnemonic.split(' '));

    // 4. Setup Keeper Wallet
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const walletContract = client.open(wallet);
    
    const balance = await withRetry(() => walletContract.getBalance(), 'getBalance');
    console.log('Keeper Wallet Address:', wallet.address.toString({ testOnly: false }));
    console.log('Keeper Wallet Balance:', Number(balance) / 1e9, 'TON');

    if (balance < toNano('0.2')) {
        throw new Error('Insufficient balance. Please fund the wallet with at least 0.2 TON.');
    }

    // 5. Setup NeuroMaster
    const ownerAddress = wallet.address; 
    const keeperAddress = wallet.address;
    
    const jettonContent = beginCell()
        .storeUint(1, 8)
        .storeStringTail("nTON")
        .endCell();

    console.log('Initializing NeuroMaster...');
    const masterInit = await NeuroMaster.fromInit(ownerAddress, keeperAddress, jettonContent);
    const masterAddress = masterInit.address;
    console.log('NeuroMaster expected address:', masterAddress.toString({ testOnly: false }));

    await sleep(2000);

    const isDeployed = await withRetry(() => client.isContractDeployed(masterAddress), 'isContractDeployed');
    if (isDeployed) {
        console.log('✅ NeuroMaster is already deployed at this address!');
        console.log(`📋 CONTRACT ADDRESS: ${masterAddress.toString({ testOnly: false })}`);
        console.log(`🔗 View it: https://tonviewer.com/${masterAddress.toString({ testOnly: false })}`);
        return;
    }

    await sleep(2000);

    console.log('Deploying NeuroMaster to Mainnet...');
    const seqno = await withRetry(() => walletContract.getSeqno(), 'getSeqno');
    console.log('Current seqno:', seqno);

    // 6. Build the signed transfer message locally (don't send via TonClient)
    const transferBody = wallet.createTransfer({
        seqno,
        secretKey: key.secretKey,
        messages: [
            internal({
                to: masterAddress,
                value: toNano('0.15'),
                init: {
                    code: masterInit.init!.code,
                    data: masterInit.init!.data
                },
                body: beginCell().storeUint(0x946a98b6, 32).storeUint(0, 64).endCell()
            })
        ]
    });

    // 7. Wrap as external message and serialize as BOC
    const ext = external({
        to: wallet.address,
        body: transferBody,
    });
    const boc = beginCell().store(storeMessage(ext)).endCell().toBoc().toString('base64');
    console.log('✅ Transaction signed locally. Sending via TonAPI...');

    // 8. Send via TonAPI REST endpoint (bypasses broken orbs sendBoc)
    const sendResult = await withRetry(async () => {
        const res = await fetch('https://tonapi.io/v2/blockchain/message', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tonapiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ boc }),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`TonAPI ${res.status}: ${text}`);
        }
        return res;
    }, 'sendBoc-tonapi');

    console.log('✅ Deployment transaction sent via TonAPI! Waiting for confirmation...');
    
    // 9. Wait for seqno to increment
    for (let i = 0; i < 30; i++) {
        await sleep(3000);
        try {
            const currentSeqno = await walletContract.getSeqno();
            if (currentSeqno > seqno) {
                console.log('✅ Transaction confirmed!');
                break;
            }
        } catch {
            // RPC hiccup
        }
        process.stdout.write('.');
    }

    // 10. Verify
    await sleep(5000);
    try {
        const deployed = await withRetry(() => client.isContractDeployed(masterAddress), 'verifyDeploy');
        if (deployed) {
            console.log(`\n✅ NeuroMaster deployed successfully!`);
        } else {
            console.log(`\n⚠️  Contract may still be deploying. Check the link below.`);
        }
    } catch {
        console.log(`\n⚠️  Could not verify. Check the link below manually.`);
    }
    
    console.log(`\n📋 NEW CONTRACT ADDRESS: ${masterAddress.toString({ testOnly: false })}`);
    console.log(`🔗 View it: https://tonviewer.com/${masterAddress.toString({ testOnly: false })}`);
    console.log(`\n⚠️  UPDATE your .env files with:`);
    console.log(`   NEURO_VAULT_ADDRESS=${masterAddress.toString({ testOnly: false })}`);
    console.log(`   VITE_NEURO_VAULT_ADDRESS=${masterAddress.toString({ testOnly: false })}`);
}

main().catch(console.error);
