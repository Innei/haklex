import { TooltipContent, TooltipRoot, TooltipTrigger } from '@haklex/rich-editor-ui';
import type { ReactNode } from 'react';

import * as css from './styles.css';
import type { ToolbarTooltipHandle, ToolbarTooltipPayload } from './types';

export interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  icon: ReactNode;
  onClick: () => void;
  shortcut?: string;
  title: string;
  tooltipHandle?: ToolbarTooltipHandle;
}

export function ToolbarButton({
  icon,
  title,
  shortcut,
  active,
  disabled,
  onClick,
  tooltipHandle,
}: ToolbarButtonProps) {
  const button = (
    <button
      aria-label={title}
      aria-pressed={active}
      className={`${css.toolbarButton}${active ? ` ${css.toolbarButtonActive}` : ''}`}
      disabled={disabled}
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    />
  );

  if (tooltipHandle) {
    return (
      <TooltipTrigger
        handle={tooltipHandle as any}
        payload={{ title, shortcut } satisfies ToolbarTooltipPayload}
        render={button}
      >
        {icon}
      </TooltipTrigger>
    );
  }

  return (
    <TooltipRoot>
      <TooltipTrigger render={button}>{icon}</TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={4}>
        {title}
        {shortcut && <span className={css.tooltipShortcut}>{shortcut}</span>}
      </TooltipContent>
    </TooltipRoot>
  );
}
