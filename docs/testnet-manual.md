# NEURO Testnet Manual

Testing a non-custodial Web3 application correctly requires bridging to the blockchain's test network (Testnet) rather than Mainnet, so you can execute mock transactions without risking real funds.

## How to enable Testnet in NEURO

1. **Activate the Toggle:** On the top right of the application header, you will see a Flask (🔬) icon. Clicking it will toggle the `Testnet` mode globally for the interface.
2. **Visual Indicator:** The NEURO badge in the top-left will turn Amber (Orange) and proudly state **TESTNET**.

## What happens under the hood?

When Testnet is active:
- **TonConnect Signatures:** The application will request a signature configured for `--network testnet` (`-3`).
- **STON.fi:** The quote router connects to their sandbox websocket (`wss://omni-ws-sandbox.ston.fi`).
- **Tonstakers (Safe Income):** If the Tonstakers SDK does not explicitly resolve their separate testnet smart contract, the interface will gracefully downgrade the payload to a standard "wallet-approval" mock signing flow to let you experience the UI Reconciler without errors.

## Testing with your Wallet

To actually sign the transactions, your Tonkeeper (or similar wallet) must also be placed into **Dev Mode / Testnet Mode**.

### Tonkeeper Instructions
1. Go to **Settings** in Tonkeeper.
2. Quickly tap the Tonkeeper logo at the bottom 5 times to reveal the **Dev Menu**.
3. Select **Switch to Testnet**.
4. Re-connect your wallet to the NEURO miniapp.

### Getting Testnet TON
You can request free Testnet TON from the official Telegram faucet: [@testgiver_ton_bot](https://t.me/testgiver_ton_bot).
