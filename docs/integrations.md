# NEURO Third-Party Integrations

NEURO leverages standard decentralized protocols on the TON blockchain but orchestrates them safely through the **NeuroVault** Tact smart contract. This provides "Set-and-Forget" yield farming through automated compound routing.

## 1. STON.fi (Liquidity Provisioning - Option B)
**Objective**: Advanced Liquidity Provisioning (LP) using STON.fi V2 for our `Earn` and `Grow` Vaults.

### Architecture Workflow (The 5-Hop Asynchronous Lifecycle)
STON.fi operations natively require consecutive contract bounces. To prevent user funds from getting stuck, NEURO uses a Proxy Pattern:
1. **Deposit**: User deposits TON into the `NeuroVault`.
2. **Signal Sync (Control Plane)**: The off-chain API monitors pool capacities and queries live route quality (Omniston).
3. **Execution Delegate (`ExecDelegate`)**: The Control Plane packages a precise `StonfiSwap` and `ProvideLiquidity` payload mapping TEP-74 Jetton standards and sends it to the Vault.
4. **Proxy Route**: The Vault performs the `Wrap (pTON) -> Swap (Token B) -> LP Stake` directly on STON.fi routers.
5. **Yield Harvest**: LP Jettons return to the Vault via `TokenNotification`. Safe generic "bounced" handlers ensure no funds lock if STON.fi liquidity drops mid-transaction.

## 2. Tonstakers (Safe Income)
**Objective**: Baseline liquid staking yields (~3-5% APY) using `tsTON` for the `Protect` goal.

### Architecture Workflow
1. **Delegation**: Instead of the user signing directly on Tonstakers, the `NeuroVault` routes pooled TON directly to Tonstakers minters based on backend oracle triggers.
2. **Minting**: `tsTON` is minted to the `NeuroVault` address.
3. **Internal Accounting**: Users hold generic NEURO vault shares representing their weighted fraction of the underlying `tsTON` balance.

## Non-Custodial Verification
The Vault is completely immutable and math-based:
- Only the user can deposit or withdraw their underlying shares.
- The Owner API (Control Plane) can *only* invoke predefined DeFi yields via `ExecDelegate`. It cannot sweep funds to private addresses (enforced by `requireOwner` and hardcoded destination guards).
- This guarantees algorithmic, non-custodial delegation: **Users get the complexity of an automated Hedge Fund, but retain cryptographic finality over their capital.**
