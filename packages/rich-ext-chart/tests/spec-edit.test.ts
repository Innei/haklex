import { describe, expect, it } from 'vitest';

import {
  addRow,
  addSeries,
  type ChartDraft,
  dataFields,
  parseChartDraft,
  patchDraft,
  patchNested,
  removeRow,
  removeSeries,
  renameField,
  serializeChartDraft,
  setCell,
} from '../src/config/spec-edit';
import { validateChartSpec } from '../src/validate';

const base = (): ChartDraft => ({
  version: 1,
  type: 'bar',
  title: 'Visits',
  x: 'month',
  highlight: 'visits',
  refs: [{ y: 100, label: 'Goal' }],
  series: [{ key: 'visits', label: 'Visits', color: 1 }],
  data: [
    { month: 'Jan', visits: 120 },
    { month: 'Feb', visits: 160 },
  ],
});

describe('parseChartDraft', () => {
  it('keeps unknown fields and fills missing arrays', () => {
    const draft = parseChartDraft('{"type":"line","x":"k","custom":true}');
    expect(draft).toEqual({ type: 'line', x: 'k', custom: true, series: [], data: [] });
  });

  it('drops rows that are not objects and normalizes string series', () => {
    const draft = parseChartDraft(
      '{"x":"k","series":["a",{"key":"b"},null],"data":[{"k":"x","a":1},null,3]}',
    );
    expect(draft?.series).toEqual([{ key: 'a' }, { key: 'b' }]);
    expect(draft?.data).toEqual([{ k: 'x', a: 1 }]);
  });

  it('returns null for invalid JSON or a non-object', () => {
    expect(parseChartDraft('{"type"')).toBeNull();
    expect(parseChartDraft('[1,2]')).toBeNull();
    expect(parseChartDraft('')).toBeNull();
  });

  it('round-trips through serializeChartDraft', () => {
    const draft = base();
    expect(parseChartDraft(serializeChartDraft(draft))).toEqual(draft);
  });
});

describe('patchDraft', () => {
  it('sets values and removes keys patched to undefined or empty string', () => {
    const next = patchDraft(base(), { type: 'line', title: '', subtitle: 'Q1' });
    expect(next.type).toBe('line');
    expect(next.subtitle).toBe('Q1');
    expect('title' in next).toBe(false);
  });

  it('does not mutate the input', () => {
    const draft = base();
    patchDraft(draft, { title: 'Other' });
    expect(draft.title).toBe('Visits');
  });
});

describe('patchNested', () => {
  it('merges into the nested object and drops it once empty', () => {
    const withUnit = patchNested(base(), 'format', { unit: '%', decimals: 1 });
    expect(withUnit.format).toEqual({ unit: '%', decimals: 1 });
    const cleared = patchNested(withUnit, 'format', { unit: undefined, decimals: undefined });
    expect('format' in cleared).toBe(false);
  });
});

describe('renameField', () => {
  it('renames a series key across series, rows and highlight, keeping column order', () => {
    const next = renameField(base(), 'visits', 'views');
    expect(next.series[0].key).toBe('views');
    expect(next.highlight).toBe('views');
    expect(next.data[0]).toEqual({ month: 'Jan', views: 120 });
    expect(Object.keys(next.data[0])).toEqual(['month', 'views']);
  });

  it('renames the category field', () => {
    const next = renameField(base(), 'month', 'period');
    expect(next.x).toBe('period');
    expect(next.data[1]).toEqual({ period: 'Feb', visits: 160 });
  });

  it('rejects an empty or already used name', () => {
    const draft = base();
    expect(renameField(draft, 'visits', '  ')).toBe(draft);
    expect(renameField(draft, 'visits', 'month')).toBe(draft);
  });
});

describe('addSeries', () => {
  it('adds a uniquely keyed series with the next free color and a null cell per row', () => {
    const next = addSeries(base());
    expect(next.series[1]).toEqual({ key: 'series2', label: 'Series 2', color: 2 });
    expect(next.data.map((row) => row.series2)).toEqual([null, null]);
    expect(validateChartSpec(next).ok).toBe(true);
  });

  it('stops at the palette size', () => {
    let draft = base();
    for (let i = 0; i < 10; i++) draft = addSeries(draft);
    expect(draft.series).toHaveLength(6);
  });
});

describe('removeSeries', () => {
  it('drops the series, its cells and a highlight pointing at it', () => {
    const next = removeSeries(addSeries(base()), 'visits');
    expect(next.series.map((s) => s.key)).toEqual(['series2']);
    expect(next.data[0]).toEqual({ month: 'Jan', series2: null });
    expect('highlight' in next).toBe(false);
  });
});

describe('rows', () => {
  it('adds an empty row with every series key', () => {
    const next = addRow(base());
    expect(next.data[2]).toEqual({ month: '', visits: null });
  });

  it('removes a row by index', () => {
    expect(removeRow(base(), 0).data).toEqual([{ month: 'Feb', visits: 160 }]);
  });
});

describe('setCell', () => {
  it('stores the category cell as text', () => {
    expect(setCell(base(), 0, 'month', '2024-01').data[0].month).toBe('2024-01');
  });

  it('parses series cells as numbers and blank as null', () => {
    expect(setCell(base(), 0, 'visits', ' 1,250.5 ').data[0].visits).toBe(1250.5);
    expect(setCell(base(), 0, 'visits', '').data[0].visits).toBeNull();
  });

  it('ignores a series cell that is not a number', () => {
    const draft = base();
    expect(setCell(draft, 0, 'visits', '12abc')).toBe(draft);
  });
});

describe('dataFields', () => {
  it('lists every field present in rows, in first-seen order', () => {
    const draft = patchDraft(base(), { data: [{ month: 'Jan' }, { region: 'EU', month: 'Feb' }] });
    expect(dataFields(draft)).toEqual(['month', 'region']);
  });
});
