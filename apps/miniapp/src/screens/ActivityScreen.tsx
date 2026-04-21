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

  const [activeTab, setActiveTab] = useState<"transactions" | "rewards">("transactions");
  const [pointsData, setPointsData] = useState<any>(null);

  const loadPoints = async () => {
    if (!wallet.connected || !wallet.address) return;
    try {
      const res = await fetch(`/api/users/${wallet.address}`);
      const data = await res.json();
      setPointsData(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadTransactions();
    loadPoints();
  }, [wallet.connected, wallet.address]);

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic("light");
    if (activeTab === "transactions") {
      await loadTransactions();
    } else {
      await loadPoints();
    }
    setTimeout(() => setRefreshing(false), 600);
  };

  if (!wallet.connected) {
    return (
      <div className="activity-screen page-stack">
        <div className="activity-empty card center-stack">
          <Activity size={48} className="activity-empty-icon" />
          <h2 className="headline-sm">Activity Feed</h2>
          <p className="muted">Connect your wallet to see your transaction history.</p>
        </div>
      </div>
    );
  }

  const renderTransactions = () => (
    <>
      {/* Loading */}
      {loading && transactions.length === 0 && (
        <div className="activity-loading card center-stack">
          <RefreshCw size={24} className="wallet-spin" />
          <p className="muted">Loading transactions...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && transactions.length === 0 && (
        <motion.div
          className="activity-empty-state card center-stack"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Clock size={32} style={{ color: "var(--color-primary)", opacity: 0.5, marginBottom: 16 }} />
          <h3 style={{ fontSize: 16, margin: "0 0 8px" }}>No vault activity yet</h3>
          <p className="muted">Your deposit, withdrawal, and yield transactions will appear here.</p>
        </motion.div>
      )}

      {/* Transaction List */}
      <div className="activity-list flex flex-col gap-2">
        <AnimatePresence>
          {transactions.map((tx, i) => {
            const config = TYPE_CONFIG[tx.type] || TYPE_CONFIG.unknown;
            const Icon = config.icon;

            return (
              <motion.div
                key={tx.hash}
                className="activity-item card"
                style={{ padding: 12, display: "flex", alignItems: "center", gap: 12 }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="activity-item-icon" style={{ background: config.color + "18", padding: 10, borderRadius: "50%" }}>
                  <Icon size={18} style={{ color: config.color }} />
                </div>
                <div className="activity-item-info" style={{ flex: 1 }}>
                  <span className="activity-item-type block font-600" style={{ color: config.color, fontSize: 13 }}>
                    {config.label}
                  </span>
                  <span className="activity-item-time" style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{formatTime(tx.time)}</span>
                </div>
                <div className="activity-item-amount" style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 6 }}>
                  <span className={`activity-amount ${tx.type === "deposit" ? "activity-amount--plus" : tx.type === "withdrawal" ? "activity-amount--minus" : ""}`} style={{ fontSize: 14, fontWeight: 700, color: tx.type === "deposit" ? "#00ff88" : tx.type === "withdrawal" ? "var(--color-text)" : "var(--color-text)" }}>
                    {tx.type === "deposit" ? "+" : tx.type === "withdrawal" ? "-" : ""}
                    {tx.amount.toFixed(4)} TON
                  </span>
                  <a
                    href={`https://tonviewer.com/transaction/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="activity-item-link"
                    style={{ color: "var(--color-text-muted)" }}
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
    </>
  );

  const renderRewards = () => (
    <div className="rewards-tab flex flex-col gap-4">
      <div className="card" style={{ padding: 24, borderRadius: 16, background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
        <h3 style={{ fontSize: 13, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" }}>Total Points</h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 42, fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>
            {pointsData ? pointsData.points : "0"}
          </span>
          <span style={{ fontSize: 16, color: "#ec4899", fontWeight: 600 }}>pts</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 12 }}>
          Points will be converted to $NTON air-drops. Hold and refer to earn more.
        </p>
      </div>

      <div className="card" style={{ padding: 20, borderRadius: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>Invite friends</h3>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 16 }}>
          Earn 500 pts when friends connect, deposit min 5 TON and hold for 3 days. They get 100 bonus pts!
        </p>
        
        {pointsData?.referral_code ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.2)" }}>
            <code style={{ flex: 1, color: "#00ff88", fontSize: 13 }}>
              https://t.me/NEUROTON_bot/app?startapp={pointsData.referral_code}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://t.me/NEUROTON_bot/app?startapp=${pointsData.referral_code}`);
                haptic("medium");
              }}
              style={{ background: "#6366f1", color: "white", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              Copy
            </button>
          </div>
        ) : (
          <div className="spinner wallet-spin" style={{ width: 24, height: 24, borderTopColor: "#6366f1" }} />
        )}
      </div>

      <div className="card" style={{ padding: 20, borderRadius: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text)", marginBottom: 16 }}>Reward History</h3>
        {pointsData?.history?.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pointsData.history.map((h, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)" }}>{h.reason.replace(/_/g, " ")}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{new Date(h.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ec4899" }}>+{h.amount} pts</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>No point events yet.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="activity-screen page-stack" style={{ paddingBottom: 100 }}>
      {/* Header Tabs */}
      <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 4, marginBottom: 24 }}>
        <button
          onClick={() => { setActiveTab("transactions"); haptic("light"); }}
          style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: activeTab === "transactions" ? "rgba(255,255,255,0.1)" : "transparent", color: activeTab === "transactions" ? "white" : "var(--color-text-muted)", fontSize: 14, fontWeight: 600 }}
        >
          Transactions
        </button>
        <button
          onClick={() => { setActiveTab("rewards"); haptic("light"); }}
          style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: activeTab === "rewards" ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.2))" : "transparent", color: activeTab === "rewards" ? "#ec4899" : "var(--color-text-muted)", fontSize: 14, fontWeight: 600 }}
        >
          Rewards & Points
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, margin: 0 }}>{activeTab === "transactions" ? "Recent Activity" : "Your Rewards"}</h2>
        <button className="activity-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={18} className={refreshing ? "wallet-spin" : ""} />
        </button>
      </div>

      {activeTab === "transactions" ? renderTransactions() : renderRewards()}
    </div>
  );
}
