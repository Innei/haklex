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

export type ExcalidrawStorageMode = 'inline' | 'remote' | 'delta';

const STORAGE_ITEMS: { label: string; value: ExcalidrawStorageMode }[] = [
  { value: 'inline', label: 'Inline' },
  { value: 'remote', label: 'Remote' },
  { value: 'delta', label: 'Delta' },
];

export interface ExcalidrawOptionsMenuProps {
  onCopy: () => void;
  onExport: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  storage?: {
    mode: ExcalidrawStorageMode;
    onModeChange: (mode: ExcalidrawStorageMode) => void;
    onRefChange: (value: string) => void;
    refValue: string;
  };
}

export const ExcalidrawOptionsMenu: FC<ExcalidrawOptionsMenuProps> = ({
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
          <div className={css.excalidrawOptionsActions}>
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
          <PopoverBody className={css.excalidrawOptionsAdvanced}>
            <span className={css.excalidrawOptionsHeading}>Advanced</span>
            <div
              aria-labelledby={storageLabelId}
              className={css.excalidrawOptionsGroup}
              role="group"
            >
              <span className={css.excalidrawOptionsLabel} id={storageLabelId}>
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
