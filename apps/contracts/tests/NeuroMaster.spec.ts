import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano, beginCell } from '@ton/core';
import { NeuroMaster } from '../build/NeuroVault/NeuroVault_NeuroMaster';
import { NeuroWallet } from '../build/NeuroVault/NeuroVault_NeuroWallet';
import '@ton/test-utils';

describe('NeuroMaster TEP-74 Protocol', () => {
    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;
    let keeper: SandboxContract<TreasuryContract>;
    let user: SandboxContract<TreasuryContract>;
    let master: SandboxContract<NeuroMaster>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        owner = await blockchain.treasury('owner');
        keeper = await blockchain.treasury('keeper');
        user = await blockchain.treasury('user');

        master = blockchain.openContract(await NeuroMaster.fromInit(
            owner.address,
            keeper.address,
            beginCell().endCell() // Empty jetton content for tests
        ));

        const deployResult = await master.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'Deploy', queryId: 0n }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: owner.address,
            to: master.address,
            deploy: true,
            success: true,
        });
    });

    it('should mint nTON upon user deposit', async () => {
        const depositAmount = toNano('10');
        const depositResult = await master.send(
            user.getSender(),
            { value: depositAmount },
            { $$type: 'Deposit', intent: 1n }
        );

        expect(depositResult.transactions).toHaveTransaction({
            from: user.address,
            to: master.address,
            success: true,
        });

        // The master should have forwarded the minted nTON to a wallet
        const userWalletAddress = await master.getGetWalletAddress(user.address);
        expect(depositResult.transactions).toHaveTransaction({
            from: master.address,
            to: userWalletAddress,
            success: true, // Jetton Wallet deployment and initial transfer
        });

        const tvl = await master.getTvl();
        // TVL should equal 10 TON minus the 0.05 TON gas
        expect(tvl).toEqual(depositAmount - toNano('0.05'));
    });

    it('should block non-keepers from executing rebalances', async () => {
        // User deposits
        await master.send(
            user.getSender(),
            { value: toNano('10') },
            { $$type: 'Deposit', intent: 1n }
        );

        // User attempts to execute rebalance
        const rebalanceResult = await master.send(
            user.getSender(),
            { value: toNano('0.1') },
            { 
                $$type: 'ExecuteRebalance', 
                queryId: 0n, 
                amount: toNano('5'), 
                destination: user.address 
            }
        );

        expect(rebalanceResult.transactions).toHaveTransaction({
            from: user.address,
            to: master.address,
            success: false, // Unauthorized!
            exitCode: 9530 // Custom string require error code
        });
    });

    it('should allow keeper to execute rebalances', async () => {
        await master.send(
            user.getSender(),
            { value: toNano('10') },
            { $$type: 'Deposit', intent: 1n }
        );

        const defiAddress = await blockchain.treasury('defi_pool');

        // Keeper executes rebalance
        const rebalanceResult = await master.send(
            keeper.getSender(),
            { value: toNano('0.1') },
            { 
                $$type: 'ExecuteRebalance', 
                queryId: 0n, 
                amount: toNano('5'), 
                destination: defiAddress.address 
            }
        );

        expect(rebalanceResult.transactions).toHaveTransaction({
            from: keeper.address,
            to: master.address,
            success: true
        });

        // Funds should have arrived at the DeFi pool
        expect(rebalanceResult.transactions).toHaveTransaction({
            from: master.address,
            to: defiAddress.address,
            success: true
        });
    });
});
