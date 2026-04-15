interface FlexibilitySelectorProps {
  value: boolean;
  onChange: (next: boolean) => void;
}

export function FlexibilitySelector({ value, onChange }: FlexibilitySelectorProps) {
  return (
    <section className="neuro-section">
      <div className="section-heading">
        <span className="section-kicker">Flexibility</span>
        <h3>How quickly might you need access?</h3>
      </div>

      <div className="choice-grid">
        <button
          type="button"
          className={!value ? "choice-card active" : "choice-card"}
          onClick={() => onChange(false)}
        >
          <span>Longer hold</span>
          <small>I can leave this plan working for longer.</small>
        </button>
        <button
          type="button"
          className={value ? "choice-card active" : "choice-card"}
          onClick={() => onChange(true)}
        >
          <span>Stay flexible</span>
          <small>Keep exits and safer switches easier.</small>
        </button>
      </div>
    </section>
  );
}
