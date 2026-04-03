import { AutoResizeTextArea } from '@haklex/rich-editor-ui';
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
  const isAbortMode = Boolean(isRunning);

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
          <span className={css.composerStatusDot} />
          <span>{statusLabel}</span>
        </div>
      )}
      <div className={css.composerBox}>
        <AutoResizeTextArea
          className={css.composerTextArea}
          disabled={disabled}
          maxRows={10}
          minRows={1}
          placeholder="Message..."
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          aria-label={isAbortMode ? 'Stop' : 'Send'}
          className={isAbortMode ? css.composerAbortButton : css.composerSendButton}
          disabled={isAbortMode ? !onAbort : disabled || !trimmed}
          type="button"
          onClick={isAbortMode ? () => onAbort?.() : handleSend}
        >
          {isAbortMode ? (
            <Square fill="currentColor" size={14} strokeWidth={0} />
          ) : (
            <ArrowUp size={16} strokeWidth={2.5} />
          )}
        </button>
      </div>
      <div className={css.composerBottomBar}>
        <div>{modelSelector ?? <div />}</div>
        <span className={css.composerHint}>↵ Send · ⇧↵ Newline</span>
      </div>
    </div>
  );
}
