import { ActionButton } from '@haklex/rich-editor-ui';
import type { LucideIcon } from 'lucide-react';
import {
  Circle,
  Diamond,
  Eraser,
  Frame,
  Hand,
  Image,
  Lock,
  LockOpen,
  Minus,
  MousePointer2,
  MoveRight,
  Pencil,
  Square,
  StickyNote,
  Type,
} from 'lucide-react';
import type { FC } from 'react';

import * as css from './chrome.css';
import type { WhiteboardStore } from './store';
import { useStore } from './store';
import type { ToolType } from './types';

interface ToolDef {
  icon: LucideIcon;
  key: string;
  label: string;
  tool: ToolType;
}

export const TOOLS: ToolDef[] = [
  { tool: 'hand', icon: Hand, key: 'H', label: 'Hand' },
  { tool: 'selection', icon: MousePointer2, key: 'V', label: 'Select' },
  { tool: 'rectangle', icon: Square, key: 'R', label: 'Rectangle' },
  { tool: 'diamond', icon: Diamond, key: 'D', label: 'Diamond' },
  { tool: 'ellipse', icon: Circle, key: 'O', label: 'Ellipse' },
  { tool: 'arrow', icon: MoveRight, key: 'A', label: 'Arrow' },
  { tool: 'line', icon: Minus, key: 'L', label: 'Line' },
  { tool: 'freedraw', icon: Pencil, key: 'P', label: 'Draw' },
  { tool: 'text', icon: Type, key: 'T', label: 'Text' },
  { tool: 'card', icon: StickyNote, key: 'N', label: 'Card' },
  { tool: 'image', icon: Image, key: 'I', label: 'Image' },
  { tool: 'frame', icon: Frame, key: 'F', label: 'Frame' },
  { tool: 'eraser', icon: Eraser, key: 'E', label: 'Eraser' },
];

export interface WhiteboardToolbarProps {
  className?: string;
  onToolSelect?: (tool: ToolType) => boolean | void;
  showKeys?: boolean;
  store: WhiteboardStore;
}

export const WhiteboardToolbar: FC<WhiteboardToolbarProps> = ({
  className,
  onToolSelect,
  showKeys = true,
  store,
}) => {
  const tool = useStore(store, (s) => s.tool);
  const locked = useStore(store, (s) => s.toolLocked);
  const LockIcon = locked ? Lock : LockOpen;

  return (
    <div className={`${css.toolbar}${className ? ` ${className}` : ''}`} role="toolbar">
      <ActionButton
        icon
        aria-label={locked ? 'Unlock tool' : 'Keep tool active'}
        aria-pressed={locked}
        className={css.toolButton}
        size="lg"
        variant="ghost"
        onClick={() => store.setState({ toolLocked: !locked })}
      >
        <LockIcon size={16} />
      </ActionButton>
      <span className={css.separator} />
      {TOOLS.map(({ tool: value, icon: Icon, key, label }) => (
        <ActionButton
          icon
          aria-label={`${label} (${key})`}
          aria-pressed={tool === value}
          className={css.toolButton}
          data-tool={value}
          key={value}
          size="lg"
          title={`${label} — ${key}`}
          variant="ghost"
          onClick={() => {
            if (onToolSelect?.(value) === false) return;
            store.setState({
              tool: value,
              selectedIds: value === 'selection' ? store.getState().selectedIds : new Set(),
            });
          }}
        >
          <Icon size={16} />
          {showKeys && <span className={css.toolKey}>{key}</span>}
        </ActionButton>
      ))}
    </div>
  );
};
