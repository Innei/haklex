import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';

import { alert, alertAction, alertContent, alertIcon } from './styles.css';

export interface AlertProps {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  variant: 'info' | 'warning' | 'error';
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
} as const;

export function Alert({ variant, children, action, className }: AlertProps): ReactElement {
  const IconComponent = icons[variant];
  return (
    <div className={`${alert({ variant })}${className ? ` ${className}` : ''}`} role="alert">
      <IconComponent className={alertIcon} />
      <div className={alertContent}>{children}</div>
      {action && <div className={alertAction}>{action}</div>}
    </div>
  );
}
