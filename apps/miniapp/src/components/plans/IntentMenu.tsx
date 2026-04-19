import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, TrendingUp, ChevronRight, Coins, Radio, Wallet, ExternalLink, ArrowRight, X } from 'lucide-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useNeuroWallet } from '../../hooks/useTonWallet';
import { useMarketAPY } from '../../hooks/useMarketAPY';
import { formatAPYRange } from '../../lib/apyService';
import { useAppStore } from '../../store/appStore';

type RiskLevel = 'safe' | 'moderate' | 'bold' | null;

interface RiskOption {
  id: 'safe' | 'moderate' | 'bold';
  label: string;
  subtitle: string;
  icon: typeof Shield;
  color: string;
  bg: string;
  border: string;
  apy: string;
  strategyName: string;
  strategyDesc: string;
  howItWorks: string;
  goal: 'protect' | 'earn' | 'grow';
  risk: 'low' | 'medium' | 'high';
}

const BASE_OPTIONS: Omit<RiskOption, 'apy'>[] = [
  {
    id: 'safe',
    label: 'Safe',
    subtitle: 'Steady & reliable',
    icon: Shield,
    color: '#26d3c7',
    bg: 'rgba(38,211,199,0.08)',
    border: 'rgba(38,211,199,0.25)',
    strategyName: 'Safe Savings',
    strategyDesc: 'Your TON earns steady interest through secure staking. No surprises — just reliable, consistent growth over time.',
    howItWorks: 'We stake your TON through Tonstakers, the leading staking provider on TON. Your funds earn native blockchain rewards automatically.',
    goal: 'protect',
    risk: 'low',
  },
  {
    id: 'moderate',
    label: 'Moderate',
    subtitle: 'Balanced growth',
    icon: TrendingUp,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    strategyName: 'Balanced Earner',
    strategyDesc: 'Your TON earns from multiple sources — staking rewards plus trading opportunities. Higher returns with controlled exposure.',
    howItWorks: 'We combine safe staking with selective yield farming across DeDust and STON.fi. The system automatically rebalances to manage risk.',
    goal: 'earn',
    risk: 'medium',
  },
  {
    id: 'bold',
    label: 'Bold',
    subtitle: 'Maximum returns',
    icon: Zap,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    strategyName: 'Power Boost',
    strategyDesc: 'Your TON is actively managed across multiple protocols and chains for maximum returns. High reward, higher volatility.',
    howItWorks: 'Advanced strategies including leveraged positions, cross-chain yield farming, and automated arbitrage. Our system monitors 24/7 to capture opportunities.',
    goal: 'grow',
    risk: 'high',
  },
];

// Fallback APY strings when data hasn't loaded
const FALLBACK_APY: Record<string, string> = {
  safe: '4–8%',
  moderate: '12–28%',
  bold: '25–65%',
};

const WALLET_APPS = [
  {
    name: 'Tonkeeper',
    desc: 'Most popular TON wallet',
    url: 'https://tonkeeper.com',
    color: '#45AEF5',
  },
  {
    name: 'MyTonWallet',
    desc: 'Simple & lightweight',
    url: 'https://mytonwallet.io',
    color: '#7B68EE',
  },
  {
    name: 'Tonhub',
    desc: 'Advanced features',
    url: 'https://tonhub.com',
    color: '#3CC28A',
  },
];

export const IntentMenu: React.FC = () => {
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useNeuroWallet();
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>(null);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [showWalletGuide, setShowWalletGuide] = useState(false);
  const { data: apyData, loading: apyLoading } = useMarketAPY();
  const { setGoal, setRiskPreference, setAmountTon } = useAppStore();

  const haptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    try { (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(type); } catch(_){}
  };

  // Merge live APY data into risk options
  const riskOptions: RiskOption[] = useMemo(() => {
    return BASE_OPTIONS.map((opt) => ({
      ...opt,
      apy: apyData
        ? formatAPYRange(apyData[opt.id].min, apyData[opt.id].max)
        : FALLBACK_APY[opt.id],
    }));
  }, [apyData]);

  const selected = riskOptions.find(r => r.id === selectedRisk);

  // Format "last updated" time
  const lastUpdated = useMemo(() => {
    if (!apyData) return null;
    const mins = Math.round((Date.now() - apyData.updatedAt) / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1 min ago';
    return `${mins} min ago`;
  }, [apyData]);

  /** Handle the "START EARNING" tap — connect wallet if needed, then navigate */
  const handleStartEarning = async () => {
    haptic('heavy');

    if (!wallet.connected) {
      // Open TonConnect modal to connect wallet
      try {
        await tonConnectUI.openModal();
      } catch {
        // User cancelled — do nothing
      }
      return;
    }

    if (!selected) return;

    // Map IntentMenu selection → appStore
    setGoal(selected.goal);
    setRiskPreference(selected.risk);
    setAmountTon(0); // Reset so user enters fresh amount

    // Navigate to the plan wizard amount step
    navigate('/deposit');
  };

  /** Handle the "GET nTON" tap */
  const handleGetNton = async () => {
    haptic('heavy');

    if (!wallet.connected) {
      try {
        await tonConnectUI.openModal();
      } catch {
        // User cancelled
      }
      return;
    }

    setGoal('protect');
    setRiskPreference('low');
    setAmountTon(0);
    navigate('/deposit');
  };

  return (
    <div className="intent-menu">
      {/* Mode toggle */}
      <div className="intent-toggle-wrap">
        <div className="intent-toggle">
          <button
            onClick={() => { setIsAdvanced(false); haptic('light'); }}
            className={`intent-toggle-btn ${!isAdvanced ? 'intent-toggle-btn--active-teal' : ''}`}
          >
            Easy Mode
          </button>
          <button
            onClick={() => { setIsAdvanced(true); haptic('light'); }}
            className={`intent-toggle-btn ${isAdvanced ? 'intent-toggle-btn--active-accent' : ''}`}
          >
            Advanced
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isAdvanced ? (
          <motion.div
            key="easy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div className="intent-header">
              <h2 className="intent-title">
                {selected ? selected.strategyName : 'Choose Your Strategy'}
              </h2>
              <p className="intent-desc">
                {selected ? selected.strategyDesc : 'Select a risk level that matches your comfort. NEURO handles the rest automatically.'}
              </p>
              {apyData && (
                <div className="intent-live-badge">
                  <Radio size={10} className="intent-live-dot" />
                  <span>Estimated rates · {lastUpdated}</span>
                </div>
              )}
            </div>

            {/* Risk Options */}
            <div className="risk-cards">
              {riskOptions.map((option) => {
                const isSelected = selectedRisk === option.id;
                const Icon = option.icon;

                return (
                  <motion.button
                    key={option.id}
                    onClick={() => {
                      setSelectedRisk(isSelected ? null : option.id);
                      haptic('medium');
                    }}
                    className={`risk-card ${isSelected ? 'risk-card--selected' : ''}`}
                    layout
                    transition={{ layout: { type: 'spring', stiffness: 400, damping: 30 } }}
                    style={{
                      '--card-color': option.color,
                      '--card-bg': option.bg,
                      '--card-border': isSelected ? option.border : 'transparent',
                    } as React.CSSProperties}
                  >
                    <div className="risk-card-top">
                      <div className="risk-icon-wrap" style={{ background: option.bg, color: option.color }}>
                        <Icon size={20} />
                      </div>
                      <div className="risk-card-text">
                        <span className="risk-card-label">{option.label}</span>
                        <span className="risk-card-sub">{option.subtitle}</span>
                      </div>
                      <div className="risk-card-apy" style={{ color: option.color }}>
                        <span className={`risk-apy-value ${apyLoading ? 'apy-shimmer' : ''}`}>
                          {option.apy}
                        </span>
                        <span className="risk-apy-label">EST. APY</span>
                      </div>
                    </div>

                    {/* Expanded detail when selected */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="risk-card-detail"
                        >
                          <div className="risk-detail-section">
                            <p className="risk-detail-label">How it works</p>
                            <p className="risk-detail-text">{option.howItWorks}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            {/* CTA */}
            {selectedRisk && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className="intent-footer"
              >
                <button
                  className="intent-footer-cta"
                  onClick={handleStartEarning}
                >
                  {wallet.connected ? (
                    <>START EARNING · {selected!.apy}</>
                  ) : (
                    <>CONNECT WALLET TO START</>
                  )}
                </button>
                <p className="intent-footer-min">
                  {wallet.connected
                    ? 'Minimum 3 TON to start · Change anytime'
                    : 'You need a TON wallet to deposit'
                  }
                </p>

                {/* Wallet guidance for new users */}
                {!wallet.connected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <button
                      className="wallet-guide-toggle"
                      onClick={(e) => { e.stopPropagation(); setShowWalletGuide(!showWalletGuide); haptic('light'); }}
                    >
                      <Wallet size={14} />
                      <span>New to TON? Get a wallet in 2 minutes</span>
                      <ChevronRight size={14} style={{ transform: showWalletGuide ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>

                    <AnimatePresence>
                      {showWalletGuide && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="wallet-guide-panel"
                        >
                          <p className="wallet-guide-desc">
                            Download any of these free wallets, create an account, and <strong>fund it with at least 3 TON</strong> from an exchange (like Binance, OKX, or Bybit).
                          </p>
                          <div className="wallet-guide-apps">
                            {WALLET_APPS.map((app) => (
                              <a
                                key={app.name}
                                href={app.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="wallet-guide-app"
                                onClick={() => haptic('light')}
                              >
                                <div className="wallet-guide-app-icon" style={{ background: app.color }}>
                                  <Wallet size={16} />
                                </div>
                                <div className="wallet-guide-app-info">
                                  <strong>{app.name}</strong>
                                  <span>{app.desc}</span>
                                </div>
                                <ExternalLink size={14} className="wallet-guide-app-arrow" />
                              </a>
                            ))}
                          </div>
                          <div className="wallet-guide-steps">
                            <p><strong>Quick start:</strong></p>
                            <p>1. Download the app → Create a wallet</p>
                            <p>2. Save your recovery phrase safely</p>
                            <p>3. Buy or transfer TON to your wallet</p>
                            <p>4. Come back here → tap <strong>Connect Wallet</strong></p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* ─── Advanced Panel ─── */
          <motion.div
            key="adv"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="advanced-panel"
          >
            <div className="intent-header">
              <h2 className="intent-title">Self-Managed Mode</h2>
              <p className="intent-desc">
                For experienced users. Get nTON tokens and use them across the TON ecosystem.
              </p>
            </div>

            {/* What is nTON explainer */}
            <div className="nton-explainer">
              <div className="nton-explainer-header">
                <div className="nton-icon-wrap">
                  <img src="/nton-logo.png" alt="nTON" style={{ width: 28, height: 28, borderRadius: 8 }} />
                </div>
                <h3 className="nton-title">What is nTON?</h3>
              </div>
              <p className="nton-desc">
                nTON is a <strong>Liquid Staking Token</strong> that represents your share
                of the NeuroVault. When you deposit TON, you receive nTON back — 
                a token whose value grows as the vault earns yields.
              </p>
              <div className="nton-benefits">
                <div className="nton-benefit">
                  <ChevronRight size={14} className="nton-benefit-arrow" />
                  <span><strong>Keep earning</strong> — nTON increases in value over time</span>
                </div>
                <div className="nton-benefit">
                  <ChevronRight size={14} className="nton-benefit-arrow" />
                  <span><strong>Stay liquid</strong> — use nTON in DeFi while still earning</span>
                </div>
                <div className="nton-benefit">
                  <ChevronRight size={14} className="nton-benefit-arrow" />
                  <span><strong>Redeem anytime</strong> — swap nTON back to TON whenever you want</span>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="nton-flow">
              <h4 className="nton-flow-title">How It Works</h4>
              <div className="nton-steps">
                <div className="nton-step">
                  <div className="nton-step-num">1</div>
                  <div className="nton-step-text">
                    <strong>Deposit TON</strong>
                    <span>Send TON to the NeuroVault Smart Contract</span>
                  </div>
                </div>
                <div className="nton-step">
                  <div className="nton-step-num">2</div>
                  <div className="nton-step-text">
                    <strong>Receive nTON</strong>
                    <span>Get nTON tokens proportional to your deposit</span>
                  </div>
                </div>
                <div className="nton-step">
                  <div className="nton-step-num">3</div>
                  <div className="nton-step-text">
                    <strong>Use Anywhere</strong>
                    <span>Trade, lend, or LP your nTON across TON DeFi</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="intent-footer" style={{ marginTop: '8px' }}>
              <button
                className="intent-footer-cta"
                onClick={handleGetNton}
              >
                {wallet.connected ? 'GET nTON TOKENS' : 'CONNECT WALLET FIRST'}
              </button>
              <p className="intent-footer-min">Minimum 3 TON · Redeemable anytime</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
