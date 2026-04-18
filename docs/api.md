# NEURO Control-Plane API

The `control-plane` is structured via `Fastify` handling CORS requests from the Telegram Mini App.

## Global Headers
- `Authorization`: Used essentially for `NEURO_ADMIN_TOKEN` when interacting with restricted endpoints over the network.
- `X-Execution-Nonce`: Used in state-mutating requests (`POST`, `PUT`) ensuring replay-protection across executed payloads.

---

## 1. Public & Read Endpoints

### `GET /health`
Validates that the Fastify server and internal mechanisms (like Postgres connection) are successfully booted and reachable.
**Returns:** `200 OK`
```json
{ "status": "ok" }
```

### `GET /overview`
Returns high-level statistics like Total Value Locked (TVL) metrics and system availability to render in the landing or dashboard states.

### `GET /portfolio/demo`
Provides a complete mock-portfolio projection populated with mock activity fields to let clients experience the UI without connecting a live wallet.

### `GET /portfolio/:walletAddress/state`
Queries the database for existing portfolio structures mapped to the provided standard `walletAddress`.
**Returns:** `200 OK` with `Portfolio` shape.

### `GET /portfolio/:walletAddress/executions`
Fetches a list of all historical and pending executions.

---

## 2. Execution & Mutation Endpoints

### `POST /vault/preview`
Receives current balances and user intents. Returns projected estimations, simulated Vault fees, and the calculated internal routing path (STON.fi or Tonstakers).

### `POST /vault/:walletAddress/deposit`
Initiates the first step of the Vault lifecycle. Returns the payload for the user directly depositing TON into the `NeuroVault` to receive Shares.

### `POST /vault/:walletAddress/delegate`
(Admin/Control-Plane Only) Constructs the highly complex `ExecDelegate` Payload. The Control Plane uses this to instruct the Vault to wrap, swap, and LP on STON.fi. This endpoint executes off-chain routing logic via Omniston to find the optimal path.

### `POST /vault/:walletAddress/withdraw`
Signals standard withdrawal initiation. The payload instructs the user to send their shares back to the Vault, triggering the internal 20% Performance Fee deduction mathematically.

### `POST /vault/executions/:executionId/reconcile`
Crucial synchronization endpoint. Used asynchronously by recurring cron workers to test a specified `executionId` receipt against the TON public chain to declare it `completed` (Yield Harvested) or `failed` (Funds Bounced safely to Vault).

## Internal Nonce Mechanism (Signed Mutation)
Any endpoint that alters state (`deposit`, `withdraw`) must verify a cryptographic signature produced by the wallet and consume the internal nonce to guarantee the request effectively maps to the actual Tonkeeper/Wallet owner preventing intercept spoofing.
