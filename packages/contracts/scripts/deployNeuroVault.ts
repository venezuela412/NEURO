import { Address, toNano } from '@ton/core';
import { NeuroVault } from '../build/NeuroVault/NeuroVault_NeuroVault';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const sender = provider.sender();
    
    if (!sender.address) {
        throw new Error("Sender address is missing! Make sure you are connected to a wallet.");
    }

    // Deploying the NeuroVault with the sender as the Control-Plane Owner
    const ownerAddress = sender.address;
    
    console.log("Preparing to deploy NeuroVault...");
    console.log("Setting Owner Address to:", ownerAddress.toString());

    const neuroVault = provider.open(await NeuroVault.fromInit(ownerAddress));

    await neuroVault.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(neuroVault.address);

    console.log("NeuroVault has been successfully deployed to:", neuroVault.address.toString());
    console.log("Make sure to save this address and update it in your backend environment variables!");
}
