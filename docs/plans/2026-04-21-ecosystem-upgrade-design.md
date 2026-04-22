# NeuroTON Ecosystem Upgrade Design

## Overview
This document outlines the three-phased architectural upgrade for the NeuroTON protocol, transitioning it from a deployed smart contract to a fully operational, omnichain automated yield ecosystem.

## Phase 1: Frontend Integration & Polish
**Goal:** Connect the React Miniapp to the live Mainnet NeuroMaster TEP-74 contract.
- **Data Fetching:** Integrate TonAPI to resolve the user's specific `nTON` Jetton Wallet address and fetch their real-time balance.
- **Transactions:** Update `vaultTx.ts` payloads so deposits (TON -> nTON) and withdrawals (nTON -> TON) interface correctly with the Mainnet TEP-74 standard.
- **UI Metrics:** Display real-time TVL and dynamic APY directly derived from the on-chain contract state.

## Phase 2: Keeper Automation Engine
**Goal:** Finalize the autonomous execution loop for yield generation.
- **Scheduling:** Implement a `node-cron` task (or external trigger) within the `control-plane` to periodically ping the `/api/solver/cron` endpoint.
- **Security:** Secure the cron endpoint using the `CRON_SECRET`.
- **Execution:** When triggered, the backend `OmniChainSolver` will scan DEXs (DeDust, STON.fi), compute profitability, and autonomously dispatch the `executeKeeperRebalance` transaction via the funded Keeper Wallet.

## Phase 3: Omnichain Expansion (LayerZero)
**Goal:** Expand NeuroTON to EVM networks via LayerZero V2.
- **Smart Contracts:** Implement the `layer_zero_oft.tact` adapter, inheriting from standard LayerZero V2 OFT interfaces and connecting to the TON `EndpointV2`.
- **UI:** Add a "Bridge" tab to the miniapp to allow seamless cross-chain transfers of `nTON` between TON, Arbitrum, Base, etc.
