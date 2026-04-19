import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ArrowDownCircle, ArrowUpCircle, RefreshCw, Shield, ExternalLink, Copy, Check, ToggleLeft, ToggleRight } from "lucide-react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useNeuroWallet } from "../hooks/useTonWallet";
import { useAppStore } from "../store/appStore";

const CP_BASE = import.meta.env.VITE_CONTROL_PLANE_URL ?? "";

export function WalletScreen() {
  const wallet = useNeuroWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [tonBalance, setTonBalance] = useState<number | null>(null);
  const [ntonBalance, setNtonBalance] = useState<number | null>(null);
  const [autoCompound, setAutoCompound] = useState(true);
  const [copied, setCopied] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<string | null>(null);

  const haptic = (type: "light" | "medium" | "heavy" = "light") => {
    try { (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(type); } catch {}
  };

  // Load wallet info from TonAPI
  useEffect(() => {
    if (!wallet.connected || !wallet.address) return;

    const tonApiKey = import.meta.env.VITE_TONAPI_KEY;
    const headers: Record<string, string> = {};
    if (tonApiKey) headers["Authorization"] = `Bearer ${tonApiKey}`;

    // Fetch TON balance
    fetch(`https://tonapi.io/v2/accounts/${wallet.address}`, { headers })
      .then((r) => r.json())
      .then((d) => setTonBalance((d.balance ?? 0) / 1e9))
      .catch(() => setTonBalance(0));

    // Fetch jetton (nTON) balances
    fetch(`https://tonapi.io/v2/accounts/${wallet.address}/jettons`, { headers })
      .then((r) => r.json())
      .then((d) => {
        const jettons = d.balances ?? [];
        // Look for nTON in the jetton list
        const nton = jettons.find((j: any) =>
          j.jetton?.symbol?.toLowerCase() === "nton" ||
          j.jetton?.name?.toLowerCase()?.includes("neuro")
        );
        setNtonBalance(nton ? Number(nton.balance) / 1e9 : 0);
      })
      .catch(() => setNtonBalance(0));
  }, [wallet.connected, wallet.address]);

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      haptic("light");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || !wallet.address) return;

    setWithdrawing(true);
    setWithdrawResult(null);
    haptic("heavy");

    try {
      const res = await fetch(`${CP_BASE}/api/withdrawal/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: wallet.address, burnAmountNton: amount }),
      });
      const data = await res.json();

      if (data.ok && data.txParams) {
        // Send via TonConnect
        await tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 600,
          messages: [{
            address: data.txParams.to,
            amount: data.txParams.value,
            payload: data.txParams.payload,
          }],
        });
        setWithdrawResult("✅ Withdrawal transaction sent! Your TON will arrive shortly.");
        setShowWithdraw(false);
        setWithdrawAmount("");
        haptic("heavy");
      } else {
        setWithdrawResult(`❌ ${data.error || "Failed to build withdrawal"}`);
      }
    } catch (err) {
      setWithdrawResult("❌ Transaction cancelled or failed");
    } finally {
      setWithdrawing(false);
    }
  };

  // Not connected state
  if (!wallet.connected) {
    return (
      <div className="wallet-screen">
        <div className="wallet-empty">
          <div className="wallet-empty-icon">
            <Wallet size={48} />
          </div>
          <h2>Connect Your Wallet</h2>
          <p>Connect a TON wallet to view your balance, manage deposits, and withdraw earnings.</p>
          <button
            className="wallet-connect-btn"
            onClick={() => { haptic("heavy"); tonConnectUI.openModal(); }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const shortAddr = wallet.address
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-6)}`
    : "";

  return (
    <div className="wallet-screen">
      {/* Address Card */}
      <div className="wallet-address-card">
        <div className="wallet-address-row">
          <div className="wallet-address-info">
            <span className="wallet-label">Your Wallet</span>
            <span className="wallet-addr">{shortAddr}</span>
          </div>
          <button className="wallet-copy-btn" onClick={copyAddress}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="wallet-balances">
        <motion.div
          className="wallet-balance-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="wallet-balance-header">
            <div className="wallet-balance-icon wallet-balance-icon--ton">💎</div>
            <span className="wallet-balance-name">TON</span>
          </div>
          <span className="wallet-balance-amount">
            {tonBalance !== null ? tonBalance.toFixed(4) : "—"}
          </span>
          <span className="wallet-balance-sub">Available to deposit</span>
        </motion.div>

        <motion.div
          className="wallet-balance-card wallet-balance-card--nton"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="wallet-balance-header">
            <img src="/nton-logo.png" alt="nTON" className="wallet-balance-coin-logo" />
            <span className="wallet-balance-name">nTON</span>
          </div>
          <span className="wallet-balance-amount">
            {ntonBalance !== null ? ntonBalance.toFixed(4) : "—"}
          </span>
          <span className="wallet-balance-sub">Earning yield</span>
        </motion.div>
      </div>

      {/* Auto-Compound Toggle */}
      <motion.div
        className="wallet-compound-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="wallet-compound-info">
          <RefreshCw size={18} className="wallet-compound-icon" />
          <div>
            <strong>Auto-Compound</strong>
            <p>Reinvest earnings automatically for compound growth</p>
          </div>
        </div>
        <button
          className="wallet-compound-toggle"
          onClick={() => { setAutoCompound(!autoCompound); haptic("medium"); }}
        >
          {autoCompound ? (
            <ToggleRight size={32} className="toggle-on" />
          ) : (
            <ToggleLeft size={32} className="toggle-off" />
          )}
        </button>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="wallet-actions"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          className="wallet-action-btn wallet-action-btn--withdraw"
          onClick={() => { setShowWithdraw(!showWithdraw); haptic("medium"); }}
        >
          <ArrowUpCircle size={20} />
          Withdraw
        </button>
        <a
          href={`https://tonviewer.com/${wallet.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="wallet-action-btn wallet-action-btn--explorer"
          onClick={() => haptic("light")}
        >
          <ExternalLink size={20} />
          Explorer
        </a>
      </motion.div>

      {/* Withdraw Panel */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div
            className="wallet-withdraw-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h3>Withdraw nTON → TON</h3>
            <p className="wallet-withdraw-desc">
              Burn nTON to redeem your TON plus earned yields.
              {ntonBalance !== null && ntonBalance > 0 && (
                <> Available: <strong>{ntonBalance.toFixed(4)} nTON</strong></>
              )}
            </p>
            <div className="wallet-withdraw-input-row">
              <input
                type="number"
                className="wallet-withdraw-input"
                placeholder="Amount of nTON"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min={0}
                step={0.1}
              />
              {ntonBalance !== null && ntonBalance > 0 && (
                <button
                  className="wallet-withdraw-max"
                  onClick={() => { setWithdrawAmount(ntonBalance.toFixed(4)); haptic("light"); }}
                >
                  MAX
                </button>
              )}
            </div>
            <button
              className="wallet-withdraw-confirm"
              onClick={handleWithdraw}
              disabled={withdrawing || !parseFloat(withdrawAmount)}
            >
              {withdrawing ? "Processing..." : "Confirm Withdrawal"}
            </button>

            <div className="wallet-withdraw-info">
              <Shield size={14} />
              <span>Transaction is signed in your wallet. We never hold your keys.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Result */}
      <AnimatePresence>
        {withdrawResult && (
          <motion.div
            className="wallet-withdraw-result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {withdrawResult}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
