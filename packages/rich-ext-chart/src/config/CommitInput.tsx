import { TextInput } from '@haklex/rich-editor-ui';
import type { InputHTMLAttributes, KeyboardEvent } from 'react';
import { useState } from 'react';

export interface CommitInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  mono?: boolean;
  onCommit: (value: string) => void;
  plain?: boolean;
  value: string;
}

export function CommitInput({
  value,
  onCommit,
  onKeyDown,
  plain,
  mono,
  ...props
}: CommitInputProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft !== null && draft !== value) onCommit(draft);
    setDraft(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key === 'Enter') event.currentTarget.blur();
  };

  const inputProps = {
    type: 'text',
    ...props,
    value: draft ?? value,
    onBlur: commit,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setDraft(event.target.value),
    onFocus: () => setDraft(value),
    onKeyDown: handleKeyDown,
  };

  return plain ? <input {...inputProps} /> : <TextInput mono={mono} {...inputProps} />;
}
