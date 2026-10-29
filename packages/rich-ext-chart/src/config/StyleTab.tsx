import { AnimatedCheckbox, Field } from '@haklex/rich-editor-ui';
import { useId } from 'react';

import type { ChartTabProps } from './ChartConfigPanel';
import { CommitInput } from './CommitInput';
import * as s from './config.css';
import type { ChartDraft } from './spec-edit';
import { parseCellNumber, patchDraft, patchNested } from './spec-edit';

type TextKey = 'note' | 'source' | 'subtitle' | 'xLabel';

const TEXT_FIELDS: { key: TextKey; label: string }[] = [
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'source', label: 'Source' },
  { key: 'xLabel', label: 'X axis label' },
  { key: 'note', label: 'Note' },
];

const MAX_DECIMALS = 10;

const isDecimals = (value: number) =>
  Number.isInteger(value) && value >= 0 && value <= MAX_DECIMALS;

const numberText = (value: unknown) => (typeof value === 'number' ? String(value) : '');

function nested(draft: ChartDraft, key: 'format' | 'y'): Record<string, unknown> {
  const value = draft[key];
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

export function StyleTab({ draft, onChange }: ChartTabProps) {
  const id = useId();
  const y = nested(draft, 'y');
  const format = nested(draft, 'format');
  const canStack = (draft.type === 'bar' || draft.type === 'area') && draft.series.length > 1;

  const commitNumber = (
    key: 'format' | 'y',
    field: string,
    raw: string,
    accept: (value: number) => boolean = Number.isFinite,
  ) => {
    const value = parseCellNumber(raw);
    if (value === undefined || (value !== null && !accept(value))) return;
    onChange(patchNested(draft, key, { [field]: value ?? undefined }));
  };

  return (
    <>
      <div className={s.pair}>
        {TEXT_FIELDS.map(({ key, label }) => (
          <Field id={`${id}-${key}`} key={key} label={label}>
            <CommitInput
              id={`${id}-${key}`}
              placeholder="Optional"
              value={typeof draft[key] === 'string' ? draft[key] : ''}
              onCommit={(value) => onChange(patchDraft(draft, { [key]: value }))}
            />
          </Field>
        ))}
      </div>
      {draft.type !== 'pie' && (
        <div className={s.pair}>
          <Field id={`${id}-ymin`} label="Y min">
            <CommitInput
              id={`${id}-ymin`}
              inputMode="decimal"
              placeholder="Auto"
              value={numberText(y.min)}
              onCommit={(raw) => commitNumber('y', 'min', raw)}
            />
          </Field>
          <Field id={`${id}-ymax`} label="Y max">
            <CommitInput
              id={`${id}-ymax`}
              inputMode="decimal"
              placeholder="Auto"
              value={numberText(y.max)}
              onCommit={(raw) => commitNumber('y', 'max', raw)}
            />
          </Field>
        </div>
      )}
      <div className={s.pair}>
        <Field id={`${id}-unit`} label="Unit">
          <CommitInput
            id={`${id}-unit`}
            placeholder="e.g. %"
            value={typeof format.unit === 'string' ? format.unit : ''}
            onCommit={(unit) => onChange(patchNested(draft, 'format', { unit }))}
          />
        </Field>
        <Field id={`${id}-decimals`} label="Decimals">
          <CommitInput
            id={`${id}-decimals`}
            inputMode="numeric"
            placeholder="Auto"
            value={numberText(format.decimals)}
            onCommit={(raw) => commitNumber('format', 'decimals', raw, isDecimals)}
          />
        </Field>
      </div>
      {canStack && (
        <AnimatedCheckbox
          checked={draft.stacked === true}
          label="Stacked"
          onChange={(checked) => onChange(patchDraft(draft, { stacked: checked || undefined }))}
        />
      )}
      {draft.type === 'pie' && (
        <AnimatedCheckbox
          checked={draft.donut === true}
          label="Donut"
          onChange={(checked) => onChange(patchDraft(draft, { donut: checked || undefined }))}
        />
      )}
    </>
  );
}
