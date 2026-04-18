import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StrategyCardProps {
  title: string;
  description: string;
  apy: string;
  risk: 'Low' | 'Medium' | 'High' | 'Aggressive';
  icon: LucideIcon;
  onSelect: () => void;
  selected?: boolean;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({
  title,
  description,
  apy,
  risk,
  icon: Icon,
  onSelect,
  selected = false
}) => {
  const getRiskColor = (r: string) => {
    switch(r) {
      case 'Low': return 'text-green-400 border-green-500/20 bg-green-500/10';
      case 'Medium': return 'text-blue-400 border-blue-500/20 bg-blue-500/10';
      case 'High': return 'text-orange-400 border-orange-500/20 bg-orange-500/10';
      case 'Aggressive': return 'text-red-400 border-red-500/20 bg-red-500/10';
      default: return 'text-gray-400';
    }
  };

  return (
    <div 
      onClick={onSelect}
      className={`relative p-6 md:p-8 rounded-3xl cursor-pointer transition-all duration-300 border backdrop-blur-md overflow-hidden group h-full flex flex-col justify-between
        ${selected 
          ? 'border-neon-teal/50 bg-black/60 shadow-[0_0_30px_rgba(33,222,204,0.15)] scale-[1.02]' 
          : 'border-white/5 bg-black/40 hover:border-white/20 hover:bg-black/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
        }
      `}
    >
      {selected && (
        <div className="absolute inset-0 bg-gradient-to-br from-neon-teal/10 via-transparent to-blue-500/5 pointer-events-none" />
      )}
      
      <div className="flex flex-col gap-4 relative z-10 h-full">
        <div className="flex justify-between items-start">
          <div className={`p-4 rounded-2xl ${selected ? 'bg-neon-teal/20 text-neon-teal shadow-[0_0_20px_rgba(33,222,204,0.3)]' : 'bg-white/5 text-gray-400 group-hover:text-white'}`}>
            <Icon className="w-8 h-8" />
          </div>
          <div className="text-right">
            <span className="block text-3xl font-black bg-gradient-to-r from-neon-teal to-blue-500 bg-clip-text text-transparent tracking-tight">
              {apy}
            </span>
            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Est. APY</span>
          </div>
        </div>
        
        <div className="flex-1 mt-2">
          <h3 className={`font-black tracking-wide text-xl mb-3 ${selected ? 'text-white' : 'text-gray-200'}`}>
            {title}
          </h3>
          
          <p className="text-sm md:text-base text-gray-400 mb-6 leading-relaxed line-clamp-3 font-medium">
            {description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getRiskColor(risk)}`}>
              {risk} Risk
            </span>
            
            <button 
              className={`text-sm font-medium transition-colors ${selected ? 'text-neon-teal' : 'text-gray-500 group-hover:text-white'}`}
            >
              {selected ? 'Active Strategy' : 'Select'} &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
