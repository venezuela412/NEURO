import { useState, useEffect, useCallback } from "react";

// ==================== TYPES ====================

interface AdminPortfolio {
  walletAddress: string;
  updatedAt: string;
  principalTon: number | null;
  estimatedFeeTon: number | null;
  activePlanId: string | null;
}

interface AdminExecution {
  walletAddress: string;
  receiptId: string;
  createdAt: string;
  planId: string | null;
  status: string | null;
  mode: string | null;
}

interface FeeAccrual {
  wallet_address: string;
  event_type: string;
  tx_hash: string;
  amount_ton: number;
  created_at: string;
}

interface AdminLog {
  id: string;
  level: string;
  category: string;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface ProtocolCheck {
  status: string;
  latencyMs?: number;
  error?: string;
}

interface HealthData {
  database: { portfolioCount: number; executionReceiptCount: number };
  protocols: Record<string, ProtocolCheck>;
  vaultAddress: string;
  timestamp: string;
}

interface SummaryData {
  portfolioCount: number;
  executionReceiptCount: number;
  totalFeesAccruedTon: number;
  portfolios: AdminPortfolio[];
  recentExecutions: AdminExecution[];
}

// ==================== API CLIENT ====================

function getApiUrl() {
  return localStorage.getItem("neuro_admin_api_url") || "http://localhost:8787";
}

function getToken() {
  return localStorage.getItem("neuro_admin_token") || "";
}

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getApiUrl()}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Neuro-Admin-Token": getToken(),
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as any)?.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ==================== STYLES ====================

const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: #0a0a0f;
  color: #e2e8f0;
  min-height: 100vh;
}

.admin-root { max-width: 1400px; margin: 0 auto; padding: 24px; }

.admin-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,.06); margin-bottom: 24px;
}

.admin-header h1 {
  font-size: 22px; font-weight: 800;
  background: linear-gradient(135deg, #7c3aed, #06b6d4);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.admin-header .status-dot {
  width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 8px;
}
.admin-header .status-dot.ok { background: #10b981; box-shadow: 0 0 8px #10b98166; }
.admin-header .status-dot.err { background: #ef4444; box-shadow: 0 0 8px #ef444466; }

.login-form {
  max-width: 420px; margin: 120px auto; padding: 32px;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08);
  border-radius: 16px; backdrop-filter: blur(12px);
}

.login-form h2 { font-size: 20px; font-weight: 700; margin-bottom: 20px; text-align: center; }

.login-form input {
  width: 100%; padding: 12px 16px; background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.1); border-radius: 10px; color: #e2e8f0;
  font-size: 14px; margin-bottom: 12px; outline: none; font-family: inherit;
}
.login-form input:focus { border-color: #7c3aed; }

.login-form button {
  width: 100%; padding: 12px; background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: opacity .2s;
}
.login-form button:hover { opacity: .9; }

.tabs {
  display: flex; gap: 4px; background: rgba(255,255,255,.03); border-radius: 12px;
  padding: 4px; margin-bottom: 24px; overflow-x: auto;
}

.tab {
  padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all .2s; white-space: nowrap; border: none;
  background: transparent; color: #94a3b8;
}
.tab.active { background: rgba(124,58,237,.2); color: #a78bfa; }
.tab:hover:not(.active) { color: #e2e8f0; }

.stats-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px; margin-bottom: 24px;
}

.stat-card {
  padding: 20px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
  border-radius: 14px; transition: border-color .3s;
}
.stat-card:hover { border-color: rgba(124,58,237,.3); }
.stat-card .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; }
.stat-card .value { font-size: 28px; font-weight: 800; }
.stat-card .value.purple { color: #a78bfa; }
.stat-card .value.cyan { color: #06b6d4; }
.stat-card .value.green { color: #10b981; }
.stat-card .value.amber { color: #f59e0b; }

.data-table {
  width: 100%; border-collapse: collapse; font-size: 13px;
}
.data-table th {
  text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase;
  letter-spacing: .5px; color: #64748b; border-bottom: 1px solid rgba(255,255,255,.06);
}
.data-table td {
  padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,.03);
  max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.data-table tr:hover td { background: rgba(255,255,255,.02); }

.badge {
  display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
}
.badge.green { background: rgba(16,185,129,.15); color: #34d399; }
.badge.amber { background: rgba(245,158,11,.15); color: #fbbf24; }
.badge.red { background: rgba(239,68,68,.15); color: #f87171; }
.badge.blue { background: rgba(59,130,246,.15); color: #60a5fa; }
.badge.purple { background: rgba(124,58,237,.15); color: #a78bfa; }

.protocol-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px; margin-bottom: 24px;
}

.protocol-card {
  padding: 20px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
  border-radius: 14px; display: flex; align-items: center; gap: 14px;
}
.protocol-card .dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.protocol-card .dot.healthy { background: #10b981; box-shadow: 0 0 6px #10b98144; }
.protocol-card .dot.degraded { background: #f59e0b; box-shadow: 0 0 6px #f59e0b44; }
.protocol-card .dot.down { background: #ef4444; box-shadow: 0 0 6px #ef444444; }
.protocol-card .info { flex: 1; }
.protocol-card .name { font-weight: 600; font-size: 14px; }
.protocol-card .detail { font-size: 12px; color: #64748b; margin-top: 2px; }

.log-entry { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,.03); font-size: 13px; }
.log-entry .log-meta { display: flex; gap: 10px; align-items: center; margin-bottom: 4px; }
.log-entry .log-time { font-size: 11px; color: #64748b; }
.log-entry .log-msg { color: #cbd5e1; }

.panel { margin-bottom: 24px; }
.panel h3 {
  font-size: 15px; font-weight: 700; margin-bottom: 14px; color: #e2e8f0;
  display: flex; align-items: center; gap: 8px;
}

.btn {
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; border: none; transition: all .2s;
}
.btn-primary { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; }
.btn-primary:hover { opacity: .9; }
.btn-outline { background: transparent; border: 1px solid rgba(255,255,255,.1); color: #94a3b8; }
.btn-outline:hover { border-color: #7c3aed; color: #a78bfa; }

.refresh-bar {
  display: flex; align-items: center; gap: 12px; font-size: 12px; color: #64748b;
}

.empty { text-align: center; padding: 40px; color: #475569; font-size: 14px; }

.table-wrapper { overflow-x: auto; border: 1px solid rgba(255,255,255,.06); border-radius: 12px; }

.error-toast {
  position: fixed; bottom: 24px; right: 24px; padding: 14px 20px;
  background: #1e1e2e; border: 1px solid #ef4444; border-radius: 12px;
  color: #f87171; font-size: 13px; z-index: 1000; max-width: 400px;
  animation: slideIn .3s ease;
}
@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } }
`;

// ==================== COMPONENTS ====================

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [apiUrl, setApiUrl] = useState(getApiUrl());
  const [token, setToken] = useState(getToken());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");
    localStorage.setItem("neuro_admin_api_url", apiUrl);
    localStorage.setItem("neuro_admin_token", token);
    try {
      await adminFetch("/admin/summary");
      onLogin();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-form">
      <h2>🧠 NeuroTON Admin</h2>
      <input
        placeholder="Control Plane URL (e.g. https://your-app.railway.app)"
        value={apiUrl}
        onChange={(e) => setApiUrl(e.target.value)}
      />
      <input
        type="password"
        placeholder="Admin Token (NEURO_ADMIN_TOKEN)"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</p>}
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Connecting..." : "Connect"}
      </button>
    </div>
  );
}

function StatsGrid({ summary }: { summary: SummaryData | null }) {
  if (!summary) return null;
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="label">Total Users</div>
        <div className="value purple">{summary.portfolioCount}</div>
      </div>
      <div className="stat-card">
        <div className="label">Executions</div>
        <div className="value cyan">{summary.executionReceiptCount}</div>
      </div>
      <div className="stat-card">
        <div className="label">Fees Accrued</div>
        <div className="value green">{summary.totalFeesAccruedTon.toFixed(4)} TON</div>
      </div>
      <div className="stat-card">
        <div className="label">Total TVL</div>
        <div className="value amber">
          {summary.portfolios.reduce((sum, p) => sum + (p.principalTon ?? 0), 0).toFixed(2)} TON
        </div>
      </div>
    </div>
  );
}

function UsersTable({ portfolios }: { portfolios: AdminPortfolio[] }) {
  if (!portfolios.length) return <div className="empty">No users yet</div>;
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Wallet</th>
            <th>Plan</th>
            <th>Principal</th>
            <th>Est. Fee</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {portfolios.map((p) => (
            <tr key={p.walletAddress}>
              <td title={p.walletAddress}>{p.walletAddress.slice(0, 8)}...{p.walletAddress.slice(-6)}</td>
              <td><span className={`badge ${p.activePlanId === "safe-income" ? "green" : p.activePlanId === "growth-income" ? "amber" : "blue"}`}>{p.activePlanId ?? "none"}</span></td>
              <td>{p.principalTon?.toFixed(2) ?? "—"} TON</td>
              <td>{p.estimatedFeeTon?.toFixed(4) ?? "—"} TON</td>
              <td style={{ fontSize: 11 }}>{new Date(p.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExecutionsTable({ executions }: { executions: AdminExecution[] }) {
  if (!executions.length) return <div className="empty">No executions yet</div>;

  function statusBadge(status: string | null) {
    const s = status ?? "unknown";
    const cls = s === "confirmed" ? "green" : s === "submitted" ? "blue" : s === "failed" ? "red" : "amber";
    return <span className={`badge ${cls}`}>{s}</span>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Wallet</th>
            <th>Receipt ID</th>
            <th>Plan</th>
            <th>Mode</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {executions.map((e) => (
            <tr key={e.receiptId}>
              <td title={e.walletAddress}>{e.walletAddress.slice(0, 8)}...{e.walletAddress.slice(-6)}</td>
              <td style={{ fontSize: 11 }}>{e.receiptId.slice(0, 16)}...</td>
              <td><span className="badge purple">{e.planId ?? "—"}</span></td>
              <td>{e.mode ?? "—"}</td>
              <td>{statusBadge(e.status)}</td>
              <td style={{ fontSize: 11 }}>{new Date(e.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeesPanel() {
  const [fees, setFees] = useState<{ totalFeesAccruedTon: number; feeHistory: FeeAccrual[] } | null>(null);

  useEffect(() => {
    adminFetch<{ totalFeesAccruedTon: number; feeHistory: FeeAccrual[] }>("/admin/fees")
      .then(setFees)
      .catch(() => {});
  }, []);

  if (!fees) return <div className="empty">Loading fees...</div>;

  return (
    <div className="panel">
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="label">Total Revenue</div>
          <div className="value green">{fees.totalFeesAccruedTon.toFixed(4)} TON</div>
        </div>
      </div>
      {fees.feeHistory.length === 0 ? (
        <div className="empty">No fee accruals yet</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Wallet</th><th>Event</th><th>Amount</th><th>TX Hash</th><th>Time</th></tr>
            </thead>
            <tbody>
              {fees.feeHistory.map((f, i) => (
                <tr key={i}>
                  <td>{f.wallet_address.slice(0, 8)}...{f.wallet_address.slice(-6)}</td>
                  <td><span className="badge blue">{f.event_type}</span></td>
                  <td>{f.amount_ton.toFixed(4)} TON</td>
                  <td style={{ fontSize: 11 }}>{f.tx_hash ? f.tx_hash.slice(0, 16) + "..." : "—"}</td>
                  <td style={{ fontSize: 11 }}>{new Date(f.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HealthPanel() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      setHealth(await adminFetch<HealthData>("/admin/health"));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  if (!health) return <div className="empty">{loading ? "Checking protocols..." : "Failed to load health data"}</div>;

  const protocolNames: Record<string, string> = {
    tonstakers_api: "Tonstakers (TonAPI)",
    stonfi_api: "STON.fi Markets",
    ton_rpc: "TON RPC Node",
  };

  return (
    <div className="panel">
      <h3>🔗 Protocol Status</h3>
      <div className="protocol-grid">
        {Object.entries(health.protocols).map(([key, check]) => (
          <div className="protocol-card" key={key}>
            <div className={`dot ${check.status}`} />
            <div className="info">
              <div className="name">{protocolNames[key] ?? key}</div>
              <div className="detail">
                {check.status === "healthy"
                  ? `${check.latencyMs}ms`
                  : check.error ?? check.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3>💾 Database</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Portfolios</div>
          <div className="value purple">{health.database.portfolioCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">Receipts</div>
          <div className="value cyan">{health.database.executionReceiptCount}</div>
        </div>
      </div>

      <h3>🏦 Vault</h3>
      <div className="stat-card" style={{ marginBottom: 16 }}>
        <div className="label">Contract Address</div>
        <div className="value" style={{ fontSize: 14, wordBreak: "break-all" }}>{health.vaultAddress}</div>
      </div>

      <button className="btn btn-outline" onClick={fetchHealth} disabled={loading}>
        {loading ? "Checking..." : "Recheck"}
      </button>
    </div>
  );
}

function LogsPanel() {
  const [logs, setLogs] = useState<AdminLog[]>([]);

  useEffect(() => {
    adminFetch<{ logs: AdminLog[] }>("/admin/logs")
      .then((d) => setLogs(d.logs))
      .catch(() => {});
  }, []);

  function levelBadge(level: string) {
    const cls = level === "error" ? "red" : level === "warn" ? "amber" : "blue";
    return <span className={`badge ${cls}`}>{level}</span>;
  }

  if (!logs.length) return <div className="empty">No logs yet</div>;

  return (
    <div className="panel">
      {logs.map((log) => (
        <div className="log-entry" key={log.id}>
          <div className="log-meta">
            {levelBadge(log.level)}
            <span className="badge purple">{log.category}</span>
            <span className="log-time">{new Date(log.created_at).toLocaleString()}</span>
          </div>
          <div className="log-msg">{log.message}</div>
        </div>
      ))}
    </div>
  );
}

function ActionsPanel() {
  const [reconcileResult, setReconcileResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleReconcileAll() {
    setLoading(true);
    try {
      const result = await adminFetch<{ reconciled: number; failed: number; totalPending: number }>("/admin/reconcile-all", { method: "POST" });
      setReconcileResult(`✅ Reconciled: ${result.reconciled}, Failed: ${result.failed}, Total Pending: ${result.totalPending}`);
    } catch (e) {
      setReconcileResult(`❌ ${e instanceof Error ? e.message : "Failed"}`);
    }
    setLoading(false);
  }

  async function handleCleanupSessions() {
    try {
      await adminFetch("/admin/cleanup-sessions", { method: "POST" });
      setReconcileResult("✅ Expired sessions cleaned up");
    } catch (e) {
      setReconcileResult(`❌ ${e instanceof Error ? e.message : "Failed"}`);
    }
  }

  return (
    <div className="panel">
      <h3>⚡ Actions</h3>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={handleReconcileAll} disabled={loading}>
          {loading ? "Reconciling..." : "Reconcile All Pending"}
        </button>
        <button className="btn btn-outline" onClick={handleCleanupSessions}>
          Cleanup Expired Sessions
        </button>
      </div>
      {reconcileResult && <p style={{ fontSize: 13, color: "#94a3b8" }}>{reconcileResult}</p>}
    </div>
  );
}

// ==================== MAIN APP ====================

type TabId = "overview" | "users" | "executions" | "fees" | "health" | "logs" | "actions";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await adminFetch<SummaryData>("/admin/summary");
      setSummary(data);
      setLastRefresh(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fetch failed");
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [authenticated, fetchSummary]);

  // Check if already authenticated on mount
  useEffect(() => {
    if (getToken()) {
      adminFetch("/admin/summary")
        .then(() => setAuthenticated(true))
        .catch(() => {});
    }
  }, []);

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "📊 Overview" },
    { id: "users", label: "👥 Users" },
    { id: "executions", label: "⚡ Executions" },
    { id: "fees", label: "💰 Revenue" },
    { id: "health", label: "🔗 Health" },
    { id: "logs", label: "📋 Logs" },
    { id: "actions", label: "🛠️ Actions" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="admin-root">
        {!authenticated ? (
          <LoginForm onLogin={() => { setAuthenticated(true); fetchSummary(); }} />
        ) : (
          <>
            <header className="admin-header">
              <h1>🧠 NeuroTON Admin</h1>
              <div className="refresh-bar">
                <span className={`status-dot ${error ? "err" : "ok"}`} />
                {lastRefresh && <span>Updated {lastRefresh.toLocaleTimeString()}</span>}
                <button className="btn btn-outline" onClick={fetchSummary} style={{ padding: "5px 12px" }}>↻</button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    localStorage.removeItem("neuro_admin_token");
                    setAuthenticated(false);
                    setSummary(null);
                  }}
                  style={{ padding: "5px 12px" }}
                >
                  Logout
                </button>
              </div>
            </header>

            <div className="tabs">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  className={`tab ${tab === t.id ? "active" : ""}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <>
                <StatsGrid summary={summary} />
                <div className="panel">
                  <h3>📊 Recent Users</h3>
                  <UsersTable portfolios={summary?.portfolios?.slice(0, 10) ?? []} />
                </div>
                <div className="panel">
                  <h3>⚡ Recent Executions</h3>
                  <ExecutionsTable executions={summary?.recentExecutions?.slice(0, 10) ?? []} />
                </div>
              </>
            )}

            {tab === "users" && (
              <div className="panel">
                <h3>👥 All Users ({summary?.portfolioCount ?? 0})</h3>
                <UsersTable portfolios={summary?.portfolios ?? []} />
              </div>
            )}

            {tab === "executions" && (
              <div className="panel">
                <h3>⚡ All Executions ({summary?.executionReceiptCount ?? 0})</h3>
                <ExecutionsTable executions={summary?.recentExecutions ?? []} />
              </div>
            )}

            {tab === "fees" && <FeesPanel />}
            {tab === "health" && <HealthPanel />}
            {tab === "logs" && <LogsPanel />}
            {tab === "actions" && <ActionsPanel />}
          </>
        )}

        {error && <div className="error-toast">⚠️ {error}</div>}
      </div>
    </>
  );
}
