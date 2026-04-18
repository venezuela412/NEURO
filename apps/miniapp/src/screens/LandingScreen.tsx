import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Coins, Languages, ShieldCheck, Zap } from "lucide-react";
import { APP_TAGLINE } from "@neuro/shared";
import { useAppStore } from "../store/appStore";

export function LandingScreen() {
  const navigate = useNavigate();
  const isTestnet = useAppStore((state) => state.isTestnet);

  return (
    <section className="landing-enhanced flex flex-col items-center justify-center min-h-[70vh] px-4 space-y-8" aria-labelledby="landing-title">
      
      {/* Floating Hero Icons */}
      <div className="relative w-full max-w-xs h-32 flex items-center justify-center mb-4">
        <motion.div
           animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
           transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
           className="absolute left-[10%] top-[10%] text-accent p-3 bg-accent/10 rounded-full"
        >
          <Bot size={32} />
        </motion.div>
        
        <motion.div
           animate={{ y: [0, 15, 0], scale: [1, 1.1, 1] }}
           transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
           className="absolute z-10 text-brand p-4 bg-brand/10 rounded-2xl shadow-xl"
        >
          <Coins size={48} />
        </motion.div>

        <motion.div
           animate={{ y: [0, -12, 0], rotate: [0, -10, 10, 0] }}
           transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}
           className="absolute right-[10%] top-[20%] text-green-500 p-3 bg-green-500/10 rounded-full"
        >
          <ShieldCheck size={32} />
        </motion.div>
      </div>

      <div className="text-center space-y-3">
        <h1 id="landing-title" className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
          {APP_TAGLINE}
        </h1>
        <p className="text-gray-400 text-base">Simple, automated income plans for your TON.</p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <button 
          type="button" 
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-accent text-white font-semibold text-lg shadow-lg hover:bg-accent/90 transition-colors" 
          onClick={() => navigate("/plans")}
        >
          <Zap size={20} />
          Start Earning
        </button>

        {isTestnet && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"
          >
            <p className="text-sm text-amber-500 font-medium mb-2">Testnet is Active</p>
            <p className="text-xs text-gray-400 mb-3">You need Testnet TON to try NEURO safely without real funds.</p>
            <a 
              href="https://t.me/testgiver_ton_bot" 
              target="_blank" 
              rel="noreferrer"
              className="inline-block px-4 py-2 bg-amber-500 text-black font-semibold text-sm rounded-lg hover:bg-amber-400 transition-colors"
            >
              Claim Testnet TON
            </a>
          </motion.div>
        )}
      </div>

      <div className="flex w-full max-w-xs justify-between items-center px-2 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer hover:text-white transition-colors">
          <Languages size={16} />
          <span>English</span>
        </div>
        
        <Link to="/onboarding" className="text-accent text-sm font-medium hover:underline">
          New to TON?
        </Link>
      </div>
    </section>
  );
}
