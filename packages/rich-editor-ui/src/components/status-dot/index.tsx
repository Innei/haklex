import type { ReactElement } from 'react';

import { dot, pulseRing, statusDotWrapper } from './styles.css';

export interface StatusDotProps {
  className?: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
  status: 'idle' | 'active' | 'success' | 'error' | 'warning';
}

export function StatusDot({
  status,
  pulse: showPulse,
  size,
  className,
}: StatusDotProps): ReactElement {
  return (
    <span className={`${statusDotWrapper}${className ? ` ${className}` : ''}`}>
      {showPulse && <span className={pulseRing({ status, size })} />}
      <span className={dot({ status, size })} />
    </span>
  );
}
