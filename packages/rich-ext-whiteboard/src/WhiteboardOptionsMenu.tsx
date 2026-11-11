import {
  ActionButton,
  Field,
  Popover,
  PopoverBody,
  PopoverPanel,
  PopoverTrigger,
  SegmentedControl,
  TextInput,
} from '@haklex/rich-editor-ui';
import { Clipboard, Download, Ellipsis } from 'lucide-react';
import type { FC } from 'react';
import { useId } from 'react';

import * as css from './styles.css';

export type WhiteboardStorageMode = 'inline' | 'remote' | 'delta';

const STORAGE_ITEMS: { label: string; value: WhiteboardStorageMode }[] = [
  { value: 'inline', label: 'Inline' },
  { value: 'remote', label: 'Remote' },
  { value: 'delta', label: 'Delta' },
];

export interface WhiteboardOptionsMenuProps {
  onCopy: () => void;
  onExport: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  storage?: {
    mode: WhiteboardStorageMode;
    onModeChange: (mode: WhiteboardStorageMode) => void;
    onRefChange: (value: string) => void;
    refValue: string;
  };
}

export const WhiteboardOptionsMenu: FC<WhiteboardOptionsMenuProps> = ({
  onCopy,
  onExport,
  onOpenChange,
  open,
  storage,
}) => {
  const id = useId();
  const storageLabelId = `${id}-storage`;
  const refId = `${id}-ref`;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <ActionButton icon aria-label="More options" size="md" title="More options">
            <Ellipsis />
          </ActionButton>
        }
      />
      <PopoverPanel flush align="end" side="bottom" size="md">
        <PopoverBody>
          <div className={css.whiteboardOptionsActions}>
            <ActionButton size="md" variant="outline" onClick={onCopy}>
              <Clipboard />
              Copy JSON
            </ActionButton>
            <ActionButton size="md" variant="outline" onClick={onExport}>
              <Download />
              Export JSON
            </ActionButton>
          </div>
        </PopoverBody>
        {storage && (
          <PopoverBody className={css.whiteboardOptionsAdvanced}>
            <span className={css.whiteboardOptionsHeading}>Advanced</span>
            <div
              aria-labelledby={storageLabelId}
              className={css.whiteboardOptionsGroup}
              role="group"
            >
              <span className={css.whiteboardOptionsLabel} id={storageLabelId}>
                Storage
              </span>
              <SegmentedControl
                fullWidth
                items={STORAGE_ITEMS}
                value={storage.mode}
                onChange={storage.onModeChange}
              />
            </div>
            {storage.mode !== 'inline' && (
              <Field id={refId} label="Base URL or ref">
                <TextInput
                  mono
                  id={refId}
                  placeholder="https://… or ref:file/…"
                  spellCheck={false}
                  value={storage.refValue}
                  onChange={(event) => storage.onRefChange(event.target.value)}
                />
              </Field>
            )}
          </PopoverBody>
        )}
      </PopoverPanel>
    </Popover>
  );
};
