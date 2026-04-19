import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface StrategyCardProps {
  title: string;
  description: string;
  apy: string;
  risk: 'Low' | 'Medium' | 'High' | 'Aggressive';
  icon: LucideIcon;
  onSelect: () => void;
  selected?: boolean;
}

const RISK_STYLES: Record<string, string> = {
  Low: 'strategy-risk--low',
  Medium: 'strategy-risk--medium',
  High: 'strategy-risk--high',
  Aggressive: 'strategy-risk--aggressive',
};

export const StrategyCard: React.FC<StrategyCardProps> = ({
  title,
  description,
  apy,
  risk,
  icon: Icon,
  onSelect,
  selected = false,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`strategy-card ${selected ? 'strategy-card--selected' : ''}`}
    >
      {selected && <div className="strategy-card-glow" />}

      <div className="strategy-card-body">
        <div className="strategy-card-top">
          <div className={`strategy-card-icon ${selected ? 'strategy-card-icon--active' : ''}`}>
            <Icon size={24} />
          </div>
          <div className="strategy-card-apy">
            <span className="strategy-card-apy-value">{apy}</span>
            <span className="strategy-card-apy-label">Est. APY</span>
          </div>
        </div>

        <div className="strategy-card-info">
          <h3 className="strategy-card-title">{title}</h3>
          <p className="strategy-card-desc">{description}</p>
        </div>

        <div className="strategy-card-footer">
          <span className={`strategy-risk ${RISK_STYLES[risk]}`}>
            {risk} Risk
          </span>
          <span className={`strategy-card-action ${selected ? 'strategy-card-action--active' : ''}`}>
            {selected ? 'Selected ✓' : 'Select →'}
          </span>
        </div>
      </div>
    </button>
  );
};
