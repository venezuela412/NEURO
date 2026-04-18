# DeFi E2E Execution & Fee Accrual Implementation Plan

> **For Antigravity:** REQUIRED SUB-SKILL: Load executing-plans to implement this plan task-by-task.

**Goal:** Implement the "Hybrid Client ExecutionProvider + Server Reconciliation" approach for STON and Tonstakers, alongside the `fee_accrual` database table.

**Architecture:** 
- Frontend defines `ExecutionProvider<TQuote>` handling TonConnect BOC building.
- Backend upgrades `db.ts` to log transparent `fee_accrual` on success.
- Backend `reconciliation.ts` calls external indexers (TonAPI) to verify "submitted" receipts, decoupling from pure client trust.

**Tech Stack:** Node.js, Fastify, TypeScript, React, `@ston-fi/omniston-sdk-react`, `tonstakers-sdk`.

---

### Task 1: Create the \`fee_accrual\` Database Schema

**Files:**
- Modify: `apps/control-plane/src/db.ts`

**Step 1: Write the minimal implementation**
We will add the `fee_accrual` table to the `schemaSql` string.

```typescript
// En schemaSql agregar:
CREATE TABLE IF NOT EXISTS fee_accrual (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  execution_receipt_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  amount_accrued_nano TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

**Step 2: Run test/verification**
Run: `pnpm dev:control-plane` and check for SQL syntax errors on boot.
Expected: PASS (server boots).

### Task 2: Implement the \`ExecutionProvider\` Core Interface

**Files:**
- Create: `packages/adapters/src/execution.ts`
- Modify: `packages/adapters/src/index.ts` (to export it)

**Step 1: Write the minimal implementation**
Define the `ExecutionProvider` interface that genericizes routing protocols.

```typescript
// packages/adapters/src/execution.ts
import type { ExecutionStatus } from "@neuro/shared";

export interface TonConnectMessage {
    address: string;
    amount: string;
    payload?: string;
}

export interface ExecutionProvider<TQuote> {
  quote(amountTon: number): Promise<TQuote>;
  buildMessages(quote: TQuote): Promise<TonConnectMessage[]>;
}
```

**Step 2: Run build to verify type check**
Run: `pnpm build`
Expected: PASS.

### Task 3: Upgrade Tonstakers Adapter

**Files:**
- Modify: `packages/adapters/src/tonstakers.ts`

**Step 1: Write the minimal implementation**
Refactor the existing `createTonstakersAdapter` into a class or object that implements `ExecutionProvider<SafeIncomeExecutionPreview>`.

**Step 2: Run build to verify**
Run: `pnpm build`
Expected: PASS without TypeScript errors.

### Task 4: Create STON.fi Adapter

**Files:**
- Create: `packages/adapters/src/ston.ts`
- Modify: `packages/adapters/src/index.ts` (to export it)

**Step 1: Write the minimal implementation**
Implement `ExecutionProvider<any>` (quote type to be defined based on Omniston SDK).

**Step 2: Run build to verify**
Run: `pnpm build`
Expected: PASS.

### Task 5: Upgrade Server Reconciler con Verificación

**Files:**
- Modify: `apps/control-plane/src/reconciliation.ts`

**Step 1: Write the minimal implementation**
Modify the `/reconcile` behavior to poll `https://tonapi.io/v2/blockchain/transactions/{txHash}`.
If validation succeeds, calculate fee and INSERT into `fee_accrual`.

**Step 2: Run test/verification**
Run: `pnpm dev:control-plane`
Expected: PASS.

### Task 6: Conectar Provider al Frontend (MiniApp)

**Files:**
- Modify: `apps/miniapp/src/app/routes/ActivePlanScreen.tsx`

**Step 1: Write the minimal implementation**
Instantiate the `ExecutionProvider` based on the selected plan. Call `.buildMessages`, pass them to `TonConnectUI.sendTransaction(messages)`, and POST `hash` to `/reconcile`.

**Step 2: Run frontend build**
Run: `pnpm build`
Expected: PASS completely.
