import type { ReactElement } from 'react';

import { spinner } from './styles.css';

export interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function Spinner({ size, className }: SpinnerProps): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`${spinner({ size })}${className ? ` ${className}` : ''}`}
      role="status"
    />
  );
}
