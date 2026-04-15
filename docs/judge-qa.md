# NEURO judge Q&A

## What problem are you solving?

Many TON holders have idle TON but do not use passive income opportunities because the UX is too complex. They do not want to learn DeFi concepts like liquidity pools, routing, LP tokens, slippage, or farming mechanics.

NEURO solves that by turning TON income opportunities into simple plans:

- Protect
- Earn
- Grow

The user sees human goals. NEURO handles the complexity underneath.

## Why is this important now?

TON distribution through Telegram is creating a larger audience of non-expert users. That means there is a growing mismatch:

- infrastructure is maturing
- consumer UX is still too technical

NEURO addresses that gap by making passive income understandable, approachable, and mobile-native.

## Why Telegram?

Telegram is where TON-native users already spend time.

It is the right surface for NEURO because the product should feel:

- compact
- personal
- one-thumb friendly
- fast to understand
- easy to return to

NEURO is designed as a Mini App, not a desktop-first crypto terminal squeezed into mobile.

## Why TON?

TON is a strong fit because:

- it is closely connected to Telegram distribution
- it has ecosystem primitives that can support safe and growth-oriented income paths
- it still has room for better consumer abstractions

NEURO is trying to become the “consumer income layer” on top of TON opportunities.

## Why is this different?

NEURO is not another dashboard. The difference is the abstraction.

Most crypto products say:
- pick a protocol
- pick a pool
- pick a route
- manage risk yourself

NEURO says:
- choose what you want
- Protect, Earn, or Grow
- see one recommended plan
- understand risk and fallback clearly
- activate in a calm, guided flow

The novelty is a deterministic income-plan UX for normal users inside Telegram.

## What is technically hard here?

The hard part is not just frontend polish. It is translating complex protocol behavior into a safe, explainable product model.

Technical challenges include:

- deterministic plan recommendation
- safety guardrails
- fee accounting without charging on losses
- route-quality-aware fallback logic
- wallet-native activation flow
- future protocol adapter integration
- keeping the interface simple while the architecture remains extensible

## What is real in the MVP right now?

Current implemented foundation:

- Telegram-native React Mini App shell
- TonConnect provider wiring
- deterministic plan engine
- plan catalog for Safe, Balanced, Growth, and Exit to Safety
- fee preview logic
- portfolio snapshot model
- activity feed model
- control-plane service foundation

Still to be integrated in later phases:

- live Tonstakers execution
- live STON.fi quote/execution support
- persistent backend storage
- real transaction reconciliation

## How does the fee model work?

NEURO is designed to earn when the user earns.

Current fee model:

- Safe Income: 0% of profit
- Balanced Income: 10% of profit
- Growth Income: 15% of profit

Rules:

- no fee on losses
- no fee on principal
- fee preview is shown before activation
- net estimated value is displayed transparently

This is a trust feature, not hidden monetization.

## How does safety work?

Safety is part of the product, not a disclaimer.

Current safety model includes:

- gas reserve awareness
- wallet-required activation
- route-quality-aware recommendations
- fallback behavior per plan
- visible risk acknowledgment
- no fake success state

The product language stays human-readable:

- current mode
- available to withdraw
- safer fallback
- active plan

instead of raw DeFi jargon.

## What comes next after the hackathon?

Priority next steps:

1. Tonstakers safe-plan execution
2. STON.fi route and quote integration
3. live execution state machine
4. control-plane persistence and activity history
5. Telegram theme and viewport adaptation
6. better wallet onboarding and transaction confirmation UX
7. optional thin automation contract if it creates real value without unsafe custody

The long-term vision is a Telegram-native passive income operating system for TON, starting from the simplest possible user experience.
