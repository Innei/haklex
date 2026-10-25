import type { ChartRow, ChartSeries, ChartSpec } from '../types';
import { CHART_PALETTE_SIZE } from '../types';

export type ChartDraft = Partial<Omit<ChartSpec, 'data' | 'series'>> & {
  [key: string]: unknown;
  data: ChartRow[];
  series: ChartSeries[];
};

type NestedKey = 'format' | 'y';

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isEmpty = (v: unknown) => v === undefined || v === '';

export function parseChartDraft(source: string): ChartDraft | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return null;
  }
  if (!isRecord(parsed)) return null;
  const series = Array.isArray(parsed.series) ? parsed.series : [];
  const data = Array.isArray(parsed.data) ? parsed.data : [];
  return {
    ...parsed,
    series: series.flatMap((item): ChartSeries[] => {
      if (typeof item === 'string') return [{ key: item }];
      return isRecord(item) && typeof item.key === 'string' ? [item as unknown as ChartSeries] : [];
    }),
    data: data.filter(isRecord) as ChartRow[],
  };
}

export function serializeChartDraft(draft: ChartDraft): string {
  return JSON.stringify(draft);
}

export function patchDraft(draft: ChartDraft, patch: Partial<ChartDraft>): ChartDraft {
  const next: ChartDraft = { ...draft };
  for (const [key, value] of Object.entries(patch)) {
    if (isEmpty(value)) delete next[key];
    else next[key] = value;
  }
  return next;
}

export function patchNested(
  draft: ChartDraft,
  key: NestedKey,
  patch: Record<string, unknown>,
): ChartDraft {
  const nested: Record<string, unknown> = isRecord(draft[key]) ? { ...draft[key] } : {};
  for (const [k, value] of Object.entries(patch)) {
    if (isEmpty(value)) delete nested[k];
    else nested[k] = value;
  }
  const next: ChartDraft = { ...draft };
  if (Object.keys(nested).length === 0) delete next[key];
  else next[key] = nested;
  return next;
}

export function dataFields(draft: ChartDraft): string[] {
  const fields = new Set<string>();
  for (const row of draft.data) {
    if (isRecord(row)) for (const key of Object.keys(row)) fields.add(key);
  }
  return [...fields];
}

function usedNames(draft: ChartDraft): Set<string> {
  const names = new Set(dataFields(draft));
  if (draft.x) names.add(draft.x);
  for (const s of draft.series) names.add(s.key);
  return names;
}

export function renameField(draft: ChartDraft, from: string, to: string): ChartDraft {
  const name = to.trim();
  if (!name || name === from || usedNames(draft).has(name)) return draft;
  const swap = (key: string) => (key === from ? name : key);
  const next: ChartDraft = {
    ...draft,
    series: draft.series.map((s) => (s.key === from ? { ...s, key: name } : s)),
    data: draft.data.map((row) =>
      Object.fromEntries(Object.entries(row).map(([key, value]) => [swap(key), value])),
    ),
  };
  if (draft.x === from) next.x = name;
  if (draft.highlight === from) next.highlight = name;
  return next;
}

export function addSeries(draft: ChartDraft): ChartDraft {
  if (draft.series.length >= CHART_PALETTE_SIZE) return draft;
  const names = usedNames(draft);
  let n = draft.series.length + 1;
  while (names.has(`series${n}`)) n++;
  const key = `series${n}`;
  const usedColors = new Set(draft.series.map((s, i) => s.color ?? i + 1));
  let color = 1;
  while (usedColors.has(color) && color < CHART_PALETTE_SIZE) color++;
  return {
    ...draft,
    series: [...draft.series, { key, label: `Series ${n}`, color }],
    data: draft.data.map((row) => ({ ...row, [key]: null })),
  };
}

export function removeSeries(draft: ChartDraft, key: string): ChartDraft {
  const next: ChartDraft = {
    ...draft,
    series: draft.series.filter((s) => s.key !== key),
    data: draft.data.map((row) => {
      const { [key]: _removed, ...rest } = row;
      return rest;
    }),
  };
  if (next.highlight === key) delete next.highlight;
  return next;
}

export function addRow(draft: ChartDraft): ChartDraft {
  const row: ChartRow = { [draft.x ?? '']: '' };
  for (const s of draft.series) row[s.key] = null;
  return { ...draft, data: [...draft.data, row] };
}

export function removeRow(draft: ChartDraft, index: number): ChartDraft {
  return { ...draft, data: draft.data.filter((_, i) => i !== index) };
}

export function parseCellNumber(raw: string): number | null | undefined {
  const text = raw.trim().replaceAll(',', '');
  if (!text) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : undefined;
}

export function setCell(draft: ChartDraft, index: number, key: string, raw: string): ChartDraft {
  let value: string | number | null;
  if (key === draft.x) {
    value = raw;
  } else {
    const parsed = parseCellNumber(raw);
    if (parsed === undefined) return draft;
    value = parsed;
  }
  return {
    ...draft,
    data: draft.data.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
  };
}
