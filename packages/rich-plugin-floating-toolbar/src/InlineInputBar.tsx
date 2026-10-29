import { ActionButton, Kbd, TextInput, TooltipTrigger } from '@haklex/rich-editor-ui';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

import * as css from './styles.css';
import type { ToolbarTooltipHandle, ToolbarTooltipPayload } from './ToolbarButton';

interface InlineInputBarProps {
  handle: ToolbarTooltipHandle;
  icon: ReactNode;
  label: string;
  onCancel: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  secondary: {
    danger?: boolean;
    icon: ReactNode;
    label: string;
    onClick: () => void;
    shortcut?: string;
  };
  type?: 'text' | 'url';
  value: string;
}

export function InlineInputBar({
  handle,
  icon,
  label,
  onCancel,
  onChange,
  onSubmit,
  placeholder,
  secondary,
  type = 'text',
  value,
}: InlineInputBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className={css.inputRow}>
      <span aria-hidden className={css.inputIcon}>
        {icon}
      </span>
      <TextInput
        aria-label={label}
        autoComplete="off"
        className={css.inlineInput}
        placeholder={placeholder}
        ref={inputRef}
        spellCheck={false}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          }
        }}
      />
      <ActionButton
        aria-label="Save"
        size="md"
        variant="solid"
        onClick={onSubmit}
        onMouseDown={(e) => e.preventDefault()}
      >
        Save
        <Kbd keys="enter" size="sm" tone="inverted" />
      </ActionButton>
      <TooltipTrigger
        handle={handle as never}
        payload={
          { label: secondary.label, shortcut: secondary.shortcut } satisfies ToolbarTooltipPayload
        }
        render={
          <ActionButton
            icon
            aria-label={secondary.label}
            danger={secondary.danger}
            size="md"
            onClick={secondary.onClick}
            onMouseDown={(e) => e.preventDefault()}
          />
        }
      >
        {secondary.icon}
      </TooltipTrigger>
    </div>
  );
}
