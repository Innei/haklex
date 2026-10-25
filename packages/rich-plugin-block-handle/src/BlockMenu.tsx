import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@haklex/rich-editor-ui';
import {
  ArrowDown,
  ArrowUp,
  Code2,
  Copy,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  TextQuote,
  Trash2,
  Type,
} from 'lucide-react';
import type { ComponentType, ReactElement } from 'react';

interface TurnIntoItem {
  icon: ComponentType;
  key: string;
  label: string;
}

const TURN_INTO_ITEMS: TurnIntoItem[] = [
  { key: 'paragraph', label: 'Text', icon: Type },
  { key: 'h1', label: 'Heading 1', icon: Heading1 },
  { key: 'h2', label: 'Heading 2', icon: Heading2 },
  { key: 'h3', label: 'Heading 3', icon: Heading3 },
  { key: 'bullet', label: 'Bullet List', icon: List },
  { key: 'numbered', label: 'Numbered List', icon: ListOrdered },
  { key: 'todo', label: 'To-do', icon: ListChecks },
  { key: 'quote', label: 'Quote', icon: TextQuote },
  { key: 'divider', label: 'Divider', icon: Minus },
  { key: 'code', label: 'Code', icon: Code2 },
];

interface BlockMenuProps {
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onTurnInto: (type: string) => void;
}

export function BlockMenu({
  onDelete,
  onDuplicate,
  onMoveDown,
  onMoveUp,
  onTurnInto,
}: BlockMenuProps): ReactElement {
  return (
    <DropdownMenuContent align="start" side="bottom" sideOffset={4}>
      <DropdownMenuGroup>
        <DropdownMenuLabel>Turn into</DropdownMenuLabel>
        {TURN_INTO_ITEMS.map((item) => (
          <DropdownMenuItem key={item.key} onClick={() => onTurnInto(item.key)}>
            <item.icon />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem shortcut="Mod+Shift+Up" onClick={onMoveUp}>
          <ArrowUp />
          Move Up
        </DropdownMenuItem>
        <DropdownMenuItem shortcut="Mod+Shift+Down" onClick={onMoveDown}>
          <ArrowDown />
          Move Down
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" onClick={onDelete}>
        <Trash2 />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
