import {
  Circle,
  Crop,
  Grid3x3,
  Hash,
  MoveUpRight,
  PaintBucket,
  Pen,
  Square,
  Type,
} from 'lucide-react';
import type { FC } from 'react';

import * as css from './styles.css';
import type { EditorTool } from './useImageEditorState';

const TOOLS: { icon: FC<{ size?: number }>; id: EditorTool; label: string }[] = [
  { icon: Crop, id: 'crop', label: 'Crop' },
  { icon: MoveUpRight, id: 'arrow', label: 'Arrow' },
  { icon: Pen, id: 'pen', label: 'Pen' },
  { icon: Square, id: 'rect', label: 'Rectangle' },
  { icon: Circle, id: 'ellipse', label: 'Ellipse' },
  { icon: Type, id: 'text', label: 'Text' },
  { icon: Hash, id: 'counter', label: 'Counter' },
  { icon: PaintBucket, id: 'cover', label: 'Cover' },
  { icon: Grid3x3, id: 'mosaic', label: 'Mosaic' },
];

export interface ToolRailProps {
  activeTool: EditorTool;
  disabled: boolean;
  onSelect: (tool: EditorTool) => void;
}

export const ToolRail: FC<ToolRailProps> = ({ activeTool, disabled, onSelect }) => (
  <div className={css.toolRail}>
    {TOOLS.map((tool, index) => (
      <span className={css.toolGroup} key={tool.id}>
        <button
          aria-label={tool.label}
          aria-pressed={activeTool === tool.id}
          disabled={disabled}
          title={tool.label}
          type="button"
          className={
            activeTool === tool.id ? `${css.toolButton} ${css.toolButtonActive}` : css.toolButton
          }
          onClick={() => onSelect(tool.id)}
        >
          <tool.icon size={18} />
        </button>
        {index === 0 && <div className={css.toolDivider} />}
      </span>
    ))}
  </div>
);
