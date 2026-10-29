import { createTooltipHandle, TooltipTrigger } from '@haklex/rich-editor-ui';
import type { ReactElement, ReactNode } from 'react';

import * as css from './styles.css';

export interface ToolbarTooltipPayload {
  label: string;
  shortcut?: string;
}

export type ToolbarTooltipHandle = ReturnType<typeof createTooltipHandle<ToolbarTooltipPayload>>;

export function createToolbarTooltipHandle(): ToolbarTooltipHandle {
  return createTooltipHandle<ToolbarTooltipPayload>();
}

interface ToolbarButtonProps {
  active?: boolean;
  children: ReactNode;
  handle: ToolbarTooltipHandle;
  label: string;
  onClick: () => void;
  render?: ReactElement;
  shortcut?: string;
}

export function ToolbarButton({
  active,
  children,
  handle,
  label,
  onClick,
  render,
  shortcut,
}: ToolbarButtonProps) {
  const button = render ?? (
    <button
      aria-pressed={active}
      className={css.btn}
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
    />
  );

  return (
    <TooltipTrigger
      aria-label={label}
      data-shortcut={shortcut}
      data-tooltip={label}
      handle={handle as never}
      payload={{ label, shortcut } satisfies ToolbarTooltipPayload}
      render={button}
    >
      {children}
    </TooltipTrigger>
  );
}
