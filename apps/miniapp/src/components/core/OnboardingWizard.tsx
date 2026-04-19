import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Database, Zap, ShieldCheck, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    title: "NeuroTON",
    subtitle: "Select your language",
    description: "",
    icon: Languages,
    color: "rgba(255,255,255,0.15)",
    isLangSelect: true
  },
  {
    title: "The Vanguard of TON",
    subtitle: "Autonomous Intelligence",
    description: "Welcome to the first Omni-Chain Intent Vault on The Open Network. Elite AI manages your yield so you don't have to.",
    icon: Network,
    color: "rgba(59,130,246,0.2)"
  },
  {
    title: "Zero-Trust Security",
    subtitle: "Mathematically Bound",
    description: "Your capital is secured by Smart Contracts. The execution agent is strictly limited to compound logic without withdrawal power.",
    icon: ShieldCheck,
    color: "rgba(143,115,255,0.2)"
  },
  {
    title: "nTON Liquidity",
    subtitle: "The Ultimate Standard",
    description: "Receive the Liquid Staking Token (nTON) mirroring your Vault share. Natively composable with EVAA and STON.fi ecosystems.",
    icon: Database,
    color: "rgba(38,211,199,0.2)"
  },
  {
    title: "Market Neutral",
    subtitle: "Autonomous Intents",
    description: "Select your risk trajectory. Our solvers automatically track, loop, and harvest maximum yield across DeDust and external chains.",
    icon: Zap,
    color: "rgba(251,146,60,0.2)"
  }
];

export const OnboardingWizard: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lang, setLang] = useState<'EN' | 'ES'>('EN');
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  // Skip if already completed
  React.useEffect(() => {
    if (localStorage.getItem('neuro_onboarding_complete') === 'true') {
      navigate('/plans', { replace: true });
    }
  }, [navigate]);

  const handleNext = () => {
    if (currentSlide === SLIDES.length - 1) {
      localStorage.setItem('neuro_onboarding_complete', 'true');
      // Trigger haptic
      try {
        (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
      } catch (_) { /* noop */ }
      navigate('/plans', { replace: true });
    } else {
      try {
        (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
      } catch (_) { /* noop */ }
      setDirection(1);
      setCurrentSlide(s => s + 1);
    }
  };

  const current = SLIDES[currentSlide];
  const Icon = current.icon;

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60, scale: 0.96 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60, scale: 0.96 }),
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
                  <span className="onboarding-lang-label">EN</span>
                </button>
                <button
                  onClick={() => { setLang('ES'); try { (window as any).Telegram?.WebApp?.HapticFeedback?.selectionChanged?.(); } catch(_){} }}
                  className={`onboarding-lang-btn ${lang === 'ES' ? 'onboarding-lang-btn--active-accent' : ''}`}
                >
                  <span className="onboarding-lang-flag">🇪🇸</span>
                  <span className="onboarding-lang-label">ES</span>
                </button>
              </motion.div>
            )}

            {/* Description on non-lang slides */}
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

      {/* Bottom controls: dots + CTA */}
      <div className="onboarding-footer">
        <div className="onboarding-dots">
          {SLIDES.map((_, idx) => (
            <div
              key={idx}
              className={`onboarding-dot ${idx === currentSlide ? 'onboarding-dot--active' : ''}`}
            />
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleNext}
          className="onboarding-cta"
        >
          <span className="onboarding-cta-inner">
            {currentSlide === SLIDES.length - 1 ? 'GET STARTED' : 'CONTINUE'}
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="onboarding-cta-arrow"
            >
              →
            </motion.span>
          </span>
        </motion.button>
      </div>
    </div>
  );
};
