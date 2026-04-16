# NEURO repo status

Last updated in branch: `cursor/neuro-foundation-c2c4`

## Current milestone

This repository currently contains the **foundation checkpoint** for NEURO:

- pnpm monorepo scaffold
- Telegram-native React Mini App foundation
- deterministic plan engine
- fee preview and portfolio snapshot logic
- Fastify control-plane preview API
- real wallet signature approval flow
- Telegram WebApp bridge layer
- Tonstakers Safe Income read-side adapter seam
- STON.fi quote signal seam for Balanced/Growth
- DB-backed control-plane persistence
- persisted switch/withdraw actions
- execution reconciliation endpoint
- signed mutation verification and replay protection
- deployment and Docker testing artifacts
- hackathon/judge documentation set

This is the current source of truth for what has been built so far.

## Repo version map

### Workspace
- root package name: `neuro`
- root version: `0.1.0`
- package manager: `pnpm@10.33.0`
- recommended Node.js: `22+`

### Apps
- `@neuro/miniapp`: `0.1.0`
- `@neuro/control-plane`: `0.1.0`

### Packages
- `@neuro/shared`: `0.1.0`
- `@neuro/domain`: `0.1.0`
- `@neuro/adapters`: `0.1.0`
- `@neuro/contracts`: `0.1.0`

## Dependency versions in use

### Mini App runtime
- `react`: `^19.2.4`
- `react-dom`: `^19.2.4`
- `react-router-dom`: `^7.9.5`
- `zustand`: `^5.0.8`
- `@ston-fi/omniston-sdk-react`: `^0.7.12`
- `@tanstack/react-query`: `^5.90.2`
- `framer-motion`: `^12.23.24`
- `lucide-react`: `^0.554.0`
- `clsx`: `^2.1.1`
- `@tonconnect/ui-react`: `^2.4.2`
- `@telegram-apps/sdk-react`: `^3.3.9`
- `tonstakers-sdk`: `0.0.19-development`
- `@ton/core`: `^0.63.1`

### Mini App dev tooling
- `vite`: `^8.0.4`
- `@vitejs/plugin-react`: `^6.0.1`
- `tailwindcss`: `^4.1.14`
- `@tailwindcss/vite`: `^4.1.14`
- `typescript`: `^6.0.2`
- `typescript-eslint`: `^8.58.0`
- `eslint`: `^9.39.4`
- `vite-tsconfig-paths`: `^5.1.4`

### Control plane
- `@fastify/cors`: `^11.2.0`
- `fastify`: `^5.6.1`
- `pg`: `^8.16.3`
- `tsx`: `^4.20.6`
- `typescript`: `^6.0.2`

## Current app structure

### `apps/miniapp`
Contains:
- app providers
- routing
- lazy-loaded route modules
- wallet-aware app shell
- Telegram WebApp bridge
- landing screen
- wallet onboarding screen
- plan selector screen
- plan result screen
- active plan screen
- activity screen
- execution status card
- technical details drawer
- Omniston provider bridge
- STON.fi quote signal hook
- persisted Zustand store
- dark premium styling system

### `apps/control-plane`
Contains:
- Fastify server
- `/health`
- `/overview`
- `/portfolio/demo`
- `/plan/preview`
- `/portfolio/:walletAddress/state`
- `/portfolio/:walletAddress/executions`
- `/portfolio/:walletAddress/switch-to-safety`
- `/portfolio/:walletAddress/withdraw`
- `/portfolio/:walletAddress/executions/:executionId/reconcile`
- signed mutation verification for write endpoints
- consumed nonce tracking for replay protection

### Deployment artifacts
Contains:
- `apps/miniapp/Dockerfile`
- `apps/control-plane/Dockerfile`
- `apps/miniapp/nginx.conf`
- `docker-compose.yml`
- `scripts/generate-tonconnect-manifest.mjs`
- `docs/deployment.md`

### `packages/shared`
Contains:
- shared types
- plan ids
- goal enums
- execution status types
- fee/portfolio interfaces
- app constants

### `packages/domain`
Contains:
- plan catalog
- deterministic recommendation logic
- fee calculation logic
- portfolio snapshot builder
- activity feed builder

### `packages/adapters`
Contains:
- overview helper
- default plan preview input builder
- execution-state copy helpers
- plan preview response builder
- mock portfolio helper
- Tonstakers adapter helpers

### `packages/contracts`
Currently reserved for future thin TON contract work.

## What is implemented now

### UX
- simple goal-first flow
- async plan preview through the control plane
- plan recommendation in plain English
- transparent fee preview
- activity feed
- wallet-required activation gating
- real wallet signature capture for plan approval
- technical details drawer
- Safe Income Tonstakers pool context when available
- Balanced/Growth STON.fi route-quality context when available
- Telegram-style dark presentation

### Domain logic
- Safe Income
- Balanced Income
- Growth Income
- Exit to Safety
- route-quality-aware recommendation shaping
- gas reserve awareness
- safety fallback messaging
- no-fee-on-losses model

### Infra
- monorepo workspace
- source-first internal packages
- Mini App build and lint pipeline
- control-plane TypeScript build
- control-plane preview endpoint with CORS enabled
- control-plane persistence with external Postgres support via `DATABASE_URL`
- embedded file-backed PGlite fallback for local/dev when `DATABASE_URL` is absent
- signed mutation verification on write endpoints
- replay protection via consumed nonces
- Docker-based local test stack
- build-time TonConnect manifest generation
- Docker engine verified in cloud environment via `sudo docker`
- both Docker images built successfully in cloud using alternate `vfs` daemon
- control-plane container `/health` smoke test passed in cloud Docker path
- control-plane persisted portfolio roundtrip verified via API
- control-plane execution reconcile route verified via API

## What is not implemented yet

- live Tonstakers adapter
- live STON.fi quote/execution adapter
- broad transaction reconciliation beyond current Tonstakers-style submitted receipts
- thin automation contract
- code splitting for the large frontend bundle

## Validation status

The current branch has been validated with:

```bash
pnpm build
pnpm build:control-plane
pnpm lint
```

## Known technical notes

### Source-first workspace
Internal packages are currently consumed directly from source in the workspace during development. This keeps implementation fast while the architecture is still evolving.

### Bundle size
The Mini App currently builds successfully, but Vite still warns that one chunk remains large. Route-level lazy loading is now in place and improved the build shape materially, but Tonstakers and STON.fi still add significant protocol weight, so further bundle splitting remains valuable.

### Cloud Docker runtime nuance
In this cloud environment:

- `sudo docker` works
- Docker daemon is reachable
- Compose v2 plugin is not installed
- legacy `docker-compose` is unreliable here

So the repo's Docker artifacts are valid, but end-to-end Compose execution should be verified on a host with a healthier Compose setup.

### Persistence mode
Current control-plane persistence behavior:

- **preferred production mode**: external Postgres via `DATABASE_URL`
- **local/dev fallback**: file-backed PGlite when `DATABASE_URL` is not set

This means the codebase now supports a more production-like persistence topology while retaining a zero-setup local fallback.

### Documentation set currently present
- `README.md`
- `docs/architecture.md`
- `docs/repo-status.md`
- `docs/judge-qa.md`
- `docs/demo-script.md`
- `docs/launch-copy.md`
- `docs/deployment.md`
- `.env.example`

## Recommended next documentation additions

As the next technical phase lands, the repo should gain:

1. `docs/integrations.md`
   - Tonstakers flow
   - STON.fi flow
   - TonConnect details

2. `docs/execution-states.md`
   - lifecycle from preparing to wallet approval and live execution

3. `docs/fee-accounting.md`
   - high-water mark model
   - realization events
   - partner attribution notes

4. `docs/api.md`
   - control-plane routes
   - request/response contracts
