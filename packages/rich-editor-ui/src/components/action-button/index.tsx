import type { TextLevel } from '@haklex/rich-style-token/styles';
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';

import * as css from './styles.css';

// -- ActionBar --

type ActionBarProps = HTMLAttributes<HTMLDivElement> & {
  gap?: string | number;
};

export function ActionBar({ className, gap, style, ...props }: ActionBarProps) {
  return (
    <div
      className={`${css.actionBar} ${css.semanticClassNames.actionBar}${className ? ` ${className}` : ''}`}
      style={gap != null ? { ...style, gap } : style}
      {...props}
    />
  );
}

// -- ActionButton --

type ActionButtonVariant = 'ghost' | 'solid' | 'outline' | 'accent';

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** `accent` is deprecated and renders as `solid`. Toggle buttons set `aria-pressed`. */
  variant?: ActionButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  end?: boolean;
  danger?: boolean;
  icon?: boolean;
  rounded?: boolean;
  /**
   * Neutral level of the button's label (`4` = primary text, `1` = faintest).
   * Declaring it sets the label to that level and the icon to the step below;
   * omit it to inherit the label color and derive the icon tone from it.
   */
  level?: TextLevel;
};

export function ActionButton({
  variant,
  size,
  end = false,
  danger = false,
  icon = false,
  rounded = false,
  level,
  className,
  type = 'button',
  ...props
}: ActionButtonProps) {
  const semanticParts: string[] = [css.semanticClassNames.actionButton];
  if (end) semanticParts.push(css.semanticClassNames.actionButtonEnd);
  if (danger) semanticParts.push(css.semanticClassNames.actionButtonDanger);
  if (icon) semanticParts.push(css.semanticClassNames.actionButtonIcon);
  if (level && !icon) semanticParts.push(css.levelTone[level]);

  const recipeClass = css.actionButton({ variant, size, end, danger, icon, rounded });

  return (
    <button
      className={`${recipeClass} ${semanticParts.join(' ')}${className ? ` ${className}` : ''}`}
      type={type}
      {...props}
    />
  );
}

export function getActionButtonClassName(options?: {
  variant?: ActionButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  level?: TextLevel;
}) {
  const { level, ...recipe } = options ?? {};
  const levelClass = level ? ` ${css.levelTone[level]}` : '';
  return `${css.actionButton(recipe)} ${css.semanticClassNames.actionButton}${levelClass}`;
}

export type { ActionBarProps, ActionButtonProps };
