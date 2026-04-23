import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Info, Shield, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useAppStore } from "../store/appStore";
import { useNeuroWallet } from "../hooks/useTonWallet";
import { buildDepositMessage, getIsPaused } from "../lib/vaultTx";

const PRESET_AMOUNTS = [0.5, 5, 10, 25, 50];
const MIN_DEPOSIT = 0.5;

const PLAN_LABELS: Record<string, { name: string; color: string; intent: number }> = {
  protect: { name: "Safe Savings", color: "#26d3c7", intent: 1 },
  earn:    { name: "Balanced Earner", color: "#f59e0b", intent: 1 },
  grow:    { name: "Power Boost", color: "#ef4444", intent: 2 },
};

type DepositState = "idle" | "checking" | "signing" | "confirming" | "success" | "error";

export function DepositScreen() {
  const navigate = useNavigate();
  const wallet = useNeuroWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { goal, setAmountTon } = useAppStore();
  const [amount, setAmount] = useState("");
  const [depositState, setDepositState] = useState<DepositState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const plan = PLAN_LABELS[goal] ?? PLAN_LABELS.earn;

  const numAmount = parseFloat(amount) || 0;
  const isValid = numAmount >= MIN_DEPOSIT;

  const haptic = (type: "light" | "medium" | "heavy" = "light") => {
    try { (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(type); } catch {}
  };

  const handleDeposit = async () => {
    if (!isValid || !wallet.connected) return;
    haptic("heavy");
    setErrorMsg("");

    try {
      // Step 1: Check if vault is paused
      setDepositState("checking");
      const paused = await getIsPaused();
      if (paused) {
        setDepositState("error");
        setErrorMsg("Vault is temporarily paused. Please try again later.");
        return;
      }

      // Step 2: Build and sign the deposit transaction
      setDepositState("signing");
      const msg = buildDepositMessage(numAmount, plan.intent);

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 min validity
        messages: [msg],
      });

      // Step 3: Success
      setDepositState("success");
      haptic("heavy");
      setAmountTon(numAmount);

      // Navigate after short celebration
      setTimeout(() => {
        navigate("/active");
      }, 2500);

    } catch (err: any) {
      setDepositState("error");
      if (err?.message?.includes("cancel") || err?.message?.includes("reject")) {
        setErrorMsg("Transaction cancelled");
      } else {
        setErrorMsg(err?.message || "Transaction failed. Please try again.");
      }
      haptic("medium");
    }
  };

  const isProcessing = depositState !== "idle" && depositState !== "error" && depositState !== "success";

  return (
    <div className="deposit-screen">
      {/* Plan badge */}
      <motion.div
        className="deposit-plan-badge"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ borderColor: plan.color + "33", background: plan.color + "0D" }}
      >
        <div className="deposit-plan-dot" style={{ background: plan.color }} />
        <span style={{ color: plan.color }}>{plan.name}</span>
      </motion.div>

      {/* Header */}
      <motion.div
        className="deposit-header"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1>How much TON?</h1>
        <p>Enter the amount you want to put to work with your <strong style={{ color: plan.color }}>{plan.name}</strong> strategy.</p>
      </motion.div>

      {/* Amount Input */}
      <motion.div
        className="deposit-input-wrap"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="deposit-input-box">
          <input
            type="number"
            className="deposit-input"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setDepositState("idle"); }}
            placeholder="0"
            min={MIN_DEPOSIT}
            step={1}
            autoFocus
            disabled={isProcessing}
          />
          <span className="deposit-currency">TON</span>
        </div>

        {numAmount > 0 && numAmount < MIN_DEPOSIT && (
          <motion.p
            className="deposit-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Minimum deposit is {MIN_DEPOSIT} TON
          </motion.p>
        )}
      </motion.div>

      {/* Preset Amounts */}
      <motion.div
        className="deposit-presets"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {PRESET_AMOUNTS.map((preset) => (
          <button
            key={preset}
            className={`deposit-preset ${numAmount === preset ? "deposit-preset--active" : ""}`}
            onClick={() => { setAmount(String(preset)); haptic("light"); setDepositState("idle"); }}
            disabled={isProcessing}
          >
            {preset} TON
          </button>
        ))}
      </motion.div>

      {/* Info Card */}
      <motion.div
        className="deposit-info-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Shield size={16} className="deposit-info-icon" />
        <p>
          Your TON is deposited into a <strong>non-custodial smart contract</strong> on TON mainnet.
          You receive nTON tokens and can withdraw anytime from the Wallet tab.
          {numAmount > 0 && (
            <> A <strong>0.1% entry fee</strong> protects against flash-loan attacks.</>
          )}
        </p>
      </motion.div>

      {/* Status Messages */}
      <AnimatePresence mode="wait">
        {depositState === "checking" && (
          <motion.div className="deposit-status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader2 size={18} className="deposit-spinner" />
            <span>Checking vault status...</span>
          </motion.div>
        )}
        {depositState === "signing" && (
          <motion.div className="deposit-status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader2 size={18} className="deposit-spinner" />
            <span>Please confirm in {wallet.walletName}...</span>
          </motion.div>
        )}
        {depositState === "success" && (
          <motion.div className="deposit-status deposit-status--success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <CheckCircle size={18} />
            <span>Deposit sent! Your nTON will arrive shortly.</span>
          </motion.div>
        )}
        {depositState === "error" && errorMsg && (
          <motion.div className="deposit-status deposit-status--error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <XCircle size={18} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <motion.div
        className="deposit-cta-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {!wallet.connected ? (
          <button
            className="deposit-cta"
            onClick={() => { haptic("heavy"); tonConnectUI.openModal(); }}
          >
            <span>Connect Wallet to Deposit</span>
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            className="deposit-cta"
            disabled={!isValid || isProcessing || depositState === "success"}
            onClick={handleDeposit}
          >
            {isProcessing ? (
              <span>Processing...</span>
            ) : depositState === "success" ? (
              <span>✅ Deposited!</span>
            ) : (
              <>
                <span>Deposit {numAmount > 0 ? `${numAmount} TON` : "..."}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        )}
        <button
          className="deposit-back"
          onClick={() => { haptic("light"); navigate("/plans"); }}
          disabled={isProcessing}
        >
          Change strategy
        </button>
      </motion.div>
    </div>
  );
}
