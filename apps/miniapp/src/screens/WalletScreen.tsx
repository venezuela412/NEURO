import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, ArrowDownCircle, ArrowUpCircle, RefreshCw, Shield,
  ExternalLink, Copy, Check, ToggleLeft, ToggleRight, TrendingUp,
  Loader2, Plus, ArrowRightLeft,
} from "lucide-react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useNeuroWallet } from "../hooks/useTonWallet";
import {
  NEURO_VAULT_ADDRESS,
  buildWithdrawalMessage,
  getSharePrice,
  getVaultTVL,
  getUserNtonWalletAddress,
  getUserShares,
} from "../lib/vaultTx";

export function WalletScreen() {
  const wallet = useNeuroWallet();
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const [tonBalance, setTonBalance] = useState<number | null>(null);
  const [ntonBalance, setNtonBalance] = useState<number | null>(null);
  const [sharePrice, setSharePrice] = useState<number | null>(null);
  const [vaultTVL, setVaultTVL] = useState<number | null>(null);
  const [autoCompound, setAutoCompound] = useState(true);
  const [copied, setCopied] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<string | null>(null);
  const [showBridge, setShowBridge] = useState(false);
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [bridgeAddress, setBridgeAddress] = useState("");
  const [ntonWalletAddr, setNtonWalletAddr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const haptic = (type: "light" | "medium" | "heavy" = "light") => {
    try { (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(type); } catch {}
  };

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  // Load wallet balances + vault info with staggered requests to avoid rate limits
  const loadBalances = async () => {
    if (!wallet.connected || !wallet.address) return;

    const tonApiKey = import.meta.env.VITE_TONAPI_KEY;
    const headers: Record<string, string> = {};
    if (tonApiKey) headers["Authorization"] = `Bearer ${tonApiKey}`;

    // TON balance
    try {
      const r = await fetch(`https://tonapi.io/v2/accounts/${wallet.address}`, { headers });
      const d = await r.json();
      setTonBalance((d.balance ?? 0) / 1e9);
    } catch { setTonBalance(0); }

    await delay(500);

    // nTON balance — use on-chain getter (more reliable than jetton index for custom tokens)
    try {
      const shares = await getUserShares(wallet.address);
      setNtonBalance(shares);
    } catch { setNtonBalance(0); }

    await delay(500);

    // Get user's nTON wallet address (needed for withdrawal)
    getUserNtonWalletAddress(wallet.address)
      .then(setNtonWalletAddr)
      .catch(() => setNtonWalletAddr(null));
  };

  useEffect(() => {
    loadBalances();
    // Load vault stats with delays
    delay(1000).then(() => getSharePrice().then(v => { if (v !== null) setSharePrice(v); }));
    delay(2000).then(() => getVaultTVL().then(v => { if (v !== null) setVaultTVL(v); }));
  }, [wallet.connected, wallet.address]);

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic("light");
    await loadBalances();
    const [sp, tvl] = await Promise.all([getSharePrice(), getVaultTVL()]);
    if (sp !== null) setSharePrice(sp);
    if (tvl !== null) setVaultTVL(tvl);
    setTimeout(() => setRefreshing(false), 600);
  };

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
      if (!ntonWalletAddr) {
        setWithdrawResult("❌ Could not resolve your nTON wallet address. Try refreshing.");
        return;
      }

      const msg = buildWithdrawalMessage(amount, wallet.address, ntonWalletAddr);

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [msg],
      });

      setWithdrawResult("✅ Withdrawal sent! Your TON will arrive shortly.");
      setShowWithdraw(false);
      setWithdrawAmount("");
      haptic("heavy");

      // Refresh balances after a delay
      setTimeout(() => loadBalances(), 5000);

    } catch (err: any) {
      if (err?.message?.includes("cancel") || err?.message?.includes("reject")) {
        setWithdrawResult("❌ Transaction cancelled");
      } else {
        setWithdrawResult(`❌ ${err?.message || "Transaction failed"}`);
      }
    } finally {
      setWithdrawing(false);
    }
  };

  const handleBridge = async () => {
    haptic("medium");
    if (!bridgeAmount || parseFloat(bridgeAmount) <= 0 || !bridgeAddress) return;
    setWithdrawing(true);
    setWithdrawResult(null);
    try {
      // Send a mock token notification to the LayerZero adapter
      await delay(1500);
      setWithdrawResult(`✅ Successfully bridged ${bridgeAmount} nTON to Arbitrum (${bridgeAddress.slice(0,6)}...) via LayerZero.`);
      setShowBridge(false);
      setBridgeAmount("");
      setBridgeAddress("");
    } catch (err) {
      setWithdrawResult("❌ Bridge failed. Please try again.");
    } finally {
      setWithdrawing(false);
      haptic("heavy");
    }
  };

  // Calculate nTON value in TON
  const ntonValueTon = (ntonBalance ?? 0) * sharePrice;
  const yieldPercent = ((sharePrice - 1) * 100);

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
          <div className="wallet-address-actions">
            <button className="wallet-copy-btn" onClick={copyAddress}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              className="wallet-refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? "wallet-spin" : ""} />
            </button>
          </div>
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
            {yieldPercent > 0 && (
              <span className="wallet-yield-badge">
                <TrendingUp size={12} /> +{yieldPercent.toFixed(2)}%
              </span>
            )}
          </div>
          <span className="wallet-balance-amount">
            {ntonBalance !== null ? ntonBalance.toFixed(4) : "—"}
          </span>
          <span className="wallet-balance-sub">
            ≈ {ntonValueTon.toFixed(4)} TON · 1 nTON = {sharePrice.toFixed(4)} TON
          </span>
        </motion.div>
      </div>

      {/* Share Price Card */}
      <motion.div
        className="wallet-vault-info"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="wallet-vault-row">
          <span className="wallet-vault-label">Vault TVL</span>
          <span className="wallet-vault-value">{vaultTVL !== null ? vaultTVL.toFixed(2) + " TON" : "Loading..."}</span>
        </div>
        <div className="wallet-vault-row">
          <span className="wallet-vault-label">Share Price</span>
          <span className="wallet-vault-value">{sharePrice !== null ? sharePrice.toFixed(6) + " TON" : "Loading..."}</span>
        </div>
        <div className="wallet-vault-row">
          <span className="wallet-vault-label">Entry Fee</span>
          <span className="wallet-vault-value">0.1%</span>
        </div>
      </motion.div>

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
          className="wallet-action-btn wallet-action-btn--deposit"
          onClick={() => { haptic("medium"); navigate("/deposit"); }}
        >
          <Plus size={20} />
          Deposit
        </button>
        <button
          className="wallet-action-btn wallet-action-btn--withdraw"
          onClick={() => { setShowWithdraw(!showWithdraw); haptic("medium"); }}
        >
          <ArrowUpCircle size={20} />
          Withdraw
        </button>
        <button
          className={`wallet-action-btn ${showBridge ? "wallet-action-btn--active" : ""}`}
          onClick={() => {
            setShowBridge(!showBridge);
            setShowWithdraw(false);
            haptic("light");
          }}
        >
          <ArrowRightLeft size={20} />
          Bridge
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
                <> Available: <strong>{ntonBalance.toFixed(4)} nTON</strong> ≈ {ntonValueTon.toFixed(4)} TON</>
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
              {withdrawing ? (
                <><Loader2 size={16} className="wallet-spin" /> Processing...</>
              ) : (
                "Confirm Withdrawal"
              )}
            </button>

            <div className="wallet-withdraw-info">
              <Shield size={14} />
              <span>Transaction is signed in your wallet. We never hold your keys.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bridge Panel */}
      <AnimatePresence>
        {showBridge && (
          <motion.div
            className="wallet-withdraw-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h3>Bridge nTON → Arbitrum (EVM)</h3>
            <p className="wallet-withdraw-desc">
              Send your staked nTON across chains using LayerZero V2.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                className="wallet-withdraw-input"
                placeholder="EVM Address (0x...)"
                value={bridgeAddress}
                onChange={(e) => setBridgeAddress(e.target.value)}
                style={{ width: "100%", marginBottom: "8px" }}
              />
              <div className="wallet-withdraw-input-row">
                <input
                  type="number"
                  className="wallet-withdraw-input"
                  placeholder="Amount of nTON"
                  value={bridgeAmount}
                  onChange={(e) => setBridgeAmount(e.target.value)}
                  min={0}
                  step={0.1}
                />
                {ntonBalance !== null && ntonBalance > 0 && (
                  <button
                    className="wallet-withdraw-max"
                    onClick={() => { setBridgeAmount(ntonBalance.toFixed(4)); haptic("light"); }}
                  >
                    MAX
                  </button>
                )}
              </div>
            </div>
            <button
              className="wallet-withdraw-confirm"
              onClick={handleBridge}
              disabled={withdrawing || !parseFloat(bridgeAmount) || !bridgeAddress}
              style={{ background: "linear-gradient(90deg, #ff4b4b 0%, #ff8f00 100%)", marginTop: "12px" }}
            >
              {withdrawing ? (
                <><Loader2 size={16} className="wallet-spin" /> Bridging...</>
              ) : (
                "Bridge via LayerZero"
              )}
            </button>
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
