# NEURO architecture notes

## Current implementation shape

This repository is a source-first pnpm workspace with:

- `apps/miniapp` - the Telegram-native React Mini App
- `apps/control-plane` - a minimal Fastify control-plane stub
- `packages/shared` - shared types and constants
- `packages/domain` - deterministic plan, fee, and portfolio logic
- `packages/adapters` - adapter seam for environment, execution state, and mock portfolio data
- `packages/contracts` - reserved for thin TON smart-contract work later

## Product layers

### 1. Presentation layer

The Mini App is built around a simple user story:

- learn what NEURO does
- choose `Protect`, `Earn`, or `Grow`
- get a clear recommendation
- review fee/risk/fallback
- activate and monitor an active plan

The UI avoids raw DeFi vocabulary in the main path.

### 2. Domain layer

The current deterministic engine lives in `packages/domain` and handles:

- plan definitions
- recommendation rules
- estimated range generation
- fee preview calculation
- activity feed generation
- portfolio snapshot creation

This layer is intentionally inspectable and LLM-free.

### 3. Adapter layer

The adapter package currently provides:

- overview values
- default preview input construction
- execution state copy
- preview response construction
- mock portfolio helpers
- Tonstakers read-side adapter helpers for Safe Income

This keeps future protocol integration isolated from UI code.

### 4. Control plane

The current Fastify service exposes:

- `GET /health`
- `GET /overview`
- `GET /portfolio/demo`
- `POST /plan/preview`

This is intentionally minimal for the first branch checkpoint, but it creates the seam for:

- persistent user portfolio state
- route monitoring
- safety checks
- partner attribution
- fee ledgers
- notifications

## Real vs placeholder today

### Real

- routed React Mini App
- deterministic plan engine
- fee preview logic
- portfolio snapshot logic
- activity feed logic
- TON Connect provider wiring
- wallet signature approval flow
- Telegram WebApp bridge for ready/expand/theme sync
- control-plane preview API
- Tonstakers pool data seam for Safe Income context

### Placeholder / next step

- live Tonstakers execution write path with reconciliation
- full STON.fi execution routing beyond quote signals
- persistent backend storage
- policy-bound automation contract
- withdraw / switch transaction flows

## Next recommended architecture steps

1. Persist plan snapshots and activity in a real database
2. Introduce adapter interfaces for Tonstakers and STON.fi
3. Add execution state reconciliation after wallet signature
4. Expand the preview API into transaction-preflight and position endpoints
5. Explore a thin policy-wallet contract only after the live execution path is stable

## Deployment shape

The repository now supports a practical end-of-development deployment path:

- static frontend build for the Mini App
- Fastify API deployment for the control plane
- Dockerfiles for both services
- Docker Compose for local end-to-end testing
- environment-driven TonConnect manifest generation

See `docs/deployment.md` for:

- local test workflow
- staging and production topology
- container usage
- pre-launch validation checklist
