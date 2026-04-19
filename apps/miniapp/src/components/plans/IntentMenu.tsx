import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, TrendingUp, Scale, Globe, CloudRain } from 'lucide-react';
import { StrategyCard } from './StrategyCard';

const STRATEGIES = [
  {
    id: 1,
    title: 'Safe Savings',
    description: 'The safest option. Your TON earns steady interest like a savings account — no surprises, just reliable growth.',
    apy: '7–19%',
    risk: 'Low' as const,
    icon: Shield,
  },
  {
    id: 2,
    title: 'Power Boost',
    description: 'Your earnings are automatically reinvested to multiply your returns. Higher rewards with more market exposure.',
    apy: '25–40%',
    risk: 'High' as const,
    icon: Zap,
  },
  {
    id: 3,
    title: 'Yield Hopper',
    description: 'Our system automatically moves your funds to wherever the best returns are — always chasing the top opportunities.',
    apy: '30–60%',
    risk: 'Aggressive' as const,
    icon: TrendingUp,
  },
  {
    id: 4,
    title: 'Balanced Earner',
    description: 'Earns from market movement while keeping your position balanced. Good returns with controlled risk.',
    apy: '15–25%',
    risk: 'Medium' as const,
    icon: Scale,
  },
  {
    id: 5,
    title: 'Multi-Chain',
    description: 'Your TON works across multiple blockchains for maximum earning potential. Highest returns, but more volatile.',
    apy: '40–80%',
    risk: 'Aggressive' as const,
    icon: Globe,
  },
  {
    id: 6,
    title: 'Smart DCA',
    description: 'Automatically converts your daily earnings into promising tokens. A hands-off way to build a diversified portfolio.',
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
            Easy Mode
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
          {isAdvanced ? 'Self-Manage Your Tokens' : 'How Do You Want to Earn?'}
        </h2>
        <p className="intent-desc">
          {isAdvanced
            ? 'Get your nTON tokens directly and manage them yourself in the TON ecosystem.'
            : 'Pick an earning style that matches your comfort level. Change anytime.'}
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
            <h3 className="intent-advanced-title">Self-Managed Mode</h3>
            <p className="intent-advanced-desc">
              Deposit your TON and receive nTON tokens you can use anywhere in the TON ecosystem.
              Full control stays with you.
            </p>
            <button className="intent-advanced-btn">Get nTON Tokens</button>
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
              alert(`Ready to earn! Connect your wallet and deposit at least 3 TON to get started.`);
            }}
          >
            START EARNING
          </button>
          <p className="intent-footer-min">Minimum 3 TON to start</p>
        </div>
      )}
    </div>
  );
};
