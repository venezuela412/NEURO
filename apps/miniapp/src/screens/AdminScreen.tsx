import React, { useEffect, useState } from "react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { Sparkles, ShieldCheck, Activity } from "lucide-react";
import { motion } from "framer-motion";

export function AdminScreen() {
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [vaultData, setVaultData] = useState<any>(null);

  useEffect(() => {
    // In a real production environment, we verify this against the Backend
    // which in turn verifies the Vault's "get_owner()" TVM getter.
    if (address) {
      setIsOwner(true); // Temporarily true for UI preview
      setVaultData({
        tvl: "1,450.25 TON",
        activeUsers: 84,
        totalHarvested: "320.10 TON",
        performanceFeeAccrued: "64.02 TON",
      });
    }
  }, [address]);

  const handleManualHarvest = async () => {
    alert("Triggering Manual Harvest against the Control Plane...");
    // Future integration to send an owner-signed TX to the Control Plane
  };

  if (!address) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-16 h-16 text-neutral-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
        <p className="text-neutral-400 mb-6">Please connect your Owner Wallet to access the Control Plane Dashboard.</p>
        <button
          onClick={() => tonConnectUI.openModal()}
          className="bg-accent text-black font-semibold px-6 py-3 rounded-full hover:bg-accent/90 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Unauthorized</h2>
        <p className="text-neutral-400">Your connected wallet is not the recognized Owner of the NeuroVault.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24 relative">
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "150%", height: "100%", background: "radial-gradient(circle at top, rgba(143, 115, 255, 0.15) 0%, transparent 60%)", filter: "blur(60px)", zIndex: -1, pointerEvents: "none" }} />
      
      <div className="relative pt-12 pb-6 px-4 border-b border-white/5 flex flex-col items-center">
        <motion.img
           src="/assets/logo.png"
           alt="NeuroTON Logo"
           animate={{ y: [0, -4, 0], scale: [1, 1.01, 1], filter: ["drop-shadow(0px 0px 8px rgba(143,115,255,0.4))", "drop-shadow(0px 0px 15px rgba(143,115,255,0.7))", "drop-shadow(0px 0px 8px rgba(143,115,255,0.4))"] }}
           transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
           style={{ zIndex: 10, width: "64px", height: "64px", objectFit: "contain", borderRadius: "50%", marginBottom: "16px" }}
        />
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-2 text-center mb-2 tracking-tight">NeuroTON</h1>
        <p className="text-center text-accent font-medium text-sm flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Owner Authenticated
        </p>
      </div>

      <div className="p-4 space-y-4">
        {vaultData && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
              <p className="text-xs text-neutral-400 mb-1">Total Value Locked</p>
              <p className="text-xl font-bold text-white">{vaultData.tvl}</p>
            </div>
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
              <p className="text-xs text-neutral-400 mb-1">Active Users</p>
              <p className="text-xl font-bold text-white">{vaultData.activeUsers}</p>
            </div>
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
              <p className="text-xs text-neutral-400 mb-1">Total Yield</p>
              <p className="text-xl font-bold text-green-400">{vaultData.totalHarvested}</p>
            </div>
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
              <p className="text-xs text-neutral-400 mb-1">Your Protocol Fees</p>
              <p className="text-xl font-bold text-accent">{vaultData.performanceFeeAccrued}</p>
            </div>
          </div>
        )}

        <div className="bg-black/40 border border-white/5 p-5 rounded-2xl mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Auto-Compounding</h3>
              <p className="text-sm text-neutral-400">pg-boss Queue Engine</p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs font-semibold px-2 py-1 bg-green-500/20 text-green-400 rounded-md">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Active
            </div>
          </div>
          
          <p className="text-sm text-neutral-400 mb-5">
            The Operator backend automatically executes the Harvest cycle strictly via <b>ExecDelegate</b>. 
            You can manually force a cycle via Owner rights.
          </p>

          <button
            onClick={handleManualHarvest}
            className="w-full relative overflow-hidden bg-accent/10 border border-accent/20 text-accent font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-accent/20 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5" />
            Force Immediate Harvest
          </button>
        </div>
      </div>
    </div>
  );
}
