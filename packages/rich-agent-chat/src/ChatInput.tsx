import { AutoResizeTextArea, Spinner } from '@haklex/rich-editor-ui';
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
  statusLabel?: string;
}

export function ChatInput({
  disabled,
  isRunning,
  modelSelector,
  onAbort,
  onSend,
  statusLabel,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmed = input.trim();
  const placeholder = disabled
    ? 'Configure a model to start an agent task.'
    : 'Ask a follow-up question...';

  function handleSend() {
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
    <div className={css.composerContainer}>
      <div className={css.composerCard}>
        {isRunning && statusLabel && (
          <div className={css.composerStatusLine}>
            <Spinner size="sm" />
            <span>{statusLabel}</span>
          </div>
        )}
        <AutoResizeTextArea
          className={css.composerTextArea}
          disabled={disabled}
          maxRows={10}
          minRows={2}
          placeholder={placeholder}
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className={css.composerBottomBar}>
          <div>{modelSelector ?? <div />}</div>
          {isRunning ? (
            <button
              aria-label="Abort agent run"
              className={css.composerAbortButton}
              type="button"
              onClick={onAbort}
            >
              <Square size={14} />
            </button>
          ) : (
            <button
              aria-label="Send message"
              className={css.composerSendButton}
              disabled={disabled || !trimmed}
              type="button"
              onClick={handleSend}
            >
              <ArrowUp size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
