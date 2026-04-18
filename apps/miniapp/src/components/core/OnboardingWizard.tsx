import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Database, Zap, ShieldCheck, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    title: "NeuroTON",
    subtitle: "Select your Reality",
    description: "Choose your preferred language / Selecciona tu idioma de preferencia.",
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

  const handleNext = () => {
    if (currentSlide === SLIDES.length - 1) {
      localStorage.setItem('neuro_onboarding_complete', 'true');
      navigate('/plans');
    } else {
      setCurrentSlide(s => s + 1);
    }
  };

  const current = SLIDES[currentSlide];
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-bg relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#090b13] via-[#111422] to-[#090b13] opacity-90 z-0"></div>
      <div className="absolute w-[500px] h-[500px] bg-accent/20 blur-[100px] rounded-full top-[-100px] left-[-100px] opacity-30 z-0 pointer-events-none mix-blend-screen" />
      <div className="absolute w-[400px] h-[400px] bg-accent-2/20 blur-[100px] rounded-full bottom-[-100px] right-[-100px] opacity-30 z-0 pointer-events-none mix-blend-screen" />
      
      <div className="relative z-10 w-full max-w-md p-8 flex flex-col items-center">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center text-center w-full"
          >
            <div className={`p-6 mb-8 rounded-full border border-white/10 bg-surface backdrop-blur-md shadow-2xl ${current.neonColor}`}>
              <Icon className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>

            <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              {current.title}
            </h1>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-accent-2 mb-6">
              {current.subtitle}
            </h2>
            
            {current.isLangSelect ? (
              <div className="flex gap-4 w-full justify-center mb-8">
                <button 
                  onClick={() => setLang('EN')}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl w-32 border transition-all ${lang === 'EN' ? 'border-accent-2 bg-accent-2/10 shadow-[0_0_20px_rgba(38,211,199,0.3)]' : 'border-white/10 bg-white/5 opacity-60 hover:opacity-100 hover:border-white/20'}`}
                >
                  <span className="text-3xl mb-2">🇺🇸</span>
                  <span className={`font-bold ${lang === 'EN' ? 'text-accent-2' : 'text-gray-400'}`}>EN</span>
                </button>
                <button 
                  onClick={() => setLang('ES')}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl w-32 border transition-all ${lang === 'ES' ? 'border-accent bg-accent/10 shadow-[0_0_20px_rgba(143,115,255,0.3)]' : 'border-white/10 bg-white/5 opacity-60 hover:opacity-100 hover:border-white/20'}`}
                >
                  <span className="text-3xl mb-2">🇪🇸</span>
                  <span className={`font-bold ${lang === 'ES' ? 'text-accent' : 'text-gray-400'}`}>ES</span>
                </button>
              </div>
            ) : null}

            <p className="text-gray-400 leading-relaxed text-lg px-2">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation & Dots */}
        <div className="mt-14 w-full flex flex-col items-center gap-8">
          <div className="flex gap-3">
            {SLIDES.map((_, idx) => (
              <div 
                key={idx} 
                className={`transition-all duration-500 rounded-full ${
                  idx === currentSlide 
                    ? "w-8 h-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]" 
                    : "w-2 h-2 bg-white/20"
                }`}
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="w-full relative group overflow-hidden rounded-full p-[1px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-2 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-black rounded-full px-8 py-4 font-bold text-white tracking-wide flex items-center justify-center gap-2 transition-all group-hover:bg-opacity-80">
              {currentSlide === SLIDES.length - 1 ? 'INITIALIZE PROTOCOL' : 'CONTINUE'}
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                &rarr;
              </motion.span>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
