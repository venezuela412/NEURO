<p align="center">
  <img src="https://neuroton-lime.vercel.app/assets/logo.png" width="180" alt="NEURO Logo" style="border-radius: 35px; box-shadow: 0 0 50px rgba(143,115,255,0.6);">
</p>

<h1 align="center">NeuroTON Protocol: Autonomous Omnichain Yield Engine</h1>

<p align="center">
  <em>Next-generation AI-driven liquidity routing and multi-chain yield optimization on the TON Blockchain.</em>
</p>

<p align="center">
  <a href="https://neuroton-lime.vercel.app"><img src="https://img.shields.io/badge/Live_App-neuroton.vercel.app-7132F5?style=for-the-badge&logo=vercel" alt="Live App"></a>
  <a href="https://ton.org"><img src="https://img.shields.io/badge/Network-TON-0098EA?style=for-the-badge&logo=telegram" alt="Network"></a>
  <a href="https://wormhole.com"><img src="https://img.shields.io/badge/Bridging-Wormhole-white?style=for-the-badge" alt="Wormhole"></a>
  <a href="https://t.me/neuroton_bot"><img src="https://img.shields.io/badge/Telegram-MiniApp-2CA5E0?style=for-the-badge&logo=telegram" alt="Telegram"></a>
</p>

---

## 🌌 The Omnichain Vision

**NeuroTON** is a production-grade autonomous yield aggregator and smart-routing DEX execution layer built natively for the **TON (The Open Network)** ecosystem. By leveraging **Wormhole** for cross-chain interoperability, our embedded Neuro AI Agents map and secure the highest possible APY across the entire Defi landscape (Liquid Restaking, LP provisioning, and Arbitrage).

Instead of forcing users to navigate complex bridges and gas fees, NeuroTON handles multi-chain execution entirely autonomously through a single, secure Smart Vault integration.

---

## 🚀 Key Features

| Feature | Description |
| ------- | ----------- |
| 🧠 **Autonomous AI Routing** | Solvers continuously scan TON DEXs (STON.fi, DeDust) and multi-chain pools (via Wormhole) to deploy capital dynamically where yields are highest, targeting **>100% Dynamic APY**. |
| 🛡️ **Self-Custodial Vaults** | Users deposit TON into a non-custodial Smart Vault and receive `nTON` (Neuro TON) LP shares. Total sovereignty. No private keys face the web. |
| 🌉 **Omnichain Staking** | Capital is not restricted to TON. High-risk tolerance capital bridges to Arbitrum, Base, or Optimism via Wormhole for maximum LRT burst yields. |
| 💎 **Robust Sybil Resistance** | Advanced off-chain control-plane indexing prevents point farming. Referrals require a minimum 5-TON vault deposit to activate. |
| 🤖 **Telegram MiniApp UX** | Seamless smartphone integration. Connect your Tonkeeper wallet and deploy cross-chain strategies with three taps. |

---

## 🏛️ Enterprise System Architecture

NeuroTON uses an event-driven microservice architecture, bridging Web2 off-chain performance with Web3 on-chain security.

```text
                                  ┌────────────────────────┐
                                  │   Telegram User Client │
                                  │   (Vite + React)       │
                                  └───────────┬────────────┘
                                              │ Uses TonConnect UI
┌─────────────────────────────────────────────▼─────────────────────────────────────────────┐
│                                                                                           │
│ ┌────────────────────────┐    ┌────────────────────────┐    ┌────────────────────────┐    │
│ │   Dashboard Engine     │    │   Point & Referrals    │    │   Strategy Analytics   │    │
│ └──────────┬─────────────┘    └──────────┬─────────────┘    └──────────┬─────────────┘    │
│            │                             │                             │                  │
├────────────┼─────────────────────────────┼─────────────────────────────┼──────────────────┤
│            │                             │                             │                  │
│            ▼                             ▼                             ▼                  │
│ ┌───────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                             Fastify Control Plane (Node.js)                           │ │
│ │   [ Auth Ledger ]    [ Anti-Sybil Meta Cache ]   [ OmniChain AI Solver Cron Job ]     │ │
│ └──────────────────────────────────────┬────────────────────────────────────────────────┘ │
│                                        │ Signed Txs                                       │
└────────────────────────────────────────┼──────────────────────────────────────────────────┘
                                         ▼
                     ┌──────────────────────────────────────┐
                     │          NeuroTON Smart Vault        │
                     │          (Compiled Tact ABI)         │
                     └──────┬────────────────────────┬──────┘
                            │                        │
               ┌────────────▼───────────┐    ┌───────▼────────────────┐
               │    TON Native Yield    │    │ Wormhole Cross-Chain   │
               │  (STON.fi, Tonstakers) │    │ Arbitrum/Base/Ethereum │
               └────────────────────────┘    └────────────────────────┘
```

### The Neuro AI Execution Pipeline
1. **Index:** Market Scanners (`market-scanner.ts`) poll DEX APIs and Wormhole aggregators every minute.
2. **Evaluate:** Safety contracts cross-reference token volatility and slippage.
3. **Execute:** The Control Plane calculates optimal auto-compounding intervals and triggers `execute` calls on the Vault via strict chron routines.

---

## 🔒 Security & Anti-Gaming

We take protocol health seriously. The hackathon iteration includes multiple safeguards:

- **Row-Level Replay Defenses:** Our internal ledger tracks individual `txHash` execution strings in a strict `meta` JSON column. Actions cannot be double-spent or rebroadcast.
- **Deposit-Gated Referrals:** To prevent Airdrop farming, the referrer only receives their activation bonus fully once the newly referred user eclipses the **5 TON Active Minimum** threshold on on-chain queries.
- **TonConnect Nonce Safety:** All authenticated endpoints utilize `proof` based on TonConnect nonces signed by the wallet origin. 

---

## 🛠️ Tech Stack & Dependencies

- **Frontend Core:** React, TypeScript, Vite
- **UI & Styling:** Tailwind CSS (Custom Dark OLED System), Lucide React
- **Web3 Ecosystem:** `@tonconnect/ui-react`, `@ton/core`, TonAPI
- **Backend Infrastructure:** Fastify, Node.js, `node-cron`
- **Database Architecture:** Supabase (PostgreSQL) with Prisma/Drizzle (SQL)
- **Omnichain Oracle:** Wormhole API integrations for liquidity routing

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18+)
- Postgres Database (or remote Supabase connection)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/NeuroTON.git
cd NeuroTON
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` in the `apps/control-plane` directory:
```env
DATABASE_URL=postgres://...
CRON_SECRET=super_secret_cron_string
NEURO_ADMIN_TOKEN=your_admin_jwt
NEXT_PUBLIC_SUPABASE_URL=...
```

### 4. Run the Modules
```bash
# Start the Backend Control Plane (Fastify)
npm run dev --workspace=@neuro/control-plane

# Start the Frontend Telegram MiniApp (Vite)
npm run dev --workspace=@neuro/miniapp
```

_Note for Tonkeeper:_ During local UI development on `localhost`, the system safely defaults to a public sample `tonconnect-manifest.json` ensuring seamless mobile wallet linkage without CORS errors.

---

## ⚖️ License

NeuroTON is deployed under the **MIT License**. We embrace the open source Defi builder community. See `LICENSE` for more information.

<p align="center">
  <i>Built with ❤️ for the TON Ecosystem</i>
</p>
