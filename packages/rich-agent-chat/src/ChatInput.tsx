import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';

import { inputContainer, inputField, sendButton } from './styles.css';

interface ChatInputProps {
  disabled?: boolean;
  onSend: (message: string) => void;
}

export function ChatInput({ disabled, onSend }: ChatInputProps): ReactElement {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  }, [value, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className={inputContainer}>
      <input
        className={inputField}
        disabled={disabled}
        placeholder="Ask AI to edit..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className={sendButton} disabled={disabled || !value.trim()} onClick={handleSend}>
        Send
      </button>
    </div>
  );
}
