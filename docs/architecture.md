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

- mock Telegram environment data
- execution state copy
- mock portfolio helpers
- overview values for the control plane

This keeps future protocol integration isolated from UI code.

### 4. Control plane

The current Fastify service exposes:

- `GET /health`
- `GET /overview`
- `GET /portfolio/demo`

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
- control-plane service stub

### Placeholder / next step

- live Tonstakers execution
- live STON.fi quote and route integration
- Telegram SDK bridge/theme mounting
- persistent backend storage
- policy-bound automation contract
- withdraw / switch transaction flows

## Next recommended architecture steps

1. Add a typed API client between `miniapp` and `control-plane`
2. Persist plan snapshots and activity in a real database
3. Introduce adapter interfaces for Tonstakers and STON.fi
4. Add execution state reconciliation after wallet signature
5. Implement a hidden technical drawer with route and fee details
6. Explore a thin policy-wallet contract only after the live execution path is stable
