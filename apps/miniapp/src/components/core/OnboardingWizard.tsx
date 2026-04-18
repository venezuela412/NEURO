import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Database, Zap, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    title: "NeuroTON Protocol",
    subtitle: "The Vanguard of TON DeFi",
    description: "Welcome to the first autonomous Omni-Chain Intent Vault on The Open Network. Advanced algorithms manage your yield so you don't have to.",
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
    description: "Receive the Liquid Staking Token (nTON) mirroring your Vault share. Composable natively with EVAA and STON.fi ecosystems.",
    icon: Database,
    neonColor: "shadow-neon-teal/50"
  },
  {
    title: "Autonomous Intents",
    subtitle: "Market Neutral Execution",
    description: "Select your risk trajectory. Our solvers automatically track, loop, and harvest maximum yield across DeDust and external chains.",
    icon: Zap,
    neonColor: "shadow-orange-500/50"
  }
];

export const OnboardingWizard: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide === SLIDES.length - 1) {
      // Setup complete flag can be saved to localStorage
      localStorage.setItem('neuro_onboarding_complete', 'true');
      navigate('/plans');
    } else {
      setCurrentSlide(s => s + 1);
    }
  };

  const Icon = SLIDES[currentSlide].icon;

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
            <div className={`p-6 mb-8 rounded-full border border-white/10 bg-surface backdrop-blur-md shadow-2xl ${SLIDES[currentSlide].neonColor}`}>
              <Icon className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>

            <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              {SLIDES[currentSlide].title}
            </h1>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-accent-2 mb-6">
              {SLIDES[currentSlide].subtitle}
            </h2>
            
            <p className="text-gray-400 leading-relaxed text-lg px-2">
              {SLIDES[currentSlide].description}
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
