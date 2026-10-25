import { SegmentedControl } from '@haklex/rich-editor-ui';
import { useMemo, useState } from 'react';

import * as s from './config.css';
import { DataTab } from './DataTab';
import { SetupTab } from './SetupTab';
import type { ChartDraft } from './spec-edit';
import { parseChartDraft, serializeChartDraft } from './spec-edit';
import { StyleTab } from './StyleTab';

type ConfigTab = 'data' | 'setup' | 'style';

const TAB_ITEMS = [
  { value: 'setup' as const, label: 'Setup' },
  { value: 'data' as const, label: 'Data' },
  { value: 'style' as const, label: 'Style' },
];

export interface ChartTabProps {
  draft: ChartDraft;
  onChange: (draft: ChartDraft) => void;
}

export interface ChartConfigPanelProps {
  onChange: (spec: string) => void;
  spec: string;
}

export function ChartConfigPanel({ spec, onChange }: ChartConfigPanelProps) {
  const [tab, setTab] = useState<ConfigTab>('setup');
  const draft = useMemo(() => parseChartDraft(spec), [spec]);

  if (!draft) {
    return (
      <div className={s.panel}>
        <p className={s.notice}>
          Chart spec is not valid JSON, so it can&apos;t be edited here. Check it under Raw data.
        </p>
      </div>
    );
  }

  const handleChange = (next: ChartDraft) => onChange(serializeChartDraft(next));
  const Tab = tab === 'setup' ? SetupTab : tab === 'data' ? DataTab : StyleTab;

  return (
    <div className={s.panel}>
      <div className={s.tabs}>
        <SegmentedControl fullWidth items={TAB_ITEMS} value={tab} onChange={setTab} />
      </div>
      <div className={s.body}>
        <Tab draft={draft} onChange={handleChange} />
      </div>
    </div>
  );
}
