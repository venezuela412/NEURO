import type { ReactNode } from "react";

interface StickyActionBarProps {
  primaryLabel: string;
  secondaryLabel?: string;
  disabled?: boolean;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  helper?: ReactNode;
}

export function StickyActionBar({
  primaryLabel,
  secondaryLabel,
  disabled = false,
  onPrimaryClick,
  onSecondaryClick,
  helper,
}: StickyActionBarProps) {
  return (
    <div className="sticky-bar">
      <div className="sticky-bar-copy">{helper}</div>
      <div className="sticky-bar-actions">
        {secondaryLabel ? (
          <button className="button button-secondary" type="button" onClick={onSecondaryClick}>
            {secondaryLabel}
          </button>
        ) : null}
        <button className="button button-primary" type="button" disabled={disabled} onClick={onPrimaryClick}>
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
