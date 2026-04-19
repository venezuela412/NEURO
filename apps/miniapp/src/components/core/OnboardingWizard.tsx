import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Sparkles, ShieldCheck, Coins, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useNeuroWallet } from '../../hooks/useTonWallet';

const SLIDES = [
  {
    id: 'lang',
    title: "NeuroTON",
    subtitle: "Choose your language",
    description: "",
    icon: Languages,
    color: "rgba(255,255,255,0.15)",
    isLangSelect: true,
  },
  {
    id: 'intro',
    title: "Earn While You Sleep",
    subtitle: "Your money works for you",
    description: "NeuroTON is the easiest way to grow your TON. Just deposit, pick a goal, and our smart system handles everything automatically — no expertise needed.",
    icon: Sparkles,
    color: "rgba(38,211,199,0.2)",
  },
  {
    id: 'security',
    title: "Your Funds Are Safe",
    subtitle: "Protected by code, not people",
    description: "Your TON is locked in a Smart Contract on the blockchain. Nobody — not even us — can withdraw your funds. Only you control your money.",
    icon: ShieldCheck,
    color: "rgba(143,115,255,0.2)",
  },
  {
    id: 'earn',
    title: "Pick Your Style",
    subtitle: "From safe to adventurous",
    description: "Choose how you want to earn. Start safe with staking for steady returns, or go bolder with higher potential rewards. Change anytime.",
    icon: Coins,
    color: "rgba(251,146,60,0.2)",
  },
  {
    id: 'wallet',
    title: "Connect Your Wallet",
    subtitle: "One tap to get started",
    description: "Link your TON wallet to start earning. Your wallet stays in your control — we only need permission to show your balance and send transactions you approve.",
    icon: Wallet,
    color: "rgba(59,130,246,0.2)",
    isWalletConnect: true,
  },
];

export const OnboardingWizard: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lang, setLang] = useState<'EN' | 'ES'>('EN');
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const wallet = useNeuroWallet();

  // Skip if already completed
  React.useEffect(() => {
    if (localStorage.getItem('neuro_onboarding_complete') === 'true') {
      navigate('/plans', { replace: true });
    }
  }, [navigate]);

  const haptic = (type: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
    try {
      const hf = (window as any).Telegram?.WebApp?.HapticFeedback;
      if (type === 'success') {
        hf?.notificationOccurred?.("success");
      } else {
        hf?.impactOccurred?.(type);
      }
    } catch (_) { /* noop */ }
  };

  const handleNext = () => {
    if (currentSlide === SLIDES.length - 1) {
      localStorage.setItem('neuro_onboarding_complete', 'true');
      haptic('success');
      navigate('/plans', { replace: true });
    } else {
      haptic('light');
      setDirection(1);
      setCurrentSlide(s => s + 1);
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      haptic('light');
      setDirection(-1);
      setCurrentSlide(s => s - 1);
    }
  };

  const current = SLIDES[currentSlide];
  const Icon = current.icon;
  const isLastSlide = currentSlide === SLIDES.length - 1;

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 80 : -80, scale: 0.95 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -80 : 80, scale: 0.95 }),
  };

  return (
    <div className="onboarding-root">
      {/* Ambient background */}
      <div className="onboarding-bg" />

      {/* Breathing ambient orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="onboarding-orb onboarding-orb--top"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="onboarding-orb onboarding-orb--bottom"
      />

      {/* Skip button (top-right) */}
      {!isLastSlide && (
        <button
          className="onboarding-skip"
          onClick={() => {
            haptic('light');
            setDirection(1);
            setCurrentSlide(SLIDES.length - 1);
          }}
        >
          Skip
        </button>
      )}

      {/* Slide content */}
      <div className="onboarding-content">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="onboarding-slide"
          >
            {/* Icon orb */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.1, stiffness: 180 }}
              className="onboarding-icon-orb"
              style={{ boxShadow: `0 0 40px ${current.color}` }}
            >
              <Icon className="onboarding-icon" strokeWidth={1.5} />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="onboarding-title"
            >
              {current.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="onboarding-subtitle"
            >
              {current.subtitle}
            </motion.p>

            {/* Language selector on slide 0 */}
            {current.isLangSelect && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, type: "spring" }}
                className="onboarding-lang-row"
              >
                <button
                  onClick={() => { setLang('EN'); try { (window as any).Telegram?.WebApp?.HapticFeedback?.selectionChanged?.(); } catch(_){} }}
                  className={`onboarding-lang-btn ${lang === 'EN' ? 'onboarding-lang-btn--active-teal' : ''}`}
                >
                  <span className="onboarding-lang-flag">🇺🇸</span>
                  <span className="onboarding-lang-label">English</span>
                </button>
                <button
                  onClick={() => { setLang('ES'); try { (window as any).Telegram?.WebApp?.HapticFeedback?.selectionChanged?.(); } catch(_){} }}
                  className={`onboarding-lang-btn ${lang === 'ES' ? 'onboarding-lang-btn--active-accent' : ''}`}
                >
                  <span className="onboarding-lang-flag">🇪🇸</span>
                  <span className="onboarding-lang-label">Español</span>
                </button>
              </motion.div>
            )}

            {/* Wallet connect on last slide */}
            {current.isWalletConnect && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, type: "spring" }}
                className="onboarding-wallet-section"
              >
                <TonConnectButton className="onboarding-wallet-btn" />
                {wallet.connected && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="onboarding-wallet-status"
                  >
                    ✓ Wallet connected successfully!
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Description */}
            {current.description && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="onboarding-desc"
              >
                {current.description}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls: back + dots + CTA */}
      <div className="onboarding-footer">
        <div className="onboarding-dots">
          {SLIDES.map((_, idx) => (
            <div
              key={idx}
              className={`onboarding-dot ${idx === currentSlide ? 'onboarding-dot--active' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding-footer-buttons">
          {currentSlide > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleBack}
              className="onboarding-back"
            >
              Back
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleNext}
            className="onboarding-cta"
          >
            <span className="onboarding-cta-inner">
              {isLastSlide
                ? (wallet.connected ? "LET'S EARN →" : "SKIP FOR NOW →")
                : "CONTINUE"}
              {!isLastSlide && (
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="onboarding-cta-arrow"
                >
                  →
                </motion.span>
              )}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
