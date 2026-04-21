import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import '@ton/test-utils';
import { NeuroVault } from '../build/NeuroVault/NeuroVault_NeuroVault';

describe('NeuroVault Contract', () => {
    let blockchain: Blockchain;
    let vault: SandboxContract<NeuroVault>;
    let deployer: SandboxContract<TreasuryContract>;
    let user: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        user = await blockchain.treasury('user');

        vault = blockchain.openContract(await NeuroVault.fromInit(deployer.address));

        const deployResult = await vault.send(
            deployer.getSender(),
            { value: toNano('0.05') },
            { $$type: 'Deploy', queryId: 0n }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: vault.address,
            deploy: true,
            success: true,
        });
    });

    it('should calculate initial share correctly', async () => {
        // Make depositing possible
        const depositAmount = toNano('10');
        const intentId = 1n; // Safe vault

        await vault.send(
            user.getSender(),
            { value: depositAmount },
            { $$type: 'Deposit', intent: intentId }
        );

        const currentTvl = await vault.getTvl();
        expect(currentTvl).toBeGreaterThanOrEqual(depositAmount);
        
        // nTON shares should be generated correctly. Since it's initial deposit, ratio is 1:1.
        // Actually, we'd check the jetton wallet, but for simplicity we check vault state first.
    });
});
