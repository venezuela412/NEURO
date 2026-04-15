# NEURO deployment guide

## Deployment strategy

NEURO currently has two deployable surfaces:

1. **Mini App frontend**
   - static Vite build served by Nginx
   - deployable to any static/CDN platform or container runtime

2. **Control plane**
   - Node.js Fastify service
   - deployable as a small container or server process

For testing and initial launch, the simplest topology is:

- one static frontend deployment
- one control-plane API deployment

## Recommended environments

### Local development
- Mini App: `http://localhost:5173`
- Control plane: `http://localhost:8787`

### Staging
- Mini App: `https://staging.neuro-ton.app`
- Control plane: `https://api-staging.neuro-ton.app`

### Production
- Mini App: `https://neuro-ton.app`
- Control plane: `https://api.neuro-ton.app`

## Environment variables

### Mini App build-time env

- `VITE_APP_URL`
  - public URL where the frontend is hosted
  - used to generate TonConnect manifest fields

- `VITE_CONTROL_PLANE_URL`
  - public URL of the control-plane API

- `VITE_TELEGRAM_BOT_USERNAME`
  - Telegram bot username used for Mini App launch context

- `VITE_TON_NETWORK`
  - `mainnet` or `testnet`

### Control plane runtime env

- `PORT`
  - API port, default `8787`

## TonConnect manifest generation

The frontend build now generates `apps/miniapp/public/tonconnect-manifest.json`
from environment variables before `vite build`.

This means deploys should always set:

- `VITE_APP_URL`

without relying on a hardcoded domain inside the repo.

## Local testing options

### Option A — native dev servers

Start the control plane:

```bash
pnpm dev:control-plane
```

In another terminal start the Mini App:

```bash
pnpm dev
```

Then test:

- frontend at `http://localhost:5173`
- control plane at `http://localhost:8787`
- health route at `http://localhost:8787/health`

### Option B — Docker Compose

Run:

```bash
docker compose up --build
```

Then test:

- frontend at `http://localhost:8080`
- control plane at `http://localhost:8787`

This is the closest current approximation to a deployable stack.

### Cloud environment note

In the current cloud VM used during development:

- Docker engine was successfully installed
- `sudo docker` works
- the Docker daemon is reachable
- both `apps/control-plane/Dockerfile` and `apps/miniapp/Dockerfile` were successfully built against an alternate `vfs` Docker daemon
- the control-plane container was smoke-tested successfully via `/health`
- Compose v2 is not installed
- the legacy `docker-compose` package is unreliable in this environment

So for this cloud environment specifically, Docker itself is verified, but Compose-based testing should be treated as environment-dependent.

## Container images

### Mini App image
- Dockerfile: `apps/miniapp/Dockerfile`
- output: static build served by Nginx

### Control plane image
- Dockerfile: `apps/control-plane/Dockerfile`
- output: Node.js runtime serving Fastify API

## End-of-development deployment path

When NEURO reaches the end of the core development phase, the recommended rollout will be:

1. **Deploy control plane first**
   - confirm `/health`, `/overview`, and `/plan/preview` work
   - verify CORS allows frontend origin

2. **Deploy Mini App with production env**
   - set `VITE_APP_URL`
   - set `VITE_CONTROL_PLANE_URL`
   - generate correct TonConnect manifest

3. **Configure Telegram Mini App entry**
   - point Telegram bot/menu button to the deployed frontend URL

4. **Test TonConnect end to end**
   - wallet connect
   - plan preview
   - wallet approval
   - active plan flow

5. **Then add live protocol adapters**
   - Tonstakers safe plan
   - STON.fi quote/execution support

## Minimum pre-launch test checklist

Before public testing:

- [ ] `pnpm build` passes
- [ ] `pnpm build:control-plane` passes
- [ ] `pnpm lint` passes
- [ ] frontend can reach deployed control plane
- [ ] generated TonConnect manifest uses the correct public URL
- [ ] wallet connect works from the deployed domain
- [ ] plan preview route returns expected payloads
- [ ] wallet approval flow works on the chosen network
- [ ] Safe Income Tonstakers context loads when connector and API conditions allow
- [ ] fallback copy remains clear when API is unavailable

## What is still needed before real user rollout

The current deployment path is real for the app shell and preview API, but a full public rollout still needs:

- persistent storage
- live protocol adapters
- transaction reconciliation
- production logging/monitoring
- better origin restrictions for CORS
- real terms/privacy pages referenced by the manifest

## Recommended hosting choices

### Mini App
Good options:
- Vercel
- Cloudflare Pages
- Netlify
- container platform with Nginx

### Control plane
Good options:
- Fly.io
- Railway
- Render
- a container host on a VPS

## Recommended first public test setup

For the first public test, use:

- Mini App on a static hosting platform with HTTPS
- Control plane on a small container host
- production-like env vars
- a Telegram bot pointing to the staging or production frontend URL

That gives the cleanest path for testing the actual Telegram-native experience.
