import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Clock, RefreshCw, ExternalLink, Activity } from "lucide-react";
import { useNeuroWallet } from "../hooks/useTonWallet";
import { getUserVaultTransactions, type VaultTransaction } from "../lib/vaultTx";

const TYPE_CONFIG = {
  deposit:    { icon: ArrowDownCircle, label: "Deposit",    color: "#22c55e" },
  withdrawal: { icon: ArrowUpCircle,   label: "Withdrawal", color: "#ef4444" },
  yield:      { icon: TrendingUp,      label: "Yield",      color: "#f59e0b" },
  compound:   { icon: RefreshCw,       label: "Compound",   color: "#8b5cf6" },
  unknown:    { icon: Activity,        label: "Transaction",color: "#6b7280" },
} as const;

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function ActivityScreen() {
  const wallet = useNeuroWallet();
  const [transactions, setTransactions] = useState<VaultTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const haptic = (type: "light" | "medium" | "heavy" = "light") => {
    try { (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(type); } catch {}
  };

  const loadTransactions = async () => {
    if (!wallet.connected || !wallet.address) return;
    setLoading(true);
    try {
      const txs = await getUserVaultTransactions(wallet.address);
      setTransactions(txs);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [wallet.connected, wallet.address]);

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic("light");
    await loadTransactions();
    setTimeout(() => setRefreshing(false), 600);
  };

  if (!wallet.connected) {
    return (
      <div className="activity-screen">
        <div className="activity-empty">
          <Activity size={48} className="activity-empty-icon" />
          <h2>Activity Feed</h2>
          <p>Connect your wallet to see your transaction history with the vault.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-screen">
      {/* Header */}
      <div className="activity-header">
        <div>
          <h2>Activity</h2>
          <p className="activity-subtitle">Your vault transaction history</p>
        </div>
        <button
          className="activity-refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={18} className={refreshing ? "wallet-spin" : ""} />
        </button>
      </div>

      {/* Loading */}
      {loading && transactions.length === 0 && (
        <div className="activity-loading">
          <RefreshCw size={24} className="wallet-spin" />
          <p>Loading transactions...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && transactions.length === 0 && (
        <motion.div
          className="activity-empty-state"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Clock size={32} className="activity-empty-clock" />
          <h3>No vault activity yet</h3>
          <p>Your deposit, withdrawal, and yield transactions will appear here.</p>
        </motion.div>
      )}

      {/* Transaction List */}
      <div className="activity-list">
        <AnimatePresence>
          {transactions.map((tx, i) => {
            const config = TYPE_CONFIG[tx.type] || TYPE_CONFIG.unknown;
            const Icon = config.icon;

            return (
              <motion.div
                key={tx.hash}
                className="activity-item"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="activity-item-icon" style={{ background: config.color + "18" }}>
                  <Icon size={18} style={{ color: config.color }} />
                </div>
                <div className="activity-item-info">
                  <span className="activity-item-type" style={{ color: config.color }}>
                    {config.label}
                  </span>
                  <span className="activity-item-time">{formatTime(tx.time)}</span>
                </div>
                <div className="activity-item-amount">
                  <span className={`activity-amount ${tx.type === "deposit" ? "activity-amount--plus" : tx.type === "withdrawal" ? "activity-amount--minus" : ""}`}>
                    {tx.type === "deposit" ? "+" : tx.type === "withdrawal" ? "-" : ""}
                    {tx.amount.toFixed(4)} TON
                  </span>
                  <a
                    href={`https://tonviewer.com/transaction/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="activity-item-link"
                    onClick={() => haptic("light")}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
