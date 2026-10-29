import type { ImageLayout } from '@haklex/rich-editor/nodes';
import { useAtomValue } from 'jotai';
import type { LucideIcon } from 'lucide-react';
import {
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartVertical,
  ArrowLeftToLine,
  ArrowRightToLine,
} from 'lucide-react';

import { layoutAtom } from './atoms';
import * as styles from './styles.css';
import { ToolbarButton } from './ToolbarButton';
import { useImageActions } from './useImageActions';

export { ImageSizeControl } from './ImageSizeControl';

export const LAYOUT_OPTIONS: { value: ImageLayout | undefined; label: string; Icon: LucideIcon }[] =
  [
    { value: undefined, label: 'Center', Icon: AlignCenterVertical },
    { value: 'align-left', label: 'Align left', Icon: AlignStartVertical },
    { value: 'align-right', label: 'Align right', Icon: AlignEndVertical },
    { value: 'float-left', label: 'Wrap left', Icon: ArrowLeftToLine },
    { value: 'float-right', label: 'Wrap right', Icon: ArrowRightToLine },
  ];

export function ImageLayoutControl() {
  const layout = useAtomValue(layoutAtom);
  const { handleSetLayout } = useImageActions();

  return (
    <div aria-label="Image layout" className={styles.toolbarGroup} role="group">
      {LAYOUT_OPTIONS.map(({ value, label, Icon }) => (
        <ToolbarButton
          aria-pressed={layout === value}
          key={value ?? 'center'}
          label={label}
          onClick={() => {
            if (layout !== value) handleSetLayout(value);
          }}
        >
          <Icon />
        </ToolbarButton>
      ))}
    </div>
  );
}
