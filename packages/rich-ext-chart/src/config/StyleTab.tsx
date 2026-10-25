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
          <label className={s.field} key={key}>
            <span className={s.fieldLabel}>{label}</span>
            <CommitInput
              className={s.input}
              placeholder="Optional"
              value={typeof draft[key] === 'string' ? draft[key] : ''}
              onCommit={(value) => onChange(patchDraft(draft, { [key]: value }))}
            />
          </label>
        ))}
      </div>
      {draft.type !== 'pie' && (
        <div className={s.pair}>
          <label className={s.field}>
            <span className={s.fieldLabel}>Y min</span>
            <CommitInput
              className={s.input}
              inputMode="decimal"
              placeholder="Auto"
              value={numberText(y.min)}
              onCommit={(raw) => commitNumber('y', 'min', raw)}
            />
          </label>
          <label className={s.field}>
            <span className={s.fieldLabel}>Y max</span>
            <CommitInput
              className={s.input}
              inputMode="decimal"
              placeholder="Auto"
              value={numberText(y.max)}
              onCommit={(raw) => commitNumber('y', 'max', raw)}
            />
          </label>
        </div>
      )}
      <div className={s.pair}>
        <label className={s.field}>
          <span className={s.fieldLabel}>Unit</span>
          <CommitInput
            className={s.input}
            placeholder="e.g. %"
            value={typeof format.unit === 'string' ? format.unit : ''}
            onCommit={(unit) => onChange(patchNested(draft, 'format', { unit }))}
          />
        </label>
        <label className={s.field}>
          <span className={s.fieldLabel}>Decimals</span>
          <CommitInput
            className={s.input}
            inputMode="numeric"
            placeholder="Auto"
            value={numberText(format.decimals)}
            onCommit={(raw) => commitNumber('format', 'decimals', raw, isDecimals)}
          />
        </label>
      </div>
      {canStack && (
        <label className={s.check}>
          <input
            checked={draft.stacked === true}
            className={s.checkbox}
            type="checkbox"
            onChange={(event) =>
              onChange(patchDraft(draft, { stacked: event.target.checked || undefined }))
            }
          />
          <span>Stacked</span>
        </label>
      )}
      {draft.type === 'pie' && (
        <label className={s.check}>
          <input
            checked={draft.donut === true}
            className={s.checkbox}
            type="checkbox"
            onChange={(event) =>
              onChange(patchDraft(draft, { donut: event.target.checked || undefined }))
            }
          />
          <span>Donut</span>
        </label>
      )}
    </>
  );
}
