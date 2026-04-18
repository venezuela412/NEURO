# NEURO Fee Accounting

A core value proposition of NEURO is its transparent, realized-only fee model (`no-fee-on-losses`).

## The On-Chain Model (Tact Smart Vault)

As of Option B's Hackathon Final phase, the Fee logic has been fully moved inside the **NeuroVault** Tact smart contract. By calculating fees precisely natively on the TVM, users have an absolute cryptographic guarantee that they will only ever pay fees if the Vault generated net-positive yields.

### High-Water Mark Logic (On-Chain)
- **Definition:** The fee is strictly tied to actual *realized* gains above the underlying capital ratio (shares). 
1. `performanceFeePrecise`: Stored in contract state as `2000` (representing 20.00%).
2. `totalDeposit` and `shares`: The contract mathematically measures the true pool TVL against circulating shares.
3. **Withdrawal Trigger:** When a user burns shares to request a withdrawal, the Vault calculates whether the value of their shares has increased.
    - If `Profit > 0` -> The Vault deducts the 20% fee fraction from the *Profit Only*, sending the 80% remainder + the Principle back to the user.
    - The 20% fee is assigned internally as "Fee Shares" owned by the Treasury.

## Backend Interaction
The `Control-Plane` (Fastify service) no longer uses aggressive polling to charge users. It simply reads the on-chain variables to display the projected net returns on the MiniApp, providing "What you see is what you get" guarantees.

### Partner Attribution
Fees are assigned to the Treasury address. However, by querying TVM Event Logs, the Control Plane can trace specific deposits tied to `start_param` deep-links to calculate referral partner rebates off-chain safely.
