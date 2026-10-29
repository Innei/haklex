import type { InputHTMLAttributes, Ref } from 'react';

import * as css from './styles.css';

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  mono?: boolean;
  ref?: Ref<HTMLInputElement>;
};

export function TextInput({ invalid, mono, className, type = 'text', ...props }: TextInputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={`${css.input}${mono ? ` ${css.mono}` : ''}${className ? ` ${className}` : ''}`}
      type={type}
      {...props}
    />
  );
}

export const textInputClassName = css.input;

export type { TextInputProps };
