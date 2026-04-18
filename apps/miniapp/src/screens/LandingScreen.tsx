import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Coins, Languages, ShieldCheck, Zap } from "lucide-react";
import { APP_TAGLINE } from "@neuro/shared";
import { useAppStore } from "../store/appStore";

export function LandingScreen() {
  const navigate = useNavigate();
  const isTestnet = useAppStore((state) => state.isTestnet);

  return (
    <section className="page-stack center-stack" style={{ justifyContent: "center", minHeight: "75vh" }}>
      
      {/* Floating Hero Icons */}
      <div style={{ position: "relative", width: "100%", maxWidth: "300px", height: "140px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
        <motion.div
           animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
           transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
           style={{ position: "absolute", left: "10%", top: "10%", color: "var(--accent)", padding: "12px", background: "rgba(143, 115, 255, 0.1)", borderRadius: "50%" }}
        >
          <Bot size={32} />
        </motion.div>
        
        <motion.div
           animate={{ y: [0, 15, 0], scale: [1, 1.1, 1] }}
           transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
           style={{ position: "absolute", zIndex: 10, color: "var(--accent-2)", padding: "16px", background: "rgba(38, 211, 199, 0.1)", borderRadius: "22px", boxShadow: "var(--shadow)" }}
           className="brand-mark"
        >
          <Coins size={48} />
        </motion.div>

        <motion.div
           animate={{ y: [0, -12, 0], rotate: [0, -10, 10, 0] }}
           transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}
           style={{ position: "absolute", right: "10%", top: "20%", color: "var(--success)", padding: "12px", background: "rgba(58, 210, 136, 0.1)", borderRadius: "50%" }}
        >
          <ShieldCheck size={32} />
        </motion.div>
      </div>

      <div className="center-stack stack-sm" style={{ marginBottom: "24px" }}>
        <h1 className="headline-sm">
          {APP_TAGLINE}
        </h1>
        <p className="lead-copy">Simple, automated income plans for your TON.</p>
      </div>

      <div className="stack-sm" style={{ width: "100%", maxWidth: "300px" }}>
        <button 
          type="button" 
          className="button button-primary"
          style={{ width: "100%", padding: "16px", fontSize: "1.05rem" }}
          onClick={() => navigate("/plans")}
        >
          <Zap size={20} />
          Start Earning
        </button>

        {isTestnet && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card quote-warning center-stack stack-sm"
            style={{ padding: "16px", border: "1px solid var(--warning)", background: "rgba(246, 196, 107, 0.1)" }}
          >
            <p style={{ color: "var(--warning)", fontWeight: 700, margin: 0, fontSize: "0.9rem" }}>TESTNET IS ACTIVE</p>
            <p className="muted" style={{ fontSize: "0.85rem" }}>You need Testnet TON to try NEURO safely without real funds.</p>
            <a 
              href="https://t.me/testgiver_ton_bot" 
              target="_blank" 
              rel="noreferrer"
              className="button button-secondary"
              style={{ padding: "8px 16px", fontSize: "0.85rem", marginTop: "4px" }}
            >
              Claim Testnet TON
            </a>
          </motion.div>
        )}
      </div>

      <div style={{ display: "flex", width: "100%", maxWidth: "300px", justifyContent: "space-between", alignItems: "center", marginTop: "32px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-soft)", fontSize: "0.85rem", cursor: "pointer" }}>
          <Languages size={16} />
          <span>English</span>
        </div>
        
        <Link to="/onboarding" style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 600 }}>
          New to TON?
        </Link>
      </div>
    </section>
  );
}
