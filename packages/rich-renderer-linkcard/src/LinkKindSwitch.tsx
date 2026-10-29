import { SegmentedControl } from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';

import * as styles from './edit.css';

export type LinkKind = 'link' | 'card';

const ITEMS: { label: string; value: LinkKind }[] = [
  { label: 'Link', value: 'link' },
  { label: 'Card', value: 'card' },
];

export interface LinkKindSwitchProps {
  onChange: (kind: LinkKind) => void;
  value: LinkKind;
}

export function LinkKindSwitch({ value, onChange }: LinkKindSwitchProps): ReactElement {
  return (
    <SegmentedControl
      fullWidth
      className={styles.kindSwitch}
      items={ITEMS}
      value={value}
      onChange={(next) => {
        if (next !== value) onChange(next);
      }}
    />
  );
}
