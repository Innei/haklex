import { ActionButton, AutoResizeTextArea } from '@haklex/rich-editor-ui';
import { ArrowUp, Square } from 'lucide-react';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

import * as css from './styles.css';

interface ChatInputProps {
  disabled?: boolean;
  isRunning?: boolean;
  modelSelector?: ReactNode;
  onAbort?: () => void;
  onSend: (message: string) => void;
}

export function ChatInput({ disabled, isRunning, modelSelector, onAbort, onSend }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !isRunning) handleSend();
    }
  }

  return (
    <div className={css.inputContainer}>
      <AutoResizeTextArea
        className={css.inputTextArea}
        disabled={disabled}
        maxRows={6}
        placeholder="Ask AI to edit..."
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className={css.inputBottomBar}>
        {modelSelector ?? <div />}
        {isRunning ? (
          <ActionButton size="sm" onClick={onAbort}>
            <Square size={16} />
          </ActionButton>
        ) : (
          <ActionButton disabled={disabled || !input.trim()} size="sm" onClick={handleSend}>
            <ArrowUp size={16} />
          </ActionButton>
        )}
      </div>
    </div>
  );
}
