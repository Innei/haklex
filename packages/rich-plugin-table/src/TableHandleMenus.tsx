import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@haklex/rich-editor-ui';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  GripHorizontal,
  GripVertical,
  PanelLeft,
  PanelTop,
  Trash2,
} from 'lucide-react';
import type { ReactElement } from 'react';

import * as css from './styles.css';
import type { TableAction } from './table-actions';

const ICON_SIZE = 14;

interface TableHandleMenuProps {
  isHeader: boolean;
  onAction: (action: TableAction) => void;
  onOpenChange: (open: boolean) => void;
}

export function RowHandleMenu({
  isHeader,
  onAction,
  onOpenChange,
}: TableHandleMenuProps): ReactElement {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger aria-label="Row actions" className={css.handleBtn}>
        <GripVertical size={ICON_SIZE} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" sideOffset={8}>
        <DropdownMenuItem onClick={() => onAction('insert-row-above')}>
          <ArrowUp />
          Insert row above
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction('insert-row-below')}>
          <ArrowDown />
          Insert row below
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={isHeader}
          onCheckedChange={() => onAction('toggle-header-row')}
        >
          <PanelTop />
          Header row
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onAction('delete-row')}>
          <Trash2 />
          Delete row
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ColumnHandleMenu({
  isHeader,
  onAction,
  onOpenChange,
}: TableHandleMenuProps): ReactElement {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger aria-label="Column actions" className={css.handleBtn}>
        <GripHorizontal size={ICON_SIZE} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" sideOffset={8}>
        <DropdownMenuItem onClick={() => onAction('insert-column-left')}>
          <ArrowLeft />
          Insert column left
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction('insert-column-right')}>
          <ArrowRight />
          Insert column right
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={isHeader}
          onCheckedChange={() => onAction('toggle-header-column')}
        >
          <PanelLeft />
          Header column
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onAction('delete-column')}>
          <Trash2 />
          Delete column
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
