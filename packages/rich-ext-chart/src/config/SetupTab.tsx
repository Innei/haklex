import {
  ActionButton,
  Field,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@haklex/rich-editor-ui';
import { Plus, X } from 'lucide-react';
import { useId, useState } from 'react';

import { seriesColors } from '../palette.css';
import type { ChartSeries, ChartType } from '../types';
import { CHART_PALETTE_SIZE } from '../types';
import type { ChartTabProps } from './ChartConfigPanel';
import { CommitInput } from './CommitInput';
import * as s from './config.css';
import type { ChartDraft } from './spec-edit';
import { addSeries, dataFields, patchDraft, removeSeries, renameField } from './spec-edit';

const TYPE_ITEMS: { label: string; value: ChartType }[] = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
  { value: 'pie', label: 'Pie' },
];

export function SetupTab({ draft, onChange }: ChartTabProps) {
  const id = useId();
  const seriesKeys = new Set(draft.series.map((series) => series.key));
  const fields = dataFields(draft).filter((name) => name === draft.x || !seriesKeys.has(name));
  const xOptions = draft.x && !fields.includes(draft.x) ? [draft.x, ...fields] : fields;

  return (
    <>
      <div className={s.field}>
        <span className={s.fieldLabel} id={`${id}-type`}>
          Type
        </span>
        <div aria-labelledby={`${id}-type`} role="group">
          <SegmentedControl
            fullWidth
            items={TYPE_ITEMS}
            value={draft.type ?? 'bar'}
            onChange={(type) => onChange(patchDraft(draft, { type }))}
          />
        </div>
      </div>
      <Field id={`${id}-title`} label="Title">
        <CommitInput
          id={`${id}-title`}
          value={draft.title ?? ''}
          onCommit={(title) => onChange(patchDraft(draft, { title }))}
        />
      </Field>
      <Field id={`${id}-x`} label="Category field (x)">
        <Select
          disabled={xOptions.length === 0}
          value={draft.x ?? null}
          onValueChange={(x) => {
            if (typeof x === 'string') onChange(patchDraft(draft, { x }));
          }}
        >
          <SelectTrigger className={s.select} id={`${id}-x`}>
            <SelectValue placeholder="No data" />
          </SelectTrigger>
          <SelectContent>
            {xOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className={s.field}>
        <span className={s.fieldLabel}>Series</span>
        {draft.series.map((series, index) => (
          <SeriesRow draft={draft} index={index} key={index} series={series} onChange={onChange} />
        ))}
        <ActionButton
          disabled={draft.series.length >= CHART_PALETTE_SIZE}
          size="md"
          variant="outline"
          onClick={() => onChange(addSeries(draft))}
        >
          <Plus />
          Add series
        </ActionButton>
      </div>
    </>
  );
}

interface SeriesRowProps extends ChartTabProps {
  index: number;
  series: ChartSeries;
}

function SeriesRow({ draft, index, series, onChange }: SeriesRowProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const n = index + 1;
  const color = series.color ?? n;

  const setSeries = (patch: Partial<ChartSeries>) => {
    const next: ChartDraft = {
      ...draft,
      series: draft.series.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    };
    onChange(next);
  };

  return (
    <>
      <div className={s.seriesRow}>
        <button
          aria-expanded={paletteOpen}
          aria-label={`Series ${n} color`}
          className={s.swatchButton}
          type="button"
          onClick={() => setPaletteOpen(!paletteOpen)}
        >
          <span
            className={s.swatch}
            style={{
              background: seriesColors[(color - 1 + CHART_PALETTE_SIZE) % CHART_PALETTE_SIZE],
            }}
          />
        </button>
        <CommitInput
          mono
          aria-label={`Series ${n} key`}
          className={s.seriesKey}
          value={series.key}
          onCommit={(key) => onChange(renameField(draft, series.key, key))}
        />
        <CommitInput
          aria-label={`Series ${n} label`}
          className={s.seriesLabel}
          placeholder={series.key}
          value={series.label ?? ''}
          onCommit={(label) => setSeries({ label: label || undefined })}
        />
        <ActionButton
          icon
          aria-label={`Remove series ${n}`}
          disabled={draft.series.length <= 1}
          size="md"
          onClick={() => onChange(removeSeries(draft, series.key))}
        >
          <X />
        </ActionButton>
      </div>
      {paletteOpen && (
        <div className={s.palette}>
          {seriesColors.map((swatchColor, i) => (
            <button
              aria-label={`Color ${i + 1}`}
              aria-pressed={color === i + 1}
              className={s.paletteOption}
              key={swatchColor}
              type="button"
              onClick={() => {
                setSeries({ color: i + 1 });
                setPaletteOpen(false);
              }}
            >
              <span className={s.swatch} style={{ background: swatchColor }} />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
