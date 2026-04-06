import type { AgentStoreStatus, CapturedSelection } from '@haklex/rich-agent-core';
import { AutoResizeTextArea } from '@haklex/rich-editor-ui';
import { ArrowUp, Square, Type, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

import * as css from './styles.css';

const STATUS_LABELS: Partial<Record<AgentStoreStatus, string>> = {
  thinking: 'Thinking...',
  writing: 'Writing...',
  running: 'Processing...',
  calling_tool: 'Calling tool...',
};

interface ChatInputProps {
  disabled?: boolean;
  isRunning?: boolean;
  modelSelector?: ReactNode;
  onAbort?: () => void;
  onDismissSelection?: () => void;
  onSend: (message: string) => void;
  pinnedSelection?: CapturedSelection | null;
  status?: AgentStoreStatus;
}

export function ChatInput({
  disabled,
  isRunning,
  modelSelector,
  onAbort,
  onDismissSelection,
  onSend,
  pinnedSelection,
  status,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmed = input.trim();
  const isAbortMode = Boolean(isRunning);
  const statusLabel = status ? STATUS_LABELS[status] : undefined;

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
      {pinnedSelection && (
        <div className={css.selectionIndicator}>
          <Type className={css.selectionIndicatorIcon} size={12} strokeWidth={2} />
          <span className={css.selectionIndicatorText}>
            {pinnedSelection.type === 'text'
              ? `"${pinnedSelection.text.length > 60 ? `${pinnedSelection.text.slice(0, 60)}…` : pinnedSelection.text}"`
              : `${pinnedSelection.blockIds.length} block${pinnedSelection.blockIds.length > 1 ? 's' : ''} selected`}
          </span>
          <button
            aria-label="Dismiss selection"
            className={css.selectionIndicatorDismiss}
            type="button"
            onClick={onDismissSelection}
          >
            <X size={12} strokeWidth={2} />
          </button>
        </div>
      )}
      {isRunning && statusLabel && (
        <div className={css.composerStatusLine}>
          <span className={css.composerStatusDotWrap}>
            <span className={css.composerStatusDotOuter} />
            <span className={css.composerStatusDotInner} />
          </span>
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
        <div className={css.composerBottomBar}>
          <div>{modelSelector ?? <div />}</div>
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
      </div>
    </div>
  );
}
