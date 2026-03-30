import { AutoResizeTextArea, Spinner } from '@haklex/rich-editor-ui';
import { Send, Square } from 'lucide-react';
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
  const isAbortMode = Boolean(isRunning);
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
    <div className={css.composerDock}>
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
        <button
          aria-label={isAbortMode ? 'Abort agent run' : 'Send message'}
          className={isAbortMode ? css.composerAbortButton : css.composerSendButton}
          disabled={isAbortMode ? !onAbort : disabled || !trimmed}
          type="button"
          onClick={isAbortMode ? () => onAbort?.() : handleSend}
        >
          {isAbortMode ? (
            <Square fill="currentColor" size={14} strokeWidth={0} />
          ) : (
            <Send fill="currentColor" size={16} strokeWidth={0} />
          )}
        </button>
      </div>
    </div>
  );
}
