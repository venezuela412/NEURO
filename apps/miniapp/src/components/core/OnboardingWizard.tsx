import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Database, Zap, ShieldCheck, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    title: "NeuroTON",
    subtitle: "Select your Reality",
    description: "",
    icon: Languages,
    neonColor: "shadow-white/20",
    isLangSelect: true
  },
  {
    title: "The Vanguard of TON",
    subtitle: "Autonomous Intelligence",
    description: "Welcome to the first Omni-Chain Intent Vault on The Open Network. Elite AI manages your yield so you don't have to.",
    icon: Network,
    neonColor: "shadow-blue-500/50"
  },
  {
    title: "Zero-Trust Security",
    subtitle: "Mathematically Bound",
    description: "Your capital is secured by Smart Contracts. The Vercel execution agent is strictly limited to compound logic without bridging withdrawal power.",
    icon: ShieldCheck,
    neonColor: "shadow-purple-500/50"
  },
  {
    title: "nTON Liquidity",
    subtitle: "The Ultimate Standard",
    description: "Receive the Liquid Staking Token (nTON) mirroring your Vault share. Natively composable with EVAA and STON.fi ecosystems.",
    icon: Database,
    neonColor: "shadow-neon-teal/50"
  },
  {
    title: "Market Neutral Execution",
    subtitle: "Autonomous Intents",
    description: "Select your risk trajectory. Our solvers automatically track, loop, and harvest maximum yield across DeDust and external chains.",
    icon: Zap,
    neonColor: "shadow-orange-500/50"
  }
];

export const OnboardingWizard: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lang, setLang] = useState<'EN'|'ES'>('EN');
  const navigate = useNavigate();

  // On mount, skip onboarding if they already completed it
  React.useEffect(() => {
    if (localStorage.getItem('neuro_onboarding_complete') === 'true') {
      navigate('/plans', { replace: true });
    }
  }, [navigate]);

  const handleNext = () => {
    if (currentSlide === SLIDES.length - 1) {
      localStorage.setItem('neuro_onboarding_complete', 'true');
      navigate('/plans', { replace: true });
    } else {
      setCurrentSlide(s => s + 1);
    }
  };

  const current = SLIDES[currentSlide];
  const Icon = current.icon;

  return (
    <div className="w-full h-full min-h-[100svh] relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#090b13] via-[#111422] to-[#090b13] opacity-90 z-0"></div>
      
      {/* Dynamic ambient blur orbs */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[400px] h-[400px] bg-accent/20 blur-[90px] rounded-full top-[-100px] left-[-150px] z-0 pointer-events-none mix-blend-screen" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute w-[350px] h-[350px] bg-accent-2/20 blur-[100px] rounded-full bottom-[-100px] right-[-100px] z-0 pointer-events-none mix-blend-screen" 
      />
      
      <div className="relative z-10 w-full px-5 py-6 flex flex-col items-center">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 200, damping: 20, mass: 1 }}
            className="flex flex-col items-center text-center w-full"
          >
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150, delay: 0.1 }}
              className={`p-6 mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl ${current.neonColor}`}
            >
              <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight"
            >
              {current.title}
            </motion.h1>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs font-bold uppercase tracking-[0.25em] text-accent-2 mb-8 opacity-90"
            >
              {current.subtitle}
            </motion.h2>
            
            {current.isLangSelect ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="flex gap-4 w-full justify-center mb-10"
              >
                <button 
                  onClick={() => setLang('EN')}
                  className={`flex flex-col items-center justify-center p-5 rounded-3xl w-[110px] border transition-all duration-300 ${lang === 'EN' ? 'border-accent-2 bg-accent-2/10 shadow-[0_0_30px_rgba(38,211,199,0.3)] scale-105' : 'border-white/10 bg-white/5 opacity-60 hover:opacity-100'}`}
                >
                  <span className="text-3xl mb-3 drop-shadow-md">🇺🇸</span>
                  <span className={`font-black tracking-widest text-sm ${lang === 'EN' ? 'text-accent-2' : 'text-gray-400'}`}>EN</span>
                </button>
                <button 
                  onClick={() => setLang('ES')}
                  className={`flex flex-col items-center justify-center p-5 rounded-3xl w-[110px] border transition-all duration-300 ${lang === 'ES' ? 'border-accent bg-accent/10 shadow-[0_0_30px_rgba(143,115,255,0.3)] scale-105' : 'border-white/10 bg-white/5 opacity-60 hover:opacity-100'}`}
                >
                  <span className="text-3xl mb-3 drop-shadow-md">🇪🇸</span>
                  <span className={`font-black tracking-widest text-sm ${lang === 'ES' ? 'text-accent' : 'text-gray-400'}`}>ES</span>
                </button>
              </motion.div>
            ) : null}

            {current.description && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 leading-relaxed text-[15px] px-2 font-medium max-w-[300px]"
              >
                {current.description}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation & Dots */}
        <div className="mt-12 w-full flex flex-col items-center gap-8">
          <div className="flex gap-3">
            {SLIDES.map((_, idx) => (
              <div 
                key={idx} 
                className={`transition-all duration-500 rounded-full ${
                  idx === currentSlide 
                    ? "w-8 h-1.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" 
                    : "w-1.5 h-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="w-full relative group overflow-hidden rounded-full p-[1px] max-w-[280px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-black rounded-full px-6 py-4 font-bold text-white tracking-[0.1em] text-[13px] flex items-center justify-center gap-2 transition-all">
              {currentSlide === SLIDES.length - 1 ? 'INITIALIZE PROTOCOL' : 'CONTINUE'}
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                &rarr;
              </motion.span>
            </div>
          </motion.button>
        </div>

      </div>
    </div>
  );
};
