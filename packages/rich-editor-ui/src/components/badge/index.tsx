import type { ReactElement, ReactNode } from 'react';

import { badge, badgeDot } from './styles.css';

export interface BadgeProps {
  children: ReactNode;
  className?: string;
  dot?: boolean;
  size?: 'sm' | 'md';
  variant?: 'neutral' | 'success' | 'error' | 'warning' | 'info';
}

export function Badge({ variant, size, dot, children, className }: BadgeProps): ReactElement {
  return (
    <span className={`${badge({ variant, size })}${className ? ` ${className}` : ''}`}>
      {dot && <span aria-hidden className={badgeDot} data-slot="badge-dot" />}
      {children}
    </span>
  );
}
