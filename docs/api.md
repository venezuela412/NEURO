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

### `POST /plan/preview`
Receives current balances and user intents. Returns projected estimations and required payloads to send to `TonConnect`.
**Payload Required:** Token balances map and target `planId`.

### `POST /portfolio/:walletAddress/switch-to-safety`
Initiates a plan migration to the "Safe Income" (Tonstakers fallback) option recording the state internally before prompting wallet signature.

### `POST /portfolio/:walletAddress/withdraw`
Signals standard withdrawal initiation.

### `POST /portfolio/:walletAddress/executions/:executionId/reconcile`
Crucial synchronization endpoint. Used asynchronously by the Mini App or recurring cron workers to test a specified `executionId` receipt against the TON public chain to declare it `completed` or `failed`.

## Internal Nonce Mechanism (Signed Mutation)
Any endpoint that alters state (`switch-to-safety`, `withdraw`) must verify a cryptographic signature produced by the wallet and consume the internal nonce to guarantee the request effectively maps to the actual Tonkeeper/Wallet owner preventing intercept spoofing.
