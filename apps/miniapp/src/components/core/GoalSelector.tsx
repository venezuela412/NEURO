import type { Goal } from "@neuro/shared";
import { Shield, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";

interface GoalSelectorProps {
  value: Goal;
  onChange: (goal: Goal) => void;
}

const GOALS: Array<{
  id: Goal;
  label: string;
  caption: string;
  icon: typeof Shield;
}> = [
  {
    id: "protect",
    label: "Protect",
    caption: "Keep things calmer while your TON still works.",
    icon: Shield,
  },
  {
    id: "earn",
    label: "Earn",
    caption: "Balance safety and stronger passive income.",
    icon: Sparkles,
  },
  {
    id: "grow",
    label: "Grow",
    caption: "Accept more movement for a stronger upside path.",
    icon: TrendingUp,
  },
];

export function GoalSelector({ value, onChange }: GoalSelectorProps) {
  return (
    <div className="field-stack">
      <div className="field-header">
        <span className="field-label">Choose your goal</span>
        <span className="field-hint">One tap. NEURO handles the hard part.</span>
      </div>

      <div className="goal-grid">
        {GOALS.map((goal) => {
          const Icon = goal.icon;
          const active = goal.id === value;

          return (
            <button
              key={goal.id}
              type="button"
              className={cn("goal-card", active && "goal-card-active")}
              onClick={() => onChange(goal.id)}
            >
              <div className="goal-card-top">
                <span className="goal-icon">
                  <Icon size={18} />
                </span>
                <span className="goal-label">{goal.label}</span>
              </div>
              <p className="goal-caption">{goal.caption}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
