import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'

import * as css from './styles.css'

// -- ActionBar --

type ActionBarProps = HTMLAttributes<HTMLDivElement> & {
  gap?: string | number
}

export function ActionBar({ className, gap, style, ...props }: ActionBarProps) {
  return (
    <div
      className={`${css.actionBar} ${css.semanticClassNames.actionBar}${className ? ` ${className}` : ''}`}
      style={gap != null ? { ...style, gap } : style}
      {...props}
    />
  )
}

// -- ActionButton --

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'ghost' | 'solid' | 'outline' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  end?: boolean
  danger?: boolean
  icon?: boolean
}

export function ActionButton({
  variant,
  size,
  end = false,
  danger = false,
  icon = false,
  className,
  type = 'button',
  ...props
}: ActionButtonProps) {
  const semanticParts: string[] = [css.semanticClassNames.actionButton]
  if (end) semanticParts.push(css.semanticClassNames.actionButtonEnd)
  if (danger) semanticParts.push(css.semanticClassNames.actionButtonDanger)
  if (icon) semanticParts.push(css.semanticClassNames.actionButtonIcon)

  const recipeClass = css.actionButton({ variant, size, end, danger, icon })

  return (
    <button
      className={`${recipeClass} ${semanticParts.join(' ')}${className ? ` ${className}` : ''}`}
      type={type}
      {...props}
    />
  )
}

export function getActionButtonClassName(options?: {
  variant?: 'ghost' | 'solid' | 'outline' | 'accent'
  size?: 'sm' | 'md' | 'lg'
}) {
  return `${css.actionButton(options)} ${css.semanticClassNames.actionButton}`
}

export type { ActionBarProps, ActionButtonProps }
