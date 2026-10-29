import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  TooltipTrigger,
} from '@haklex/rich-editor-ui';
import type { ReactElement, ReactNode } from 'react';

import type { ToolbarEntry, ToolbarMenuItem } from './entries';
import * as css from './styles.css';
import type { ToolbarTooltipHandle, ToolbarTooltipPayload } from './types';

interface ToolbarMenuButtonProps {
  children: ReactNode;
  handle: ToolbarTooltipHandle;
  title: string;
}

export function ToolbarMenuButton({
  children,
  handle,
  title,
}: ToolbarMenuButtonProps): ReactElement {
  return (
    <TooltipTrigger
      handle={handle as any}
      payload={{ title } satisfies ToolbarTooltipPayload}
      render={
        <DropdownMenuTrigger
          aria-label={title}
          className={css.toolbarButton}
          render={<button type="button" />}
        />
      }
    >
      {children}
    </TooltipTrigger>
  );
}

export function ToolbarMenuItems({ items }: { items: ToolbarMenuItem[] }): ReactElement {
  return (
    <>
      {items.map((item) =>
        item.active === undefined ? (
          <DropdownMenuItem
            disabled={item.disabled}
            key={item.label}
            shortcut={item.shortcut}
            onClick={item.onSelect}
          >
            {item.icon}
            {item.label}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuCheckboxItem
            closeOnClick
            checked={item.active}
            disabled={item.disabled}
            key={item.label}
            onClick={item.onSelect}
          >
            {item.icon}
            {item.label}
          </DropdownMenuCheckboxItem>
        ),
      )}
    </>
  );
}

interface ToolbarOverflowMenuProps {
  entries: ToolbarEntry[];
  handle: ToolbarTooltipHandle;
  icon: ReactNode;
}

export function ToolbarOverflowMenu({
  entries,
  handle,
  icon,
}: ToolbarOverflowMenuProps): ReactElement {
  const sections = entries.filter((entry) => entry.separator || entry.menu);
  return (
    <DropdownMenu modal={false}>
      <ToolbarMenuButton handle={handle} title="More tools">
        {icon}
      </ToolbarMenuButton>
      <DropdownMenuContent align="end" positionMethod="fixed" sideOffset={4}>
        {sections.map((entry, index) => {
          if (entry.separator) {
            const prev = sections[index - 1];
            return prev && !prev.separator && index < sections.length - 1 ? (
              <DropdownMenuSeparator key={entry.key} />
            ) : null;
          }
          const menu = entry.menu!;
          if (!menu.label) return <ToolbarMenuItems items={menu.items} key={entry.key} />;
          return (
            <DropdownMenuGroup key={entry.key}>
              <DropdownMenuLabel>{menu.label}</DropdownMenuLabel>
              <ToolbarMenuItems items={menu.items} />
            </DropdownMenuGroup>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
