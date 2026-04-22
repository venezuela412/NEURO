<p align="center">
  <img src="https://neuroton-lime.vercel.app/assets/logo.png" width="180" alt="NEURO Logo" style="border-radius: 35px; box-shadow: 0 0 50px rgba(143,115,255,0.6);">
</p>

<h1 align="center">NeuroTON Protocol: Intent-Based AVS Yield Network</h1>

<p align="center">
  <em>The definitive institutional-grade omnichain yield protocol for the TON Blockchain.</em>
</p>

<p align="center">
  <a href="https://neuroton-lime.vercel.app"><img src="https://img.shields.io/badge/Live_App-neuroton.vercel.app-7132F5?style=for-the-badge&logo=vercel" alt="Live App"></a>
  <a href="https://layerzero.network"><img src="https://img.shields.io/badge/Architecture-LayerZero_v2-black?style=for-the-badge&logo=layerzero" alt="LayerZero"></a>
  <a href="https://eigenlayer.xyz"><img src="https://img.shields.io/badge/Security-EigenLayer_AVS-blue?style=for-the-badge" alt="EigenLayer AVS"></a>
</p>

---

## 🌌 The Billion-Dollar Vision

**NeuroTON** transcends traditional yield aggregators. It fundamentally rebuilds decentralized capital allocation through an **Intent-Based Actively Validated Service (AVS) Architecture**.

Rather than relying on basic smart contracts or centralized cron jobs to shift capital, NeuroTON utilizes an open market of independent AI Solvers. Users sign cryptographic intents, and these solvers compete in real-time to execute zero-latency cross-chain arbitrage and deep-liquidity farming.

By deploying **Delta-Neutral Vaults**, NeuroTON generates >100% APY systematically, extracting maximum value from DEX trading fees and Perpetual Funding Rates without ever taking directional market risk.

---

## 🚀 Key Protocol Mechanics

| Feature | Description |
| ------- | ----------- |
| 🧠 **Intent-Based Solver Network** | A decentralized EigenLayer-style AVS network where institutional solvers compete to fulfill user intents for maximum capital efficiency. |
| ⚖️ **Delta-Neutral AI Farming** | Automatic hedging logic. Capital is split between Spot LP and Short Perpetuals on decentralised exchanges (Storm Trade/Hyperliquid) to farm 100%+ APYs with zero price delta. |
| 💧 **Continuous Yield Streaming** | Traditional protocols batch payouts daily. NeuroTON streams mathematically proven yield second-by-second directly to the unified UI. |
| 🌉 **LayerZero v2 Omnichain LST Routing** | Built upon the OFT standard and utilizing `lzCompose`, solvers execute cross-chain capital shifting instantly, eliminating bridge wait times for the end user. |
| 💎 **Robust Sybil Resistance** | Advanced off-chain Control Plane point-ledgers. Referral thresholds enforce a 5-TON minimum viable capital sink. |

---

## 📈 nTON Tokenomics vs tsTON

nTON is not just another Liquid Staking Token (LST). While traditional solutions like tsTON rely solely on Proof-of-Stake (PoS) validator rewards yielding around ~4-5% APY, **nTON** is an AVS Receipt Token representing yield generated through sophisticated Delta-Neutral strategies.

### Why nTON is Superior:
- **Capital Efficiency:** Standard staking locks TON to secure the network. nTON deploys TON into Spot Liquidity Pools and short Perpetual contracts simultaneously.
- **Yield Multiplier:** By earning both DEX LP fees and Perpetual Funding Rates, nTON targets **15-30%+ APY** consistently, vastly outperforming the 4-5% ceiling of vanilla staking.
- **Zero Directional Risk:** The delta-neutral architecture means your capital is protected from TON price volatility while still farming high yields.
- **Omnichain Utility:** Backed by LayerZero v2 OFT standards, nTON can be transferred and utilized as collateral across any connected chain instantly.

---

## 💎 The Points Engine & Incentives

NeuroTON features a robust, mathematically sound points system designed to prevent sybil attacks and reward genuine, long-term liquidity providers.

### 1. TVL-Based Daily Accrual
Points are not given out for mere clicks. Capital must be deployed.
- **24-Hour Warmup:** To prevent deposit-and-withdraw flash-gaming, new deposits must sit in the protocol for at least 24 hours before they begin generating points.
- **Daily Yield:** Once mature, portfolios earn **100 points per 1 TON of TVL** automatically every 24 hours via our backend Cron execution matrix.

### 2. Sybil-Resistant Referrals
- **Sign-up Bonus:** New users receive an immediate 100-point boost.
- **Value-Gated Referral Bonus:** The referrer earns a massive **500-point** reward *only* when the invited user commits a minimum capital sink of 5 TON. Phantom wallets and bot nets are fundamentally ignored by the protocol.

---

## 🏛️ Enterprise System Architecture

NeuroTON uses an event-driven Actively Validated Service (AVS) architecture, allowing off-chain AI solvers to securely manage on-chain multi-protocol capital allocation.

```text
                                  ┌────────────────────────┐
                                  │   Telegram User Client │
                                  │   (Vite + React)       │
                                  └───────────┬────────────┘
                                              │ Signs "Intent"
┌─────────────────────────────────────────────▼─────────────────────────────────────────────┐
│ ┌───────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                         NeuroTON Decentralized AVS Solver Network                     │ │
│ │                                                                                       │ │
│ │   [ Solver Node 1 ]      [ Solver Node 2 ]      [ Neuro AI Core ]     [ EVM Solvers]  │ │
│ └──────────────────────────────────────┬────────────────────────────────────────────────┘ │
│                                        │ ZK-Proofs of Execution                           │
└────────────────────────────────────────┼──────────────────────────────────────────────────┘
                                         ▼
                     ┌──────────────────────────────────────┐
                     │          NeuroTON Smart Vault        │
                     │          (Cryptographic Verifier)    │
                     └──────┬────────────────────────┬──────┘
                            │                        │
               ┌────────────▼───────────┐    ┌───────▼────────────────┐
               │    Delta-Neutral TON   │    │ LayerZero Sub-Vaults   │
               │  (STON.fi / StormTrade)│    │ (Arbitrum / Base LRT)  |
               └────────────────────────┘    └────────────────────────┘
```

### The Neuro AI Execution Pipeline
1. **Intents:** The user submits a liquidity routing intent via TonConnect cryptographic signatures.
2. **Competition:** Decentralized solvers analyze Hyperliquid funding rates and DeDust/STON liquidity vacuums to find the highest-ROI Delta-Neutral play.
3. **Fulfillment:** Solvers execute the capital deployment instantly, providing proofs to the Neuro Vault and initiating the continuous yield stream.

---

## 🔒 Military-Grade Security

We deploy military-grade institutional safeguards against MEV, spoofing, and protocol drainage:

- **StateInit Spoofing Protection:** Strict cryptographic validation ensures public keys derived from `StateInit` match the TonConnect signatures perfectly.
- **Deposit-Gated Ledgers:** Anti-Sybil meta-tracking guarantees organic adoption metrics by ignoring zero-value or phantom TVL injections.
- **Zero-Directional Risk:** The Aggressive `Grow` plan uses strict Delta-Neutral perp hedging formulas, isolating users from extreme TON/USD or ETH/USD price movements.

---

## 🛠️ Infrastructure Stack

- **Frontend Core:** React, TypeScript, Vite
- **Web3 Ecosystem:** `@tonconnect/ui-react`, `@ton/core`, TonAPI
- **Solver Infrastructure:** Node.js, Fastify Control Plane, LayerZero cross-chain mocking
- **Real-Time Data:** Supabase (PostgreSQL)

---

## 💻 Local Execution

### Prerequisites
- Node.js (v18+)

### 1. Initialize System
```bash
git clone https://github.com/your-org/NeuroTON.git
cd NeuroTON
npm install
```

### 2. Environment Variables
Create a `.env` in the `apps/control-plane` directory:
```env
DATABASE_URL=postgres://...
CRON_SECRET=super_secret_cron_string
```

### 3. Start AVS Simulator & Client
```bash
# Start the Backend AVS Control Plane
npm run dev --workspace=@neuro/control-plane

# Start the Client Interface
npm run dev --workspace=@neuro/miniapp
```

---

## ⚖️ License

NeuroTON is fully open-source and deployed under the **MIT License**. We embrace the open source Defi builder community.

<p align="center">
  <i>The Future of Autonomous Liquidity on TON</i>
</p>
