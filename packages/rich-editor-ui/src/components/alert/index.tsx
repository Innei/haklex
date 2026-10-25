import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';

import { alert, alertAction, alertContent, alertIcon, alertTitle } from './styles.css';

export interface AlertProps {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  variant: 'info' | 'success' | 'warning' | 'error' | 'neutral';
}

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  neutral: Info,
} as const;

export function Alert({ variant, title, children, action, className }: AlertProps): ReactElement {
  const IconComponent = icons[variant];
  return (
    <div
      className={`${alert({ variant })}${className ? ` ${className}` : ''}`}
      data-variant={variant}
      role="alert"
    >
      <IconComponent className={alertIcon} />
      <div className={alertContent}>
        {title && (
          <div className={alertTitle} data-slot="alert-title">
            {title}
          </div>
        )}
        <div>{children}</div>
      </div>
      {action && <div className={alertAction}>{action}</div>}
    </div>
  );
}
