import React, { useState } from 'react';
import { Shield, Zap, TrendingUp, Scale, Globe, CloudRain } from 'lucide-react';
import { StrategyCard } from './StrategyCard';

const STRATEGIES = [
  {
    id: 1,
    title: 'Zen Staking',
    description: 'Safe liquid staking in TON via Tonstakers. Zero impermanent loss, pure native APY over time.',
    apy: '7% - 19%',
    risk: 'Low' as const,
    icon: Shield,
  },
  {
    id: 2,
    title: 'Apalancamiento Degen',
    description: 'Autonomous loan loops on EVAA Protocol. Multiplied APY by leveraging staked nTON positions.',
    apy: '25% - 40%',
    risk: 'High' as const,
    icon: Zap,
  },
  {
    id: 3,
    title: 'Farming Alta Frecuencia',
    description: 'Agent hops between DeDust & STON.fi liquidity pools tracking the highest yield pairs automatically.',
    apy: '30% - 60%',
    risk: 'Aggressive' as const,
    icon: TrendingUp,
  },
  {
    id: 4,
    title: 'Escudo Delta-Neutral',
    description: 'Arbitrage between USDT/TON while hedging exposure. Minimizes crypto market volatility effects.',
    apy: '15% - 25%',
    risk: 'Medium' as const,
    icon: Scale,
  },
  {
    id: 5,
    title: 'Puerta Estelar (Omni-Chain)',
    description: 'Solvers mirror your capital to Solana & BSC high-yield systems. Rewards are paid back directly in TON.',
    apy: '40% - 80%',
    risk: 'Aggressive' as const,
    icon: Globe,
  },
  {
    id: 6,
    title: 'Modo Lluvia DCA',
    description: 'Agent converts daily TON staking yields into high-momentum tokens like $NOT or USDT automatically.',
    apy: '10% - 15%',
    risk: 'Medium' as const,
    icon: CloudRain,
  }
];

export const IntentMenu: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [isAdvanced, setIsAdvanced] = useState<boolean>(false);

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      
      {/* Dual Mode Toggle */}
      <div className="flex justify-center mb-10 md:mb-14">
        <div className="bg-white/5 p-1.5 md:p-2 rounded-full inline-flex backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
          <button 
            onClick={() => setIsAdvanced(false)}
            className={`px-6 md:px-8 py-2 md:py-3 rounded-full font-bold tracking-wide transition-all duration-300 text-sm md:text-base ${!isAdvanced ? 'bg-neon-teal text-black shadow-[0_0_20px_rgba(38,211,199,0.4)] scale-105' : 'text-gray-400 hover:text-white'}`}
          >
            Modo Conserje (1-Click)
          </button>
          <button 
            onClick={() => setIsAdvanced(true)}
            className={`px-6 md:px-8 py-2 md:py-3 rounded-full font-bold tracking-wide transition-all duration-300 text-sm md:text-base ${isAdvanced ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105' : 'text-gray-400 hover:text-white'}`}
          >
            Modo Avanzado (nTON)
          </button>
        </div>
      </div>

      <div className="text-center mb-12 md:mb-16 px-4">
        <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4 md:mb-6 tracking-tight">
          {isAdvanced ? 'Direct nTON Custody' : 'Choose Your Intent'}
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-xl font-medium leading-relaxed">
          {isAdvanced 
            ? 'Receive nTON liquid tokens and manage your own DeFi integrations independently.'
            : 'Select an autonomous mission. Our AI solvers will route your TON mathematically to outperform the market.'
          }
        </p>
      </div>

      {!isAdvanced ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {STRATEGIES.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              {...strategy}
              selected={selectedId === strategy.id}
              onSelect={() => setSelectedId(strategy.id)}
            />
          ))}
        </div>
      ) : (
        <div className="p-10 md:p-14 border border-purple-500/30 bg-purple-500/10 rounded-3xl text-center mx-4 md:mx-0 shadow-2xl">
          <Shield className="w-20 h-20 text-purple-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
          <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Advanced Self-Custody</h3>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
            Deposit TON directly into the NeuroVault Smart Contract and receive your nTON LSTs. Use them anywhere in the TON Ecosystem and burn them when you want to exit.
          </p>
          <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-10 rounded-full transition-all text-lg tracking-wide hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transform hover:-translate-y-1">
            Mint nTON Directly
          </button>
        </div>
      )}

      {/* Execution Action Footer */}
      {!isAdvanced && (
        <div className="mt-16 text-center bg-white/5 border border-white/10 p-8 md:p-10 rounded-3xl backdrop-blur-md mx-4 md:mx-0 shadow-2xl">
          <p className="text-gray-400 mb-6 text-lg">You selected: <strong className="text-white text-xl tracking-wide">{STRATEGIES.find(s => s.id === selectedId)?.title}</strong></p>
          <button 
            onClick={async () => {
              try {
                // In a production app, the tonConnectUI hook from @tonconnect/ui-react would be imported at the top
                // and used to dispatch the transaction with the Zapper Intent Body.
                console.log(`Dispatching 3 TON transaction to Vault for Intent [${selectedId}]...`);
                // Example payload: { address: 'EQ_VAULT', amount: '3000000000', payload: `Deposit Intent ${selectedId}` }
                alert(`Transaction initiated! Check Tonkeeper to deposit 3 TON into NeuroVault.`);
              } catch (e) {
                console.error(e);
              }
            }}
            className="w-full md:w-auto bg-gradient-to-r from-neon-teal to-blue-500 hover:from-neon-teal/80 hover:to-blue-500/80 text-black font-black py-5 px-14 rounded-full text-lg tracking-[0.1em] shadow-[0_0_30px_rgba(33,222,204,0.3)] hover:shadow-[0_0_50px_rgba(33,222,204,0.6)] transition-all transform hover:-translate-y-1"
          >
            DEPLOY VAULT AGENT
          </button>
          <p className="text-xs text-gray-500 mt-4 tracking-widest uppercase font-bold">Minimum 3 TON Deposit</p>
        </div>
      )}

    </div>
  );
};
