import { useEffect, useRef, useState } from 'react'

import * as css from './styles.css'

function cx(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(' ')
}

export interface AnimatedCheckboxProps {
  label?: string
  description?: string
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function AnimatedCheckbox({
  label,
  description,
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  className,
}: AnimatedCheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const [bouncing, setBouncing] = useState(false)
  const isControlled = controlledChecked !== undefined
  const isChecked = isControlled ? controlledChecked : internalChecked
  const isFirstRender = useRef(true)
  const rippleKey = useRef(0)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setBouncing(true)
    rippleKey.current += 1
    const timer = setTimeout(() => setBouncing(false), 400)
    return () => clearTimeout(timer)
  }, [isChecked])

  const handleToggle = () => {
    if (disabled) return
    const next = !isChecked
    if (!isControlled) setInternalChecked(next)
    onChange?.(next)
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      aria-disabled={disabled}
      onClick={handleToggle}
      className={cx(css.root, disabled && css.rootDisabled, className)}
    >
      <span
        className={cx(
          css.box,
          isChecked ? css.boxChecked : css.boxUnchecked,
          bouncing && css.boxBouncing,
        )}
      >
        <svg
          viewBox="0 0 12 10"
          fill="none"
          className={cx(
            css.checkmark,
            isChecked ? css.checkmarkVisible : css.checkmarkHidden,
          )}
        >
          <path
            d="M1 5.5L4 8.5L11 1.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              color: '#fff',
              strokeDasharray: 20,
              strokeDashoffset: isChecked ? 0 : 20,
              transition: isChecked
                ? 'stroke-dashoffset 0.4s ease-out 0.1s'
                : 'stroke-dashoffset 0.2s ease-in',
            }}
          />
        </svg>
        <span
          key={rippleKey.current}
          className={cx(css.ripple, bouncing && css.rippleActive)}
        />
      </span>

      {(label || description) && (
        <span className={css.labelArea}>
          {label && (
            <span className={cx(css.label, disabled && css.labelDisabled)}>
              {label}
            </span>
          )}
          {description && (
            <span className={css.description}>{description}</span>
          )}
        </span>
      )}
    </button>
  )
}
