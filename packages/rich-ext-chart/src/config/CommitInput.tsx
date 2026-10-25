import type { InputHTMLAttributes, KeyboardEvent } from 'react';
import { useState } from 'react';

export interface CommitInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  onCommit: (value: string) => void;
  value: string;
}

export function CommitInput({ value, onCommit, onKeyDown, ...props }: CommitInputProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft !== null && draft !== value) onCommit(draft);
    setDraft(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key === 'Enter') event.currentTarget.blur();
  };

  return (
    <input
      type="text"
      {...props}
      value={draft ?? value}
      onBlur={commit}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={() => setDraft(value)}
      onKeyDown={handleKeyDown}
    />
  );
}
