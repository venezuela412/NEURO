# NEURO Execution States and Reconciliations

NEURO operates primarily in a stateless client-side context that communicates asynchronously with the blockchain via a Control Plane architecture and the central `NeuroVault`. 

## Lifecycle Overview

An execution goes through several stages from user-intent to final blockchain block inclusion.

### 1. Preparing (`preparing`)
The app receives user intent (e.g., *Generate my plan*). The logic profiles optimal yields (via `Omniston` or `Tonstakers`) and generates a smart contract Payload.

### 2. NeuroVault Deposit (`vault_deposit`)
The user signs a transaction via `TonConnect` sending their raw TON directly to the `NeuroVault` immutable contract. The contract guarantees that TVL tracking updates by minting "shares" to the user relative to the Vault's global size.

### 3. Execution Delegation (`exec_delegation`)
To trigger asynchronous Liquid Provisioning (LP) safely (which involves multi-step wrappers, swaps, and liquidity provisions), the Control Plane signs an `ExecDelegate` transaction matching the `StonfiSwap` TEP-74 structure and dispatches it to the Vault. The Vault fires the payload out to the DeFi protocols.

### 4. Yield Reconciliation (`reconciling` and `completed`)
Since TON is highly asynchronous, an immediate receipt doesn't mean LP successfully settled on DEXs.
The Control Plane uses background processes to poll the TonAPI trace:
- **Success (Harvested):** The DEX successfully swaps and deposits. LP Jettons return to the `NeuroVault` via `TokenNotification`. Internal state switches to `completed`.
- **Bounce (Failure Fallback):** If slippage is violated or DEX gas is insufficient, external protocols emit a `bounced` message. The `NeuroVault` contains safety handlers for `bounced` messages which automatically recalculate funds back to base TON, protecting TVL. 
- **Refresh Sync:** Standard behavior allows the user to click *Refresh Balance* manually to force reconciliation across the Vault's asset pool.

## Control Plane Isolation
All complex 5-hop executions happen between the Vault and the External protocols (Ston.fi/Tonstakers). The UI never directly locks up during these async phases; it gracefully polls the Vault state instead.
