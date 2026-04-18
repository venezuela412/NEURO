<p align="center">
  <img src="https://neuroton-lime.vercel.app/assets/logo.png" width="120" alt="NEURO Logo" style="border-radius: 25px; box-shadow: 0 0 30px rgba(143,115,255,0.4);">
</p>

<h1 align="center">NeuroTON Protocol</h1>

<p align="center">
  <strong>The First Autonomous Omni-Chain Intent Vault on The Open Network (TON).</strong>
</p>

Oustandingly scalable, mathematically bound, and structurally elegant. NeuroTON is a multi-million dollar architecture built to abstract the complexities of decentralized finance through algorithmic solvers and secure **Zero-Trust** smart contracts.

---

## 💎 The V10 APEX Architecture

NeuroTON is designed as an enterprise-grade Yield Optimizer and Liquid Staking derivative protocol. We process Capital via high-level Intents. 

Instead of manual swaps, bridging, and liquidity provision, users express an **Intent** (e.g., *Delta-Neutral Arbitrage* or *High-Frequency Farming*). The NeuroTON solvers map these intents into a unified execution path, deployed globally across Telegram via our natively embedded MiniApp.

### 1. Zero-Trust `NeuroVault` (Tact)
Capital efficiency natively fused with mathematical security.
- **nTON Liquid Staking Standard:** The Vault acts as a TEP-74 Jetton Master. When TON is deposited, it mints `nTON` algorithmically, representing your exact fractional share of the protocol's TVL.
- **Strict Operator Isolation:** Withdrawals are disabled for the Control Plane. The Vercel agent operates purely as an `ExecDelegate`, capable only of cycling yields, harvesting rewards, and routing liquidity exactly as defined by the Smart Contract invariants.
- **Dilution-Minted Performance Fees:** A built-in protocol fee (20%) is minted dynamically during auto-compounding cycles, completely avoiding gas-heavy rebalances and principal decay.

### 2. Dual-Mode UI / Premium DApp
Built for maximum retail conversion while supporting DEFI whales.
- **Onboarding Wizard:** Cinematic, Framer-Motion driven full-bleed onboarding presentation that adapts dynamically across desktop environments and iOS/Android mobile clients.
- **Concierge Mode (1-Click):** Allows users to select from 6 pre-built Autonomous Strategies (Zen Staking, Omni-Chain, DCA Rain, etc) and deploy capital automatically.
- **Advanced Mode (Self-Custody):** For expert DeFi users, allowing direct Mint/Burn functionality to interact with `nTON` directly, utilizing it as collateral in external lending markets like EVAA.

### 3. Vercel Autonomous Solver (TypeScript)
The brain of the NeuroTON APEX architecture.
- **Omni-Chain Router:** Executes Cron-based algorithms (`/api/solver/cron`) computing TVL growth, path-finding across DeDust/STON.fi, and dispatching execution signatures securely.
- **Edge Deployment:** Highly concurrent serverless routines guarantee the mathematical precision of the protocol without centralized bottlenecks or downtime.

---

## 🛠 Project Structure

```text
neuroton/
├── apps/
│   ├── miniapp/           # Frontend: Telegram-native Premium React / Vite / Tailwind v4
│   └── control-plane/     # Backend: Autonomous Solver & Cron Agents (Node / Fastify)
├── packages/
│   ├── contracts/         # Smart Contracts: NeuroVault & Jetton Standard (Tact)
│   ├── domain/            # Core financial logic, fee minting, TVL algorithms
│   └── adapters/          # Execution integrations (DeDust, EVAA, Staking)
```

## 🔒 Security Posture & Standards

NeuroTON strictly adheres to the highest DeFi standards:
- All Smart Contracts written in **Tact** strictly limiting gas abuse.
- Complete execution isolation. No human intervention required or allowed on Vault capital beyond deterministic operations.
- Built-in **3 TON** minimum deposit safeguards to prevent gas-fee erosion attacks and spam vector flooding.

---
**Protocol Phase:** Mainnet Candidate | **Architecture:** V10 APEX Omni-Chain
