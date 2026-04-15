interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function AmountInput({ value, onChange }: AmountInputProps) {
  return (
    <label className="neuro-field">
      <span className="neuro-field-label">How much TON should start working?</span>
      <div className="neuro-amount-input">
        <input
          type="number"
          min="0"
          step="0.1"
          value={Number.isNaN(value) ? "" : value}
          onChange={(event) => onChange(Number(event.target.value))}
          placeholder="25"
        />
        <span>TON</span>
      </div>
    </label>
  );
}
