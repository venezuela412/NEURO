import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano, beginCell } from '@ton/core';
import { NeuroVault } from '../build/NeuroVault/NeuroVault_NeuroVault';
import '@ton/test-utils';

describe('NeuroVault Core Tests', () => {
    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;
    let user1: SandboxContract<TreasuryContract>;
    let vault: SandboxContract<NeuroVault>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        owner = await blockchain.treasury('owner');
        user1 = await blockchain.treasury('user1');

        // Deploy the Vault with a content cell
        const content = beginCell().storeStringTail("NeuroTON nTON").endCell();
        vault = blockchain.openContract(await NeuroVault.fromInit(owner.address, content));

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

    it('should successfully take deposits and mint nTON shares', async () => {
        // Deposit must be >= 3 TON (minDepositAmount)
        const depositValue = toNano('3.05'); // 0.05 gas + 3 TON capital

        const result = await vault.send(
            user1.getSender(),
            { value: depositValue },
            { $$type: 'Deposit', intent: 1n } // intent: 1 = Safe
        );

        expect(result.transactions).toHaveTransaction({
            from: user1.address,
            to: vault.address,
            success: true,
        });

        // Check TVL increased
        const tvl = await vault.getTvl();
        expect(tvl).toBeGreaterThan(0n);
    });

    it('should reject deposits below minimum (3 TON)', async () => {
        const result = await vault.send(
            user1.getSender(),
            { value: toNano('1.0') }, // Below 3 TON minimum
            { $$type: 'Deposit', intent: 1n }
        );

        expect(result.transactions).toHaveTransaction({
            from: user1.address,
            to: vault.address,
            success: false,
        });
    });

    it('should allow owner to set whitelist addresses', async () => {
        const protocolAddress = await blockchain.treasury('tonstakers');

        const result = await vault.send(
            owner.getSender(),
            { value: toNano('0.05') },
            {
                $$type: 'SetWhitelist',
                index: 1n,
                target: protocolAddress.address,
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: vault.address,
            success: true,
        });

        const count = await vault.getWhitelistCount();
        expect(count).toBe(1n);
    });

    it('should allow owner to execute ExecDelegate to whitelisted target', async () => {
        const protocol = await blockchain.treasury('protocol');

        // First deposit some funds
        await vault.send(
            user1.getSender(),
            { value: toNano('5.0') },
            { $$type: 'Deposit', intent: 1n }
        );

        // Whitelist the protocol
        await vault.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'SetWhitelist', index: 1n, target: protocol.address }
        );

        // Execute delegate to whitelisted target
        const result = await vault.send(
            owner.getSender(),
            { value: toNano('0.1') },
            {
                $$type: 'ExecDelegate',
                target: protocol.address,
                amount: toNano('1.0'),
                mode: 2n, // SendIgnoreErrors
                payload: null,
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: vault.address,
            to: protocol.address,
            success: true,
        });
    });

    it('should REJECT ExecDelegate to non-whitelisted target', async () => {
        const hacker = await blockchain.treasury('hacker');

        // Deposit funds first
        await vault.send(
            user1.getSender(),
            { value: toNano('5.0') },
            { $$type: 'Deposit', intent: 1n }
        );

        // Try to send to non-whitelisted address
        const result = await vault.send(
            owner.getSender(),
            { value: toNano('0.1') },
            {
                $$type: 'ExecDelegate',
                target: hacker.address,
                amount: toNano('1.0'),
                mode: 2n,
                payload: null,
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: vault.address,
            success: false,
        });
    });

    it('should reject non-owners attempting ExecDelegate', async () => {
        const hacker = await blockchain.treasury('hacker');

        const result = await vault.send(
            user1.getSender(),
            { value: toNano('0.05') },
            {
                $$type: 'ExecDelegate',
                target: hacker.address,
                amount: toNano('1.0'),
                mode: 2n,
                payload: null,
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: user1.address,
            to: vault.address,
            success: false,
        });
    });

    it('should cap AutoCompound profit to 5% of totalAssets', async () => {
        // Deposit first
        await vault.send(
            user1.getSender(),
            { value: toNano('10.0') },
            { $$type: 'Deposit', intent: 1n }
        );

        // Try to compound with more than 5% profit — should fail
        const result = await vault.send(
            owner.getSender(),
            { value: toNano('0.05') },
            {
                $$type: 'AutoCompound',
                profitToMint: toNano('2.0'), // Way more than 5% of ~10 TON
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: vault.address,
            success: false, // Should be rejected by the cap
        });
    });

    it('should allow AutoCompound within the cap', async () => {
        // Deposit
        await vault.send(
            user1.getSender(),
            { value: toNano('100.0') },
            { $$type: 'Deposit', intent: 1n }
        );

        // Compound within 5% cap (~5 TON from 100 TON)
        const result = await vault.send(
            owner.getSender(),
            { value: toNano('0.05') },
            {
                $$type: 'AutoCompound',
                profitToMint: toNano('3.0'), // Within 5% of ~100 TON
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: vault.address,
            success: true,
        });
    });

    it('should allow owner to update performance fee (max 30%)', async () => {
        const result = await vault.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'UpdateFee', performanceFeePrecise: 1500n } // 15%
        );

        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: vault.address,
            success: true,
        });
    });

    it('should reject fee above 30%', async () => {
        const result = await vault.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'UpdateFee', performanceFeePrecise: 5000n } // 50% — too high
        );

        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: vault.address,
            success: false,
        });
    });

    it('should allow operator update', async () => {
        const newOperator = await blockchain.treasury('newOperator');

        const result = await vault.send(
            owner.getSender(),
            { value: toNano('0.05') },
            { $$type: 'UpdateOperator', newOperator: newOperator.address }
        );

        expect(result.transactions).toHaveTransaction({
            from: owner.address,
            to: vault.address,
            success: true,
        });

        const operator = await vault.getOperator();
        expect(operator.equals(newOperator.address)).toBe(true);
    });
});
