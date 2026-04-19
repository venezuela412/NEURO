import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Info } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useNeuroWallet } from "../hooks/useTonWallet";

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];
const MIN_DEPOSIT = 3;

const PLAN_LABELS: Record<string, { name: string; color: string }> = {
  protect: { name: "Safe Savings", color: "#26d3c7" },
  earn: { name: "Balanced Earner", color: "#f59e0b" },
  grow: { name: "Power Boost", color: "#ef4444" },
};

export function DepositScreen() {
  const navigate = useNavigate();
  const wallet = useNeuroWallet();
  const { goal, setAmountTon } = useAppStore();
  const [amount, setAmount] = useState("");
  const plan = PLAN_LABELS[goal] ?? PLAN_LABELS.earn;

  const numAmount = parseFloat(amount) || 0;
  const isValid = numAmount >= MIN_DEPOSIT;

  const haptic = (type: "light" | "medium" | "heavy" = "light") => {
    try { (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(type); } catch {}
  };

  const handleContinue = () => {
    if (!isValid) return;
    haptic("heavy");
    setAmountTon(numAmount);
    navigate("/result");
  };

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
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min={MIN_DEPOSIT}
            step={1}
            autoFocus
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
            onClick={() => { setAmount(String(preset)); haptic("light"); }}
          >
            {preset} TON
          </button>
        ))}
      </motion.div>

      {/* Info */}
      <motion.div
        className="deposit-info-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Info size={16} className="deposit-info-icon" />
        <p>
          Your TON is deposited into a <strong>non-custodial smart contract</strong>. 
          You receive nTON tokens and can withdraw anytime from the Wallet tab.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        className="deposit-cta-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          className="deposit-cta"
          disabled={!isValid}
          onClick={handleContinue}
        >
          <span>Review Plan · {numAmount > 0 ? `${numAmount} TON` : "..."}</span>
          <ArrowRight size={18} />
        </button>
        <button
          className="deposit-back"
          onClick={() => { haptic("light"); navigate("/plans"); }}
        >
          Change strategy
        </button>
      </motion.div>
    </div>
  );
}
