<p align="center">
  <img src="docs/assets/logo.png" width="150" alt="NEURO Logo" style="border-radius: 20px;">
</p>

# NEURO Protocol

**Put your TON to work. Simply.**

NEURO is a Telegram-native DeFi Yield Optimizer designed specifically for the TON blockchain. By abstracting away the complexity of liquidity pools, impermanent loss, routing algorithms, and staging decisions, NEURO distills advanced TON-native yield opportunities into automated, guided portfolios:

- 🛡️ **Protect:** Low-volatility stable yields for capital preservation.
- ✨ **Earn:** Balanced risk/reward liquidity provisioning for passive income.
- 🚀 **Grow:** High-upside algorithmic strategies for aggressive growth.

The protocol cleanly abstracts base-layer complexities (like STON.fi V2 and Tonstakers) behind an ultra-premium, high-conversion interface. Under the hood, **Neuro Yield Vaults (Tact)** handle auto-compounding and asset tracking transparently and autonomously.

## The Vision

NEURO is actively bridging the gap between non-technical Telegram users and sophisticated decentralized finance via:
1. **Aggregated Yields:** One-click capital deployment to the highest-yielding strategies across TON.
2. **ExecDelegate Smart Vaults:** Complete, non-custodial execution proxies programmed in Tact. Users maintain absolute ownership, while the Control Plane asynchronously sequences complex DeFi actions (farming, staking) safely via verified metadata payloads.
3. **Transparent Alignment:** Mathematical alignment via High-Water Mark tracking. A rigorous hard-coded Performance Fee (20% default) only applies to generated yields, never the principal.
4. **Contextual Security:** Replay protections, bounded operations, and isolated execution domains ensure capital is strictly shielded from flash-loans or re-entrancy vectors.

## Technical Architecture

NEURO uses a decoupled, hybrid architecture allowing massive scalability on the frontend while deeply isolating execution operations on-chain.

```text
apps/
  miniapp/           Telegram-native frontend (Vite/React/Vanilla CSS System)
  control-plane/     Off-chain reconciliation & proxy transaction engine (Fastify)

packages/
  shared/            Core domain types and protocol definitions
  domain/            Recommendation engine, pricing, and fee accounting
  adapters/          Integration layer (STON.fi V2, Tonstakers)
  contracts/         Tact Smart Contracts (NeuroVault & Proxy Patterns)
```

## Functional Highlights

- **Telegram-Native Wizard:** Embedded MiniApp with native transitions, optimized strictly for mobile UX constraints.
- **Goal-First Routing:** Deterministic plan generation mapping abstract user goals directly to multi-protocol asset executions.
- **Control-Plane Reconciler:** A dedicated backend orchestrator executing deterministic off-chain tracking before delegating on-chain paths securely.
- **Live Testnet Integration:** Seamless sandbox onboarding. Users can connect to the testnet, generate test TON, and execute fully mocked payload routes with zero financial risk.

## Smart Vault Automations (Live)

Phase 2 sets NEURO firmly into the "Set-and-Forget" era. `NeuroVault`, our core Tact smart contract architecture, is fully implemented and operational on Testnet:
- Utilizes the advanced **ExecDelegate proxy pattern**, safely authenticating operations sent from the Control Plane to execute STON.fi liquidity bounds.
- Auto-compounds yield independently of user intervention.
- Ensures absolute protocol safety, natively discarding bounced errors via built-in asynchronous handlers to ensure funds never get stuck during cross-chain DEX paths.

---
*Disclaimer: NEURO is currently operating in beta access. Decentralized finance involves inherent risks. None of the strategies or vaults presented are risk-free or guaranteed.*
