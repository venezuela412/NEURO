# NEURO

Put your TON to work. Simply.

NEURO is a Telegram-native TON Mini App designed for normal people who want passive income without learning DeFi. Instead of asking users to understand liquidity pools, vaults, routing, yield farming, or complex staking choices, NEURO translates TON-native opportunities into simple guided plans:

- Protect
- Earn
- Grow

The app hides protocol complexity behind calm, human-readable plan language while keeping safety, fee transparency, and explainability front and center.

## Who it is for

NEURO is built for:

- Telegram users holding idle TON
- people who want income without becoming DeFi experts
- users who value safety, clarity, and easy exits
- judges and partners looking for a consumer-first TON finance product rather than another dashboard

## Documentation map

The GitHub repository is intended to be the source of truth for current state, architecture, and submission materials.

- `README.md` - product overview, setup, architecture summary, and current implementation state
- `docs/repo-status.md` - implementation status, package versions, and validation status
- `docs/architecture.md` - architecture and module boundaries
- `docs/judge-qa.md` - hackathon judge answers
- `docs/demo-script.md` - 60-second and 90-second demo flow
- `docs/launch-copy.md` - launch and pitch copy
- `docs/deployment.md` - local, staging, production, and Docker deployment path
- `.env.example` - expected environment variables for local development

## Why NEURO is novel

NEURO is not:

- a DEX frontend
- a staking-only wrapper
- a generic yield dashboard
- a fake AI hedge fund

NEURO is a plan abstraction layer for TON passive income.

The novelty is the combination of:

1. **goal-first UX**
   - users choose Protect, Earn, or Grow
   - protocols stay behind the curtain

2. **deterministic plan logic**
   - a rule-based engine maps user intent, amount, gas reserve, and route quality into a recommendation
   - no LLM dependency in the decision engine

3. **Telegram-native product design**
   - compact, mobile-first, one-thumb-friendly
   - dark by default, calm and premium instead of noisy

4. **transparent fee model**
   - fee preview is visible before activation
   - fees only apply to profit
   - no fee on losses

5. **real TON integration path**
   - TonConnect provider wiring is already included
   - a real wallet signature step is now included for plan approval
   - a Tonstakers read-side adapter seam is now wired for Safe Income pool context
   - a first STON.fi quote seam is now wired for Balanced/Growth route-quality context
   - architecture is prepared for deeper Tonstakers and STON.fi execution adapters through thin integration seams

## What is implemented right now

This branch contains the foundation checkpoint for NEURO:

### Mini App
- Vite + React + TypeScript Telegram-style Mini App
- premium dark visual system
- route-level lazy loading for protocol-heavy screens
- routed product flow:
  - landing
  - wallet onboarding
  - plan selector
  - plan result
  - active plan
  - activity feed
- TonConnect provider wiring
- wallet-sign approval flow using `signData`
- Telegram WebApp bridge for ready/expand/theme binding when available
- persisted local app state for plans, receipts, and activity
- Safe Income result enhancement with Tonstakers pool context when available
- tonconnect manifest file

### Shared domain logic
- plan catalog for:
  - Safe Income
  - Balanced Income
  - Growth Income
  - Exit to Safety
- deterministic recommendation engine
- fee preview logic
- portfolio snapshot logic
- activity feed generation

### Control plane stub
- Fastify service with:
  - `/health`
  - `/overview`
  - `/portfolio/demo`
  - `/plan/preview`

This gives the frontend a realistic seam for future persistence, monitoring, and execution services.

### Adapter layer
- Tonstakers adapter seam for:
  - pool APY and rates
  - available-to-stake guidance
  - instant liquidity checks
  - future Safe Income execution
- STON.fi quote seam for:
  - route-quality signal gathering
  - Balanced/Growth recommendation context
  - future quote-to-execution expansion

For exact package versions and validation status, see `docs/repo-status.md`.

## What is real vs simulated in this checkpoint

### Real
- product architecture
- Telegram-native Mini App structure
- TonConnect integration layer
- wallet signature approval flow
- deterministic plan recommendation logic
- fee preview and accounting model
- portfolio/activity state model
- control-plane foundation
- Tonstakers Safe Income pool context seam
- STON.fi quote-signal seam for Balanced/Growth

### Simulated for now
- most protocol execution after approval
- live portfolio sync
- live rebalancing
- on-chain automation contract
- live STON.fi transaction construction

Important: this repo does **not** fake successful on-chain execution. It currently demonstrates the product and architecture foundation honestly, with live protocol execution reserved for later phases.

## Product model

### Plans

#### Safe Income
- low risk
- calmer income path
- safety-first bias

#### Balanced Income
- medium risk
- safer base plus stronger supported income path

#### Growth Income
- high risk
- stronger upside with tighter safety monitoring

#### Exit to Safety
- unwind toward a calmer mode

### Recommendation inputs
- TON amount
- goal
- flexibility preference
- risk preference
- wallet state
- gas reserve
- route quality
- safe path availability

### Recommendation outputs
- recommended plan
- explanation reasons
- estimated yearly range
- estimated monthly outcome range
- fallback behavior
- execution preview

## Monetization model

NEURO is designed to earn with the user, not against the user.

### User-facing fee model
- Safe Income: 0% performance fee in the current model
- Balanced Income: 10% of profit
- Growth Income: 15% of profit
- Exit to Safety: no new fee rate, only fee realization on already accrued profit if applicable

### Rules
- never charge on losses
- never charge on principal
- show fee estimate before activation
- keep the math visible

### Additional revenue path
The architecture is intentionally ready for partner/referral monetization from TON ecosystem integrations where supported:

- Tonstakers partner attribution
- STON.fi routing/referrer attribution

That lets NEURO keep the consumer experience low-friction while still building a real business.

## Why Telegram matters

Telegram is the right place for NEURO because:

- TON users already live there
- the product benefits from compact, mobile-first flows
- a passive income plan should feel quick and personal, not like a desktop trading terminal
- Telegram lowers the distance between discovery, onboarding, and action

## Why TON matters

TON is uniquely strong for this product because:

- it is naturally tied to Telegram distribution
- it has a growing ecosystem of yield and staking primitives
- consumer UX expectations on TON can still be shaped by better product design

NEURO exists to make TON income opportunities accessible to normal users, not just crypto-native users.

## Architecture summary

```text
apps/
  miniapp/        Telegram-native frontend
  control-plane/  portfolio and monitoring service foundation

packages/
  shared/         types and app-wide constants
  domain/         plans, recommendation logic, fee/accounting helpers
  adapters/       protocol/env abstraction layer
  contracts/      reserved for thin smart-contract automation later
```

### Frontend stack
- Vite
- React
- TypeScript
- Tailwind CSS v4 toolchain
- Zustand
- React Query
- React Router
- Framer Motion
- TON Connect UI React

### Backend/control-plane stack
- Node.js
- Fastify
- Fastify CORS
- TypeScript

## Setup

### Requirements
- Node.js 22+
- pnpm 10+

### Install

```bash
pnpm install
```

### Run the Mini App

```bash
pnpm dev
```

### Run the control plane

```bash
pnpm dev:control-plane
```

### Build

```bash
pnpm build
pnpm build:control-plane
```

### Docker test stack

```bash
docker compose up --build
```

This serves:

- Mini App at `http://localhost:8080`
- control plane at `http://localhost:8787`

In this cloud environment specifically, Docker is available with `sudo docker`. The repo's container images were validated here using an alternate `vfs` daemon path, including a working control-plane `/health` response. Compose v2 is not installed and the legacy `docker-compose` binary is unreliable, so the Compose stack should still be rechecked on a healthier host.

### Lint / typecheck

```bash
pnpm lint
```

## Environment

See `.env.example` for the next-phase environment variables we expect to support.

## Deployment and testing path

The repository now includes a concrete deployment path for the end of development:

- static/container deploy for the Mini App
- container/server deploy for the control plane
- environment-driven TonConnect manifest generation
- Dockerfiles for both services
- `docker-compose.yml` for local end-to-end testing

See `docs/deployment.md` for:

- local testing flow
- staging and production topology
- container usage
- pre-launch checklist
- recommended hosting options

## Limitations in this checkpoint

- no full live Tonstakers execution flow yet
- no live STON.fi execution flow yet
- no persistent database yet
- no transaction reconciliation after wallet signature yet
- no custom Tact automation contract yet
- no backend reconciliation or live transaction indexing yet

## Roadmap

### Next product/engineering steps
1. complete Tonstakers Safe Income execution write path
2. deepen the STON.fi quote seam into execution-ready routing
3. reconcile signed approval to live execution states
4. persist portfolio/activity state in the control plane
5. continue reducing protocol bundle weight and split heavy wallet/protocol code further
6. document API and execution-state contracts in more detail
7. add thin automation contract only if it creates real value without unsafe custody

## Why this can win a hackathon

NEURO can win because it is:

- useful: it solves the “idle TON + DeFi complexity” problem
- novel: it turns protocol mechanics into simple human goals
- technically credible: deterministic engine, clean architecture, wallet integration path, revenue model
- polished: the product is being built to feel like it belongs inside Telegram

The core promise is simple and strong:

> I finally understand what to do with my TON.

