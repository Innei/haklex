import { scaleLinear } from '@visx/scale';

import { estimateTextWidth, formatTick } from './format';
import { chartVars, seriesColors } from './palette.css';
import type { ChartFormat, ChartRow, ChartSpec } from './types';

export interface ChartLayout {
  compact: boolean;
  height: number;
  width: number;
}

export const WIDE_LAYOUT: ChartLayout = { width: 720, height: 300, compact: false };
export const COMPACT_LAYOUT: ChartLayout = { width: 340, height: 240, compact: true };

export const MARGIN_TOP = 12;
export const MARGIN_RIGHT = 8;

export interface YAxis {
  domain: [number, number];
  labels: string[];
  ticks: number[];
  width: number;
}

export function buildYAxis(
  min: number,
  max: number,
  format: ChartFormat | undefined,
  compact: boolean,
  bounds?: { min?: number; max?: number },
): YAxis {
  const lo = Math.min(0, bounds?.min ?? min);
  const hi = Math.max(0, bounds?.max ?? max);
  const scale = scaleLinear<number>({
    domain: [lo, hi === lo ? lo + 1 : hi],
    nice: compact ? 3 : 4,
  });
  const ticks = scale.ticks(compact ? 3 : 4);
  const domain = scale.domain() as [number, number];
  const labels = ticks.map((t, i) => formatTick(t, format, i === ticks.length - 1));
  const width = Math.max(...labels.map((l) => estimateTextWidth(l, 11))) + 12;
  return { ticks, domain, width, labels };
}

export function rowNumber(row: ChartRow, key: string): number | null {
  const v = row[key];
  return typeof v === 'number' ? v : null;
}

export function rowLabel(row: ChartRow, x: string): string {
  const v = row[x];
  return v == null ? '' : String(v);
}

export function seriesColor(spec: ChartSpec, index: number): string {
  const s = spec.series[index];
  if (spec.highlight && spec.type !== 'pie' && s.key !== spec.highlight) return chartVars.muted;
  const slot = s.color != null ? s.color - 1 : index;
  return seriesColors[((slot % seriesColors.length) + seriesColors.length) % seriesColors.length];
}

export function seriesName(spec: ChartSpec, index: number): string {
  const s = spec.series[index];
  return s.label || s.key;
}

export function barPath(x: number, w: number, base: number, end: number, radius: number): string {
  const h = Math.abs(end - base);
  const r = Math.min(radius, w / 2, h);
  if (end <= base) {
    return `M${x},${base}V${end + r}Q${x},${end} ${x + r},${end}H${x + w - r}Q${x + w},${end} ${x + w},${end + r}V${base}Z`;
  }
  return `M${x},${base}V${end - r}Q${x},${end} ${x + r},${end}H${x + w - r}Q${x + w},${end} ${x + w},${end - r}V${base}Z`;
}

export function describeChart(spec: ChartSpec): string {
  const kind = {
    area: 'Area chart',
    bar: spec.stacked ? 'Stacked bar chart' : 'Bar chart',
    line: 'Line chart',
    pie: spec.donut ? 'Donut chart' : 'Pie chart',
  }[spec.type];
  const names = spec.series.map((s) => s.label || s.key).join(', ');
  const head = spec.title ? `${spec.title}. ` : '';
  return `${head}${kind} with ${spec.data.length} ${spec.type === 'pie' ? 'slices' : 'categories'}; series: ${names}.`;
}
