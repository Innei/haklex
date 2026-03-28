import type { ReactElement, ReactNode } from 'react';

import { badge } from './styles.css';

export interface BadgeProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'neutral' | 'success' | 'error' | 'warning' | 'info';
}

export function Badge({ variant, size, children, className }: BadgeProps): ReactElement {
  return (
    <span className={`${badge({ variant, size })}${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  );
}
