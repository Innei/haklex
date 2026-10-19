export type ChartType = 'bar' | 'line' | 'area' | 'pie';

export type ChartValue = string | number | null;

export type ChartRow = Record<string, ChartValue>;

export interface ChartSeries {
  color?: number;
  key: string;
  label?: string;
}

export interface ChartFormat {
  compact?: boolean;
  decimals?: number;
  signed?: boolean;
  unit?: string;
}

export interface ChartReferenceLine {
  label: string;
  y: number;
}

export interface ChartSpec {
  data: ChartRow[];
  donut?: boolean;
  format?: ChartFormat;
  highlight?: string;
  note?: string;
  refs?: ChartReferenceLine[];
  series: ChartSeries[];
  source?: string;
  stacked?: boolean;
  subtitle?: string;
  title?: string;
  type: ChartType;
  version: 1;
  x: string;
  xLabel?: string;
  y?: { min?: number; max?: number };
}

export interface ChartIssue {
  hint?: string;
  message: string;
  path: string;
}

export type ChartValidationResult =
  { ok: true; spec: ChartSpec } | { ok: false; issues: ChartIssue[] };

export const CHART_TYPES: readonly ChartType[] = ['bar', 'line', 'area', 'pie'];

export const CHART_PALETTE_SIZE = 6;
