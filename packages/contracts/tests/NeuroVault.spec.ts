import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { NeuroVault } from '../build/NeuroVault/NeuroVault_NeuroVault';
import '@ton/test-utils';

describe('NeuroVault Core Tests', () => {
    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;
    let user1: SandboxContract<TreasuryContract>;
    let vault: SandboxContract<NeuroVault>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        // Initialize mock treasuries (users)
        owner = await blockchain.treasury('owner');
        user1 = await blockchain.treasury('user1');

        // Deploy the Vault via Tact builder mapping
        vault = blockchain.openContract(await NeuroVault.fromInit(owner.address));

        const deployResult = await vault.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'Deploy', queryId: 0n }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: owner.address,
            to: vault.address,
            deploy: true,
            success: true,
        });
    });

    it('should successfully take deposits and mint exact mapped shares', async () => {
        const depositValue = toNano('2.05'); // 0.05 gas + 2.0 TON capital

        const result = await vault.send(
            user1.getSender(),
            { value: depositValue },
            { $$type: 'Deposit' }
        );

        expect(result.transactions).toHaveTransaction({
            from: user1.address,
            to: vault.address,
            success: true,
        });

        const userShares = await vault.getUserShares(user1.address);
        expect(userShares).toBe(toNano('2.0'));

        const tvl = await vault.getTvl();
        expect(tvl).toBe(toNano('2.0'));
    });

    it('should properly process a successful withdrawal', async () => {
        // Initial Deposit
        await vault.send(
            user1.getSender(),
            { value: toNano('5.05') },
            { $$type: 'Deposit' }
        );

        // Check shares
        let userShares = await vault.getUserShares(user1.address);
        expect(userShares).toBe(toNano('5.0'));

        // Withdraw 2.5 shares
        const withdrawResult = await vault.send(
            user1.getSender(),
            { value: toNano('0.1') }, // Withdrawal execution gas fee sent by user
            { $$type: 'Withdraw', shares: toNano('2.5') }
        );

        expect(withdrawResult.transactions).toHaveTransaction({
            from: user1.address,
            to: vault.address,
            success: true,
        });

        // The vault should have sent Ton out back to the user
        expect(withdrawResult.transactions).toHaveTransaction({
            from: vault.address,
            to: user1.address,
            op: 0, // Text comment or Simple Transfer
            success: true,
        });

        userShares = await vault.getUserShares(user1.address);
        expect(userShares).toBe(toNano('2.5')); // Remaining shares

        const tvl = await vault.getTvl();
        expect(tvl).toBe(toNano('2.5')); // Remaining TVL in Contract accounting
    });

    it('should reject non-owners attempting to harvest', async () => {
        const result = await vault.send(
            user1.getSender(),
            { value: toNano('0.05') },
            { $$type: 'Harvest' }
        );

        // Transaction should fail due to requireOwner() trap
        expect(result.transactions).toHaveTransaction({
            from: user1.address,
            to: vault.address,
            success: false,
            exitCode: 132, // Tact default exit code for Access_Denied
        });
    });
});
