# NEURO Execution States and Reconciliations

NEURO operates primarily in a stateless client-side context that communicates asynchronously with the blockchain. To maintain UX clarity and ensure the Control Plane understands the `Portfolio` status, execution lifecycles are modeled carefully.

## Lifecycle Overview

An execution goes through several stages from user-intent to final blockchain block inclusion.

### 1. Preparing (`preparing`)
The app has received user intent (e.g., clicking *Generate my plan*). The domain logic estimates fees and queries external nodes (e.g., STON.fi API) to build the requisite payload. No blockchain action has occurred yet.

### 2. Awaiting Signature (`awaiting_signature`)
The payload (`BOC`) is forwarded to the `TonConnect` interface. The app pauses and waits for the user to open their external native wallet (like *Tonkeeper*, *MyTonWallet*) and confirm the transaction. Emits an internal state signaling the UI to show a "Confirm in Wallet" spinner.

### 3. Submitting (`submitting`)
The external wallet has returned a signed receipt to the Mini App indicating that the transaction is being broadcasted to the mempool.
At this stage, the Control Plane issues a `POST` creating the `Execution` log internally with the given execution trace block.

### 4. Reconciling (`reconciling` and `completed`)
Since TON is heavily asynchronous, an immediate receipt from TonConnect does not guarantee the decentralized swap or stake actually finished flawlessly (it might be bouncing or out-of-gas).
The Control Plane uses background processes (or triggered endpoints like `POST /portfolio/:walletAddress/executions/:executionId/reconcile`) to verify the status logic over the public TON nodes (via APIs like `TonAPI`).

- If the trace confirms the success, the state changes to `completed` and the internal Portfolio `snapshot` updates accurately.
- Standard behavior allows the user to click *Refresh Balance* manually to trigger the reconciliation check on-demand avoiding extreme polling overhead.

## Fallback Modes

If an operation times out on STON.fi or fails `reconciling` multiple times due to market liquidity dropping, NEURO allows a fallback state to revert to `Safe Income` keeping transaction loops constrained inside the unified Control-Plane UI mapping.
