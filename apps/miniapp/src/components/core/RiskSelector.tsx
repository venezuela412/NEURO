import type { PlanRecommendationInput } from "@neuro/shared";

type RiskPreference = PlanRecommendationInput["riskPreference"];

const OPTIONS: Array<{ value: RiskPreference; label: string; description: string }> = [
  { value: "low", label: "Calm", description: "Prefer stronger protection and simpler exits." },
  { value: "medium", label: "Balanced", description: "Aim for better income without chasing every move." },
  { value: "high", label: "Growth", description: "Accept more movement for stronger upside." },
];

interface RiskSelectorProps {
  value: RiskPreference;
  onChange: (value: RiskPreference) => void;
}

export function RiskSelector({ value, onChange }: RiskSelectorProps) {
  return (
    <section className="panel">
      <div className="section-copy">
        <p className="eyebrow">Risk preference</p>
        <h3>How much movement feels comfortable?</h3>
      </div>
      <div className="grid three-up">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`choice-card ${value === option.value ? "is-active" : ""}`}
            onClick={() => onChange(option.value)}
          >
            <span className="choice-title">{option.label}</span>
            <span className="choice-copy">{option.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
