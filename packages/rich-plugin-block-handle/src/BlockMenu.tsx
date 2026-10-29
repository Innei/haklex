import { getCommandMeta, TURN_INTO_COMMAND_IDS } from '@haklex/rich-editor/command-registry';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from '@haklex/rich-editor-ui';
import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';

interface BlockMenuProps {
  currentType?: string | null;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onTurnInto: (type: string) => void;
}

const TURN_INTO_ITEMS = TURN_INTO_COMMAND_IDS.map((id) => getCommandMeta(id)!);

export function BlockMenu({
  currentType,
  onDelete,
  onDuplicate,
  onMoveDown,
  onMoveUp,
  onTurnInto,
}: BlockMenuProps): ReactElement {
  const current = currentType ? getCommandMeta(currentType) : undefined;
  const TriggerIcon = (current ?? TURN_INTO_ITEMS[0]).icon;

  return (
    <DropdownMenuContent align="start" side="bottom" sideOffset={4}>
      {currentType !== null && (
        <>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger value={current?.title}>
              <TriggerIcon />
              Turn into
            </DropdownMenuSubTrigger>
            <DropdownMenuContent align="start" side="right" sideOffset={4}>
              <DropdownMenuRadioGroup value={current?.id ?? null}>
                {TURN_INTO_ITEMS.map((item) => (
                  <DropdownMenuRadioItem
                    closeOnClick
                    key={item.id}
                    value={item.id}
                    onClick={() => onTurnInto(item.id)}
                  >
                    <item.icon />
                    {item.title}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItem shortcut="Mod+D" onClick={onDuplicate}>
        <Copy />
        Duplicate
      </DropdownMenuItem>
      <DropdownMenuItem shortcut="Mod+Shift+Up" onClick={onMoveUp}>
        <ArrowUp />
        Move up
      </DropdownMenuItem>
      <DropdownMenuItem shortcut="Mod+Shift+Down" onClick={onMoveDown}>
        <ArrowDown />
        Move down
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem shortcut="Backspace" variant="destructive" onClick={onDelete}>
        <Trash2 />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
