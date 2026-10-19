import type { ChartFormat } from './types';

const COMPACT_STEPS: [number, string][] = [
  [1e9, 'B'],
  [1e6, 'M'],
  [1e3, 'k'],
];

const PREFIX_UNITS = new Set(['$', '¥', '€', '£']);
const ATTACHED_UNITS = new Set(['%', '×', 'x']);

export function formatChartValue(
  value: number | null | undefined,
  format: ChartFormat = {},
): string {
  if (value == null || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  let body: string;
  const step = format.compact !== false ? COMPACT_STEPS.find(([d]) => abs >= d) : undefined;
  if (step) {
    const q = abs / step[0];
    body = (q < 10 ? q.toFixed(1) : String(Math.round(q))).replace(/\.0$/, '') + step[1];
  } else if (format.decimals != null) {
    body = abs.toFixed(format.decimals);
  } else {
    body = String(+abs.toFixed(2));
  }
  const sign = value < 0 ? '−' : format.signed && value > 0 ? '+' : '';
  const { unit } = format;
  if (!unit) return sign + body;
  if (PREFIX_UNITS.has(unit)) return sign + unit + body;
  if (ATTACHED_UNITS.has(unit)) return sign + body + unit;
  return `${sign}${body} ${unit}`;
}

export function formatTick(value: number, format: ChartFormat = {}, withUnit = false): string {
  return formatChartValue(value, {
    ...format,
    signed: false,
    unit: withUnit ? format.unit : undefined,
  });
}

export function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const ch of text) width += ch.charCodeAt(0) > 0x2E80 ? fontSize : fontSize * 0.58;
  return width;
}
