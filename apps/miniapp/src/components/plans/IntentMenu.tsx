import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, TrendingUp, ChevronRight, Coins, Radio } from 'lucide-react';
import { useMarketAPY } from '../../hooks/useMarketAPY';
import { formatAPYRange } from '../../lib/apyService';

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
  },
];

// Fallback APY strings when data hasn't loaded
const FALLBACK_APY: Record<string, string> = {
  safe: '4–8%',
  moderate: '12–28%',
  bold: '25–65%',
};

export const IntentMenu: React.FC = () => {
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>(null);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const { data: apyData, loading: apyLoading } = useMarketAPY();

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
                {selectedRisk ? selected!.strategyName : 'How much risk is OK?'}
              </h2>
              <p className="intent-desc">
                {selectedRisk
                  ? selected!.strategyDesc
                  : 'Choose your comfort level. You can change this anytime.'}
              </p>
            </div>

            {/* Live APY badge */}
            {apyData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="apy-live-badge"
              >
                <Radio size={12} className={`apy-live-dot ${apyData.isLive ? 'apy-live-dot--live' : ''}`} />
                <span className="apy-live-text">
                  {apyData.isLive ? 'Live rates' : 'Estimated rates'}
                  {lastUpdated && ` · ${lastUpdated}`}
                </span>
              </motion.div>
            )}

            {/* Risk selector */}
            <div className="risk-selector">
              {riskOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedRisk === option.id;
                return (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedRisk(option.id); haptic('medium'); }}
                    className={`risk-card ${isSelected ? 'risk-card--active' : ''}`}
                    style={{
                      '--risk-color': option.color,
                      '--risk-bg': option.bg,
                      '--risk-border': isSelected ? option.color : 'rgba(255,255,255,0.08)',
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
                  onClick={() => {
                    haptic('heavy');
                    alert(`Ready to earn! Connect your wallet and deposit at least 3 TON to start with ${selected!.strategyName}.`);
                  }}
                >
                  START EARNING · {selected!.apy}
                </button>
                <p className="intent-footer-min">Minimum 3 TON to start · Change anytime</p>
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
                  <Coins size={22} />
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
                onClick={() => {
                  haptic('heavy');
                  alert('Connect your wallet to mint nTON directly.');
                }}
              >
                GET nTON TOKENS
              </button>
              <p className="intent-footer-min">Minimum 3 TON · Redeemable anytime</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
