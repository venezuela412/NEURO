import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Coins, Languages, ShieldCheck, Zap } from "lucide-react";
import { APP_TAGLINE } from "@neuro/shared";
import { useAppStore } from "../store/appStore";

export function LandingScreen() {
  const navigate = useNavigate();
  const isTestnet = useAppStore((state) => state.isTestnet);
  
  // Safe init for haptics using native Telegram WebApp object
  const getHaptic = () => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.HapticFeedback) {
      return (window as any).Telegram.WebApp.HapticFeedback;
    }
    return null;
  };

  const handleStart = () => {
    const haptic = getHaptic();
    if (haptic && haptic.impactOccurred) {
      try { haptic.impactOccurred("heavy"); } catch (e) {}
    }
    navigate("/plans");
  };

  return (
    <section className="page-stack center-stack" style={{ justifyContent: "center", minHeight: "85vh", position: "relative", overflow: "hidden" }}>
      
      {/* Dynamic Background Glow */}
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "150%", height: "150%", background: "radial-gradient(circle at center, rgba(38, 211, 199, 0.15) 0%, rgba(143, 115, 255, 0.05) 50%, transparent 100%)", filter: "blur(60px)", zIndex: -1, pointerEvents: "none" }} />

      {/* Floating Animated Logo (Orb) */}
      <div style={{ position: "relative", width: "100%", maxWidth: "300px", height: "180px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
        
        {/* Abstract orbits rotating behind the logo */}
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
           style={{ position: "absolute", width: "120px", height: "120px", border: "1px solid rgba(38,211,199,0.3)", borderRadius: "50%", zIndex: 1 }}
        />
        <motion.div
           animate={{ rotate: -360 }}
           transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
           style={{ position: "absolute", width: "160px", height: "160px", border: "1px dashed rgba(143,115,255,0.4)", borderRadius: "50%", zIndex: 1 }}
        />

        <motion.img
           src="/assets/logo.png"
           alt="NeuroTON Logo"
           animate={{ y: [0, -8, 0], scale: [1, 1.02, 1], filter: ["drop-shadow(0px 0px 10px rgba(38,211,199,0.4))", "drop-shadow(0px 0px 25px rgba(38,211,199,0.8))", "drop-shadow(0px 0px 10px rgba(38,211,199,0.4))"] }}
           transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
           style={{ zIndex: 10, width: "100px", height: "100px", objectFit: "contain", borderRadius: "50%" }}
        />
      </div>

      <div className="center-stack stack-sm" style={{ marginBottom: "32px", zIndex: 10 }}>
         {/* MEGA PREMIUM Branding */}
         <motion.h1 
            className="headline-sm" 
            style={{ fontSize: "2.8rem", fontWeight: "900", letterSpacing: "-1px", background: "linear-gradient(90deg, #26d3c7, #8f73ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
         >
          NeuroTON
         </motion.h1>
        <p className="lead-copy" style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.1rem" }}>{APP_TAGLINE}</p>
      </div>

      <div className="stack-sm" style={{ width: "100%", maxWidth: "320px", zIndex: 10 }}>
        {/* Haptic and Animated Button */}
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          type="button" 
          className="button button-primary"
          style={{ width: "100%", padding: "18px", fontSize: "1.1rem", borderRadius: "100px", boxShadow: "0 8px 30px rgba(38, 211, 199, 0.3)", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", fontWeight: "700" }}
          onClick={handleStart}
        >
          <Zap size={22} fill="currentColor" />
          Activate Vault
        </motion.button>

        {isTestnet && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card quote-warning center-stack stack-sm"
            style={{ padding: "16px", border: "1px solid var(--warning)", background: "rgba(246, 196, 107, 0.1)", borderRadius: "16px", marginTop: "16px" }}
          >
            <p style={{ color: "var(--warning)", fontWeight: 700, margin: 0, fontSize: "0.9rem" }}>TESTNET IS ACTIVE</p>
            <p className="muted" style={{ fontSize: "0.85rem", textAlign: "center" }}>You need Testnet TON to try NeuroTON safely without real funds.</p>
            <a 
              href="https://t.me/testgiver_ton_bot" 
              target="_blank" 
              rel="noreferrer"
              className="button button-secondary"
              style={{ padding: "10px 16px", fontSize: "0.9rem", marginTop: "8px", borderRadius: "100px" }}
              onClick={() => { const h = getHaptic(); if (h?.impactOccurred) { try { h.impactOccurred("light"); } catch(e){} } }}
            >
              Claim Testnet TON
            </a>
          </motion.div>
        )}
      </div>

      <div style={{ display: "flex", width: "100%", maxWidth: "320px", justifyContent: "space-between", alignItems: "center", marginTop: "40px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.08)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-soft)", fontSize: "0.9rem", cursor: "pointer", opacity: 0.8 }} onClick={() => { const h = getHaptic(); if(h?.selectionChanged) { try { h.selectionChanged(); } catch(e){} } }}>
          <Languages size={18} />
          <span>English</span>
        </div>
        
        <Link to="/onboarding" style={{ color: "var(--accent)", fontSize: "0.9rem", fontWeight: 700 }} onClick={() => { const h = getHaptic(); if(h?.impactOccurred) { try { h.impactOccurred("medium"); } catch(e){} } }}>
          New to TON?
        </Link>
      </div>
    </section>
  );
}
