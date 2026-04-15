# NEURO repo status

Last updated in branch: `cursor/neuro-foundation-c2c4`

## Current milestone

This repository currently contains the **foundation checkpoint** for NEURO:

- pnpm monorepo scaffold
- Telegram-native React Mini App foundation
- deterministic plan engine
- fee preview and portfolio snapshot logic
- Fastify control-plane stub
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
- `@tanstack/react-query`: `^5.90.2`
- `framer-motion`: `^12.23.24`
- `lucide-react`: `^0.554.0`
- `clsx`: `^2.1.1`
- `@tonconnect/ui-react`: `^2.4.2`
- `@telegram-apps/sdk-react`: `^3.3.9`

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
- `fastify`: `^5.6.1`
- `tsx`: `^4.20.6`
- `typescript`: `^6.0.2`

## Current app structure

### `apps/miniapp`
Contains:
- app providers
- routing
- wallet-aware app shell
- landing screen
- wallet onboarding screen
- plan selector screen
- plan result screen
- active plan screen
- activity screen
- dark premium styling system

### `apps/control-plane`
Contains:
- Fastify server
- `/health`
- `/overview`
- `/portfolio/demo`

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
- mock Telegram environment adapter
- execution-state copy helpers
- overview helper
- mock portfolio helper

### `packages/contracts`
Currently reserved for future thin TON contract work.

## What is implemented now

### UX
- simple goal-first flow
- plan recommendation in plain English
- transparent fee preview
- activity feed
- wallet-required activation gating
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

## What is not implemented yet

- live Tonstakers adapter
- live STON.fi quote/execution adapter
- real Telegram SDK bridge mounting
- persistent database
- transaction reconciliation after wallet signature
- real withdrawal / switch flows
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
The Mini App currently builds successfully, but Vite warns that the main chunk is large. This should be addressed in a later pass with code splitting.

### Documentation set currently present
- `README.md`
- `docs/architecture.md`
- `docs/repo-status.md`
- `docs/judge-qa.md`
- `docs/demo-script.md`
- `docs/launch-copy.md`
- `.env.example`

## Recommended next documentation additions

As the next technical phase lands, the repo should gain:

1. `docs/integrations.md`
   - Tonstakers flow
   - STON.fi flow
   - TonConnect details

2. `docs/execution-states.md`
   - lifecycle from preparing to success/failure

3. `docs/fee-accounting.md`
   - high-water mark model
   - realization events
   - partner attribution notes

4. `docs/api.md`
   - control-plane routes
   - request/response contracts
