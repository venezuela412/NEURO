<p align="center">
  <img src="https://neuroton-lime.vercel.app/assets/logo.png" width="120" alt="NEURO Logo" style="border-radius: 25px; box-shadow: 0 0 30px rgba(143,115,255,0.4);">
</p>

<h1 align="center">NeuroTON Protocol</h1>

<p align="center">
  <strong>Autonomous AI-Driven Omnichain Yield Execution</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Network-TON%20%7C%20Omnichain-blue?style=flat-square&logo=telegram" alt="Network">
  <img src="https://img.shields.io/badge/Status-Beta%20V2-orange?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/Routing-Wormhole-black?style=flat-square" alt="Wormhole">
  <img src="https://img.shields.io/badge/AI_Engine-Neuro_Agents-purple?style=flat-square" alt="AI Engine">
</p>

---

## 🧭 Overview

**NeuroTON** is a production-grade autonomous yield aggregator and smart-routing DEX execution layer on the TON blockchain. It sources, aggregates, and leverages cross-chain interoperability via **Wormhole** to dynamically route capital across LPs, Liquid Restaking Tokens (LRTs), and high-frequency arbitrage opportunities, continuously guaranteeing the maximum APY for deposited assets.

[**Live Application →**](https://neuroton-lime.vercel.app)

---

## 🏛️ System Architecture

NeuroTON uses a micro-service, deeply integrated infrastructure combining a Telegram MiniApp frontend, an ultra-fast control plane, and a robust smart contract vault architecture.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          NeuroTON Telegram MiniApp                     │
│                                                                        │
│ ┌──────────────┐     ┌───────────────┐     ┌──────────────────────┐    │
│ │ / Dashboard  │     │ / Points Hub  │     │ / Analytics & Health │    │
│ └──────┬───────┘     └───────┬───────┘     └──────────┬───────────┘    │
│        │                     │                        │                │
│ ┌──────▼─────────────────────▼────────────────────────▼──────────────┐ │
│ │                  Fastify Control Plane (Node.js)                   │ │
│ │      Anti-Sybil Ledger + Referral Attribution + Strategy AI        │ │
│ └────────────────────────────┬───────────────────────────────────────┘ │
│                              │                                         │
│ ┌────────────────────────────▼───────────────────────────────────────┐ │
│ │                      TonConnectUI Provider                         │ │
│ └────────────────────────────┬───────────────────────────────────────┘ │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │
               ┌───────────────▼───────────────┐
               │    NeuroTON Smart Vault L1    │
               └───────────────┬───────────────┘
                               │
         ┌─────────────────────┼──────────────────────┐
         ▼                     ▼                      ▼
  ┌─────────────┐       ┌─────────────┐        ┌──────────────┐
  │ Tonstakers  │       │   STON.fi   │        │   Wormhole   │
  │   (Safe)    │       │   (Earn)    │        │ Omnichain AI │
  └─────────────┘       └─────────────┘        └──────────────┘
```

## 🧠 Dynamic Omnichain Intelligence (>100% APY Target)

Unlike static yield farms, the **Aggressive / Grow** strategy employs our autonomous AI system. The solver bots autonomously:
1. Rotate across highly liquid pools detecting inefficiencies.
2. Bridge capital using **Wormhole** to intercept multi-chain Liquid Restaking (LRT) bursts.
3. Automatically execute high-frequency localized arbitrage.

To achieve continuous compound growth rates dynamically targeting **124.5%+ APY**, yields are algorithmically swept and dropped **DAILY** to the user's dashboard representation.

## 🏆 Points, Referrals, & Anti-Gaming Economy

Our internal system operates a robust off-chain referral tree backed by Supabase with intensive anti-gaming safeguards ready for Token Generation Events (Airdrops):

- **Activation Thresholds:** Referred users must execute a minimum of `5 TON` deposit to trigger the core referral activation points.
- **Anti-Replay Ledger:** We index all executed `txHash`es into our strict `seen_swap_tx_ids` meta cache in the Point Events ledger. Replay attacks are mathematically blocked at the database row-level.
- **Bonus Scaling:** New onboarded wallets receive immediate signup bonuses, driving viral loop retention.

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript, Vite, TailwindCSS (Dark OLED Design)
- **Backend:** Node.js, Fastify API, `node-cron`
- **Database:** Supabase (PostgreSQL)
- **Web3 Integrations:** `@tonconnect/ui-react`, Ton API, Wormhole Interoperability layer.
- **Deployment:** Vercel (Frontend), Railway / Render (Backend)

## 📦 Project Structure

```
NEURO/
├── apps/
│   ├── miniapp/                # Telegram MiniApp Frontend
│   │   ├── src/
│   │   │   ├── components/     # UI Elements
│   │   │   ├── lib/            # Smart Contract APIs & vaultTx
│   │   │   └── screens/        # Views (ActivePlan, Admin)
│   │   └── package.json
│   ├── control-plane/          # Backend Aggregator & AI Coordinator
│   │   ├── src/
│   │   │   ├── index.ts        # Fastify API Routes
│   │   │   ├── repository.ts   # DB Models & Anti-Sybil Logic
│   │   │   ├── db.ts           # PostgreSQL setup
│   │   │   └── core/           # Routing engines (Wormhole Stubs)
│   │   └── package.json
├── package.json                # Monorepo Workspace Root
└── README.md
```

## 🔒 Security Posture

1. **Self-Custody First:** All vault operations rely upon purely non-custodial smart contracts.
2. **Rate Limiting:** IP-level and Wallet-level controls protect against API spanning on the Fastify endpoints.
3. **Environment Segregation:** High-security admin vaults require strict cryptographic `CRON_SECRET` parameters to accept internal solver triggers.

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js and `npm` installed. You also need a PostgreSQL database.

```bash
# Install Monorepo dependencies
npm install

# Start local miniapp UI
npm run dev --workspace=@neuro/miniapp

# Start backend control plane
npm run dev --workspace=@neuro/control-plane
```

_Note for Local Testing:_ The Vite frontend automatically defaults to a public TonConnect demonstration manifest (`tonconnect-manifest.json`) if run on `localhost` to ensure your mobile Tonkeeper can resolve and connect without CORS/DNS issues.

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.
