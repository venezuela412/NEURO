import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, TrendingUp, Scale, Globe, CloudRain } from 'lucide-react';
import { StrategyCard } from './StrategyCard';

const STRATEGIES = [
  {
    id: 1,
    title: 'Zen Staking',
    description: 'Safe liquid staking in TON via Tonstakers. Zero impermanent loss, pure native APY.',
    apy: '7–19%',
    risk: 'Low' as const,
    icon: Shield,
  },
  {
    id: 2,
    title: 'Degen Leverage',
    description: 'Autonomous loan loops on EVAA Protocol. Multiplied APY via leveraged nTON.',
    apy: '25–40%',
    risk: 'High' as const,
    icon: Zap,
  },
  {
    id: 3,
    title: 'HF Farming',
    description: 'Agent hops between DeDust & STON.fi pools tracking the highest yield pairs.',
    apy: '30–60%',
    risk: 'Aggressive' as const,
    icon: TrendingUp,
  },
  {
    id: 4,
    title: 'Delta-Neutral',
    description: 'Arbitrage between USDT/TON while hedging exposure. Minimizes volatility.',
    apy: '15–25%',
    risk: 'Medium' as const,
    icon: Scale,
  },
  {
    id: 5,
    title: 'Stargate',
    description: 'Solvers mirror capital to Solana & BSC high-yield systems. Rewards in TON.',
    apy: '40–80%',
    risk: 'Aggressive' as const,
    icon: Globe,
  },
  {
    id: 6,
    title: 'DCA Rain',
    description: 'Converts daily staking yields into high-momentum tokens like $NOT automatically.',
    apy: '10–15%',
    risk: 'Medium' as const,
    icon: CloudRain,
  },
];

export const IntentMenu: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [isAdvanced, setIsAdvanced] = useState(false);

  return (
    <div className="intent-menu">
      {/* Mode toggle */}
      <div className="intent-toggle-wrap">
        <div className="intent-toggle">
          <button
            onClick={() => setIsAdvanced(false)}
            className={`intent-toggle-btn ${!isAdvanced ? 'intent-toggle-btn--active-teal' : ''}`}
          >
            Concierge
          </button>
          <button
            onClick={() => setIsAdvanced(true)}
            className={`intent-toggle-btn ${isAdvanced ? 'intent-toggle-btn--active-accent' : ''}`}
          >
            Advanced
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="intent-header">
        <h2 className="intent-title">
          {isAdvanced ? 'Direct nTON Custody' : 'Choose Your Intent'}
        </h2>
        <p className="intent-desc">
          {isAdvanced
            ? 'Receive nTON liquid tokens and manage your own DeFi integrations.'
            : 'Select a mission. Our AI solvers will route your TON to outperform the market.'}
        </p>
      </div>

      {/* Strategy grid or Advanced panel */}
      <AnimatePresence mode="wait">
        {!isAdvanced ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="intent-grid"
          >
            {STRATEGIES.map((s) => (
              <StrategyCard
                key={s.id}
                {...s}
                selected={selectedId === s.id}
                onSelect={() => setSelectedId(s.id)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="adv"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="intent-advanced"
          >
            <Shield className="intent-advanced-icon" />
            <h3 className="intent-advanced-title">Advanced Self-Custody</h3>
            <p className="intent-advanced-desc">
              Deposit TON directly into the NeuroVault Smart Contract and receive your nTON LSTs.
              Use them anywhere in the TON Ecosystem.
            </p>
            <button className="intent-advanced-btn">Mint nTON Directly</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer CTA */}
      {!isAdvanced && (
        <div className="intent-footer">
          <p className="intent-footer-label">
            Selected: <strong>{STRATEGIES.find((s) => s.id === selectedId)?.title}</strong>
          </p>
          <button
            className="intent-footer-cta"
            onClick={() => {
              try { (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("heavy"); } catch(_){}
              alert(`Transaction initiated! Deposit 3 TON into NeuroVault.`);
            }}
          >
            DEPLOY VAULT AGENT
          </button>
          <p className="intent-footer-min">Minimum 3 TON Deposit</p>
        </div>
      )}
    </div>
  );
};
