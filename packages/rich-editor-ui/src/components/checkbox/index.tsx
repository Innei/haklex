import { useState } from 'react';

import * as css from './styles.css';

function cx(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(' ');
}

export interface AnimatedCheckboxProps {
  checked?: boolean;
  className?: string;
  defaultChecked?: boolean;
  description?: string;
  disabled?: boolean;
  /** Shows a dash and reports `aria-checked="mixed"`; the next click checks the box. */
  indeterminate?: boolean;
  label?: string;
  onChange?: (checked: boolean) => void;
}

export function AnimatedCheckbox({
  label,
  description,
  checked: controlledChecked,
  defaultChecked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  className,
}: AnimatedCheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;
  const filled = indeterminate || isChecked;

  const handleToggle = () => {
    if (disabled) return;
    const next = indeterminate ? true : !isChecked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  };

  return (
    <button
      aria-checked={indeterminate ? 'mixed' : isChecked}
      aria-disabled={disabled}
      className={cx(css.root, disabled && css.rootDisabled, className)}
      role="checkbox"
      type="button"
      onClick={handleToggle}
    >
      <span className={cx(css.box, filled ? css.boxChecked : css.boxUnchecked)}>
        <svg
          aria-hidden
          className={cx(css.mark, isChecked && !indeterminate ? css.markVisible : css.markHidden)}
          fill="none"
          viewBox="0 0 12 12"
        >
          <path
            d="M2.5 6.25L5 8.75L9.5 3.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
          />
        </svg>
        <svg
          aria-hidden
          className={cx(css.mark, indeterminate ? css.markVisible : css.markHidden)}
          fill="none"
          viewBox="0 0 12 12"
        >
          <path d="M3 6H9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
        </svg>
      </span>

      {(label || description) && (
        <span className={css.labelArea}>
          {label && <span className={cx(css.label, disabled && css.labelDisabled)}>{label}</span>}
          {description && <span className={css.description}>{description}</span>}
        </span>
      )}
    </button>
  );
}
