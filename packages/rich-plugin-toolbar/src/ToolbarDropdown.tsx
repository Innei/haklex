import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from '@haklex/rich-editor-ui';
import { ChevronDown } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import * as css from './styles.css';
import type { ToolbarTooltipHandle, ToolbarTooltipPayload } from './types';

export interface ToolbarDropdownItem {
  active?: boolean;
  icon?: ReactNode;
  label: string;
  onSelect: () => void;
  style?: CSSProperties;
}

export interface ToolbarDropdownProps {
  items: ToolbarDropdownItem[];
  label: string;
  title: string;
  tooltipHandle?: ToolbarTooltipHandle;
  triggerWidth?: number;
}

export function ToolbarDropdown({
  label,
  title,
  items,
  triggerWidth,
  tooltipHandle,
}: ToolbarDropdownProps) {
  const triggerStyle = triggerWidth ? { width: triggerWidth } : undefined;

  const trigger = (
    <DropdownMenuTrigger
      className={css.toolbarDropdownTrigger}
      render={<button type="button" />}
      style={triggerStyle}
    />
  );

  const triggerContent = (
    <>
      {label}
      <span className={css.toolbarDropdownTriggerChevron}>
        <ChevronDown size={14} />
      </span>
    </>
  );

  const activeLabel = items.find((item) => item.active)?.label ?? null;
  const menu = (
    <DropdownMenuContent sideOffset={4}>
      <DropdownMenuRadioGroup value={activeLabel}>
        {items.map((item) => (
          <DropdownMenuRadioItem
            closeOnClick
            key={item.label}
            style={item.style}
            value={item.label}
            onClick={item.onSelect}
          >
            {item.icon}
            {item.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  );

  if (tooltipHandle) {
    return (
      <DropdownMenu>
        <TooltipTrigger
          handle={tooltipHandle as any}
          payload={{ title } satisfies ToolbarTooltipPayload}
          render={trigger}
        >
          {triggerContent}
        </TooltipTrigger>
        {menu}
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <TooltipRoot>
        <TooltipTrigger render={trigger}>{triggerContent}</TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          {title}
        </TooltipContent>
      </TooltipRoot>
      {menu}
    </DropdownMenu>
  );
}
