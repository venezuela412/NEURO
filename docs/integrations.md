# NEURO Third-Party Integrations

NEURO leverages standard decentralized protocols on the TON blockchain to execute operations seamlessly on behalf of users in a completely non-custodial manner.

Currently, the default interface aggregates two primary providers depending on the selected Plan.

## 1. Tonstakers (Safe Income)

**Objective**: Provide baseline liquid staking yields (~3-5% APY depending on the network validation cycles) using `$tsTON`.

### Workflow
1. **Selection**: When the user selects `Protect` (Safe Income), the app chooses `Tonstakers` as the provider.
2. **Read-Side Adapter**: The app leverages `tonstakers-sdk` to read the current `tsTON` price and the Liquid Staking APY.
3. **Execution Payload**: The application calculates the stake payload and requests the user's connected wallet (via `TonConnect`) to sign the staking transaction targeting the Tonstakers smart contract.  
4. **Result**: The user deposits `TON` and receives `tsTON` directly in their wallet. NEURO records this execution locally inside the Control-Plane using public blockchain receipts.

### Dependencies
- `tonstakers-sdk`

---

## 2. STON.fi (Balanced / Growth Income)

**Objective**: Provide liquidity provision (LP) and asset swaps using TON's leading decentralized exchange, STON.fi.
Currently used for the `Earn` (Balanced) and `Grow` (Growth) goals.

### Workflow
1. **Selection**: Depending on the specific token pair for the plan (e.g., `TON/USDT` or altcoins), NEURO fetches a real-time signal.
2. **Quote Signal (Omniston)**: We use the `@ston-fi/omniston-sdk-react` Request for Quote (RFQ) endpoint. Using `buildSwapStonfiPayload` (inside our adapters), NEURO requests a quote from STON.fi's Router to get the best slippage and rate estimates.
3. **Execution Payload**: After receiving the quote, the `messages` array returned by STON.fi is parsed and forwarded to the user's `TonConnect` provider. 
4. **Slippage**: Slippage is dynamically encoded alongside the message so the user ensures fair exchange. 

### Dependencies
- `@ston-fi/omniston-sdk-react`

---

## Non-Custodial Nature
In both integration paths, NEURO *never* directly handles or custodies funds. The application prepares the standard Binary Object Container (BOC) and passes it directly to the wallet for signing.
