import type { ReactNode } from 'react';

import * as css from './styles.css';

type FieldProps = {
  children: ReactNode;
  className?: string;
  error?: ReactNode;
  hint?: ReactNode;
  id: string;
  label: ReactNode;
};

export function Field({ children, className, error, hint, id, label }: FieldProps) {
  return (
    <div className={`${css.field}${className ? ` ${className}` : ''}`}>
      <label className={css.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p className={css.error} id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={css.hint} id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export type { FieldProps };
