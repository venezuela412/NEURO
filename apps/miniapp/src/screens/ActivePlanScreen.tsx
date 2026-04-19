import { Link } from "react-router-dom";
import { ShieldCheck, TrendingUp, Coins, ArrowDownToLine, RefreshCw, ExternalLink } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNeuroWallet } from "../hooks/useTonWallet";
import {
  NEURO_VAULT_ADDRESS,
  getSharePrice,
  getTVL,
  getUserShares,
  getTransactionHistory,
} from "../lib/vaultTx";

interface VaultState {
  tvl: number;
  sharePrice: number;
  userShares: number;
  userValueTon: number;
  yieldPercent: number;
  transactions: Array<{
    type: string;
    amount: string;
    timestamp: number;
    hash: string;
  }>;
}

export function ActivePlanScreen() {
  const wallet = useNeuroWallet();
  const [vault, setVault] = useState<VaultState | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVaultData = useCallback(async (showRefresh = false) => {
    if (!wallet.address) return;
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [tvl, sharePrice, shares, txs] = await Promise.allSettled([
        getTVL(),
        getSharePrice(),
        getUserShares(wallet.address),
        getTransactionHistory(wallet.address),
      ]);

      const tvlVal = tvl.status === "fulfilled" ? tvl.value : 0;
      const spVal = sharePrice.status === "fulfilled" ? sharePrice.value : 1;
      const sharesVal = shares.status === "fulfilled" ? shares.value : 0;
      const userValue = sharesVal * spVal;
      const yieldPct = spVal > 1 ? (spVal - 1) * 100 : 0;
      const txList = txs.status === "fulfilled" ? txs.value : [];

      setVault({
        tvl: tvlVal,
        sharePrice: spVal,
        userShares: sharesVal,
        userValueTon: userValue,
        yieldPercent: yieldPct,
        transactions: txList,
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch vault data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [wallet.address]);

  useEffect(() => {
    fetchVaultData();
    // Refresh every 30 seconds
    const interval = setInterval(() => fetchVaultData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchVaultData]);

  if (!wallet.connected) {
    return (
      <section className="card page-stack center-stack">
        <Coins size={48} style={{ color: "var(--color-primary)", opacity: 0.6 }} />
        <h1 className="headline-sm">Connect your wallet</h1>
        <p className="muted">Connect your Tonkeeper wallet to see your active vault position.</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="card page-stack center-stack">
        <div className="spinner" style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--color-surface-2)", borderTopColor: "var(--color-primary)", animation: "spin 0.8s linear infinite" }} />
        <h1 className="headline-sm">Loading vault data...</h1>
        <p className="muted">Reading your position from the TON blockchain.</p>
      </section>
    );
  }

  if (error || !vault) {
    return (
      <section className="card page-stack center-stack">
        <h1 className="headline-sm">Unable to load vault</h1>
        <p className="muted">{error || "Something went wrong"}</p>
        <button className="button button-secondary" onClick={() => fetchVaultData()}>
          Retry
        </button>
      </section>
    );
  }

  if (vault.userShares <= 0) {
    return (
      <section className="card page-stack center-stack">
        <Coins size={48} style={{ color: "var(--color-primary)", opacity: 0.6 }} />
        <h1 className="headline-sm">No active position</h1>
        <p className="muted">
          You don't have any nTON shares yet. Deposit TON to start earning yield.
        </p>
        <Link className="button button-primary" to="/deposit">
          Start earning
        </Link>
      </section>
    );
  }

  const depositTx = vault.transactions.find(
    (t) => t.type === "Deposit" && parseFloat(t.amount) > 1
  );
  const timeSinceDeposit = depositTx
    ? Math.round((Date.now() / 1000 - depositTx.timestamp) / 60)
    : null;

  return (
    <div className="page-stack" style={{ padding: "0 16px 100px" }}>
      {/* Status Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(0, 255, 136, 0.08), rgba(99, 102, 241, 0.08))",
        borderRadius: 16,
        padding: "20px",
        border: "1px solid rgba(0, 255, 136, 0.15)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #00ff88, #6366f1, #00ff88)" }} />
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <span className="pill pill-success" style={{ fontSize: 11 }}>
            <ShieldCheck size={12} /> Active
          </span>
          <span className="pill" style={{ fontSize: 11, background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
            <TrendingUp size={12} /> Safe Strategy
          </span>
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text)", margin: "0 0 4px" }}>
          {vault.userValueTon.toFixed(4)} TON
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0 }}>
          Your vault position · {vault.userShares.toFixed(4)} nTON
        </p>

        <button
          onClick={() => fetchVaultData(true)}
          disabled={refreshing}
          style={{
            position: "absolute", top: 16, right: 16, background: "none",
            border: "none", color: "var(--color-text-muted)", cursor: "pointer",
            opacity: refreshing ? 0.4 : 0.7,
          }}
        >
          <RefreshCw size={16} className={refreshing ? "spinning" : ""} />
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="card" style={{ padding: 16, borderRadius: 12 }}>
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1 }}>
            Share Price
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "#00ff88", margin: 0 }}>
            {vault.sharePrice.toFixed(6)}
          </p>
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "2px 0 0" }}>
            TON per nTON
          </p>
        </div>
        <div className="card" style={{ padding: 16, borderRadius: 12 }}>
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1 }}>
            Vault TVL
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
            {vault.tvl.toFixed(2)}
          </p>
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "2px 0 0" }}>
            TON locked
          </p>
        </div>
        <div className="card" style={{ padding: 16, borderRadius: 12 }}>
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1 }}>
            Yield Earned
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, color: vault.yieldPercent > 0 ? "#00ff88" : "var(--color-text)", margin: 0 }}>
            +{vault.yieldPercent.toFixed(3)}%
          </p>
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "2px 0 0" }}>
            since inception
          </p>
        </div>
        <div className="card" style={{ padding: 16, borderRadius: 12 }}>
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1 }}>
            Status
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "#00ff88", margin: 0 }}>
            Earning
          </p>
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "2px 0 0" }}>
            {timeSinceDeposit != null ? `${timeSinceDeposit}m ago` : "compounding"}
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="card" style={{ padding: 16, borderRadius: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--color-text)" }}>
          How your earnings grow
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { icon: "🏦", label: "Your TON is deposited in the vault", done: true },
            { icon: "🔄", label: "Auto-compounding via Tonstakers staking", done: true },
            { icon: "📈", label: "Share price increases as yield accrues", done: vault.yieldPercent > 0 },
            { icon: "💰", label: "Withdraw anytime at current share price", done: false },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>{step.icon}</span>
              <span style={{
                fontSize: 13,
                color: step.done ? "#00ff88" : "var(--color-text-muted)",
                textDecoration: step.done ? "none" : "none",
              }}>
                {step.label}
                {step.done && " ✓"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {vault.transactions.length > 0 && (
        <div className="card" style={{ padding: 16, borderRadius: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--color-text)" }}>
            Recent Transactions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {vault.transactions.slice(0, 5).map((tx, i) => (
              <a
                key={i}
                href={`https://tonviewer.com/transaction/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 12px", borderRadius: 8,
                  background: "rgba(255,255,255,0.03)", textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#00ff88" }}>{tx.type}</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)", marginLeft: 8 }}>
                    {new Date(tx.timestamp * 1000).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 13, color: "var(--color-text)" }}>
                    {parseFloat(tx.amount) > 0 ? "+" : ""}{tx.amount} TON
                  </span>
                  <ExternalLink size={10} style={{ color: "var(--color-text-muted)" }} />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* View on explorer */}
      <a
        href={`https://tonviewer.com/${NEURO_VAULT_ADDRESS}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "12px", borderRadius: 12, fontSize: 13,
          color: "var(--color-text-muted)", textDecoration: "none",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <ExternalLink size={14} />
        View vault on TON Explorer
      </a>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinning { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
