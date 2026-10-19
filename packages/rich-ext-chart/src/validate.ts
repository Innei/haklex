import type { ChartIssue, ChartSpec, ChartValidationResult } from './types';
import { CHART_PALETTE_SIZE, CHART_TYPES } from './types';

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const describe = (v: unknown) => (typeof v === 'string' ? `"${v}"` : JSON.stringify(v));

export function parseChartSource(source: string): ChartValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    return {
      ok: false,
      issues: [
        {
          path: '(root)',
          message: `is not valid JSON: ${(error as Error).message}`,
          hint: 'The <chart> body must be one JSON object inside CDATA',
        },
      ],
    };
  }
  return validateChartSpec(parsed);
}

export function validateChartSpec(input: unknown): ChartValidationResult {
  const issues: ChartIssue[] = [];
  if (!isRecord(input)) {
    return { ok: false, issues: [{ path: '(root)', message: 'must be an object' }] };
  }
  const { type, x, series, data } = input;

  if (!CHART_TYPES.includes(type as never)) {
    issues.push({
      path: 'type',
      message: `is ${describe(type)}, which is not supported`,
      hint: `Use one of: ${CHART_TYPES.join(', ')}`,
    });
  }
  if (typeof x !== 'string' || !x) {
    issues.push({ path: 'x', message: 'must name the field used for categories' });
  }
  if (!Array.isArray(series) || series.length === 0) {
    issues.push({ path: 'series', message: 'must be a non-empty array of { key, label? }' });
  }
  if (!Array.isArray(data)) {
    issues.push({ path: 'data', message: 'must be an array of rows' });
  }
  if (issues.some((i) => i.path !== 'type')) return { ok: false, issues };

  const rows = data as unknown[];
  const seriesList = series as unknown[];
  const fields = new Set<string>();
  rows.forEach((row, i) => {
    if (!isRecord(row)) {
      issues.push({ path: `data[${i}]`, message: 'must be an object' });
      return;
    }
    for (const k of Object.keys(row)) fields.add(k);
  });

  if (seriesList.length > CHART_PALETTE_SIZE) {
    issues.push({
      path: 'series',
      message: `has ${seriesList.length} entries; at most ${CHART_PALETTE_SIZE} are allowed`,
      hint: 'Merge the smallest series into one named "Other", or split into several charts',
    });
  }
  if (type === 'pie' && rows.length > CHART_PALETTE_SIZE) {
    issues.push({
      path: 'data',
      message: `has ${rows.length} slices; a pie allows at most ${CHART_PALETTE_SIZE}`,
      hint: 'Merge the smallest slices into one row named "Other"',
    });
  }

  const known = [...fields].map((f) => `"${f}"`).join(', ') || '(none)';
  if (rows.length > 0 && !fields.has(x as string)) {
    issues.push({
      path: 'x',
      message: `is ${describe(x)}, but no row has that field`,
      hint: `Fields present in data: ${known}`,
    });
  }

  const keys: string[] = [];
  seriesList.forEach((s, j) => {
    if (!isRecord(s) || typeof s.key !== 'string' || !s.key) {
      issues.push({ path: `series[${j}]`, message: 'must be { key: string, label?: string }' });
      return;
    }
    keys.push(s.key);
    if (rows.length > 0 && !fields.has(s.key)) {
      issues.push({
        path: `series[${j}].key`,
        message: `is ${describe(s.key)}, but no row has that field`,
        hint: `Fields present in data: ${known}`,
      });
    }
  });

  rows.forEach((row, i) => {
    if (!isRecord(row)) return;
    for (const key of keys) {
      const v = row[key];
      if (v === null || v === undefined) continue;
      if (typeof v !== 'number' || !Number.isFinite(v)) {
        issues.push({
          path: `data[${i}].${key}`,
          message: `must be a number, got ${describe(v)}`,
          hint:
            typeof v === 'string' && /\d/.test(v)
              ? 'Write the bare number and put the unit in format.unit'
              : undefined,
        });
      }
    }
  });

  if (type === 'pie') {
    const key = keys[0];
    rows.forEach((row, i) => {
      if (isRecord(row) && typeof row[key] === 'number' && (row[key] as number) < 0) {
        issues.push({ path: `data[${i}].${key}`, message: 'is negative; pie slices must be ≥ 0' });
      }
    });
  }

  if (input.highlight !== undefined && typeof input.highlight !== 'string') {
    issues.push({ path: 'highlight', message: 'must be a string' });
  } else if (
    typeof input.highlight === 'string' &&
    type !== 'pie' &&
    !keys.includes(input.highlight)
  ) {
    issues.push({
      path: 'highlight',
      message: `is ${describe(input.highlight)}, which is not a series key`,
      hint: `Series keys: ${keys.map((k) => `"${k}"`).join(', ')}`,
    });
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, spec: { ...(input as unknown as ChartSpec), version: 1 } };
}
