# NEURO Fee Accounting

A core value proposition of NEURO is its transparent, realized-only fee model (`no-fee-on-losses`).

## The Model

Rather than charging performance fees dynamically in real-time or relying purely on smart-contract native intercepts (which carry heavy gas and security auditing burdens), NEURO observes the on-chain data and enforces a **High-Water Mark** methodology.

### High-Water Mark Logic
- **Definition:** The fee is strictly tied to actual *realized* gains above the highest historical portfolio value (the high-water mark) derived by user capital. 
- **Trigger:** We only accrue billable commission events when a user executes a `Withdraw` or a transition between plans that finalizes positive yield creation.
- **Accrual:** We store the pending fee amounts in the `fee_accrual` postgres table instead of blocking TonConnect execution logic. 

## Backend Implementation

Inside the `Control-Plane` (Fastify service), when a execution receipt is successfully reconciled (e.g., verifying via `TonAPI` that tokens were sold back into a higher amount of `TON`), the backend calculates the difference.

```typescript
const profit = finalRealized - historicalCapitalBasis;

if (profit > 0) {
    const feeToRecord = profit * NEURO_COMMISSION_RATE; // e.g., 20%
    await insertFeeAccrual(userId, feeToRecord);
}
```

### Partner Attribution
Fees can theoretically be split. Although currently modeled for central NEURO treasury operations, there is an architectural seam inside the database to attribute specific `start_param` deep-links or referral partners with specific accrued tranches, facilitating revenue sharing models down the line.
