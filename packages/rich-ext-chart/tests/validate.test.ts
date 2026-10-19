import { describe, expect, it } from 'vitest';

import type { ChartIssue } from '../src/types';
import { parseChartSource, validateChartSpec } from '../src/validate';

const validBar = {
  version: 1,
  type: 'bar',
  title: 'Commits',
  x: 'component',
  series: [
    { key: 'before', label: 'Before' },
    { key: 'after', label: 'After' },
  ],
  data: [
    { component: 'Editor', before: 48, after: 12 },
    { component: 'Toolbar', before: 36, after: 9 },
  ],
};

function issuesOf(input: unknown): ChartIssue[] {
  const result = validateChartSpec(input);
  if (result.ok) throw new Error('expected validation to fail');
  return result.issues;
}

describe('validateChartSpec', () => {
  it('accepts a valid spec and pins version to 1', () => {
    const result = validateChartSpec({ ...validBar, version: undefined });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.spec.version).toBe(1);
      expect(result.spec.series).toHaveLength(2);
    }
  });

  it('rejects an unsupported chart type with a hint', () => {
    const issues = issuesOf({ ...validBar, type: 'scatter' });
    expect(issues).toHaveLength(1);
    expect(issues[0].path).toBe('type');
    expect(issues[0].hint).toContain('bar, line, area, pie');
  });

  it('reports a series key that no row has', () => {
    const issues = issuesOf({
      ...validBar,
      series: [{ key: 'before' }, { key: 'missing' }],
    });
    expect(issues).toEqual([
      expect.objectContaining({
        path: 'series[1].key',
        message: 'is "missing", but no row has that field',
        hint: 'Fields present in data: "component", "before", "after"',
      }),
    ]);
  });

  it('hints to move the unit out of a numeric string', () => {
    const issues = issuesOf({
      ...validBar,
      data: [{ component: 'Editor', before: '48ms', after: 12 }],
    });
    expect(issues).toEqual([
      expect.objectContaining({
        path: 'data[0].before',
        message: 'must be a number, got "48ms"',
        hint: 'Write the bare number and put the unit in format.unit',
      }),
    ]);
  });

  it('caps the number of series at six', () => {
    const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const issues = issuesOf({
      version: 1,
      type: 'line',
      x: 'month',
      series: keys.map((key) => ({ key })),
      data: [Object.fromEntries([['month', 'Jan'], ...keys.map((k) => [k, 1])])],
    });
    expect(issues).toEqual([
      expect.objectContaining({
        path: 'series',
        message: expect.stringContaining('has 7 entries'),
      }),
    ]);
  });

  it('rejects a negative pie slice', () => {
    const issues = issuesOf({
      version: 1,
      type: 'pie',
      x: 'group',
      series: [{ key: 'share' }],
      data: [
        { group: 'A', share: 70 },
        { group: 'B', share: -5 },
      ],
    });
    expect(issues).toEqual([
      expect.objectContaining({
        path: 'data[1].share',
        message: expect.stringContaining('negative'),
      }),
    ]);
  });

  it('rejects a non-object root', () => {
    expect(issuesOf([validBar])[0]).toMatchObject({ path: '(root)', message: 'must be an object' });
  });
});

describe('parseChartSource', () => {
  it('parses and validates a JSON string', () => {
    expect(parseChartSource(JSON.stringify(validBar)).ok).toBe(true);
  });

  it('reports invalid JSON at the root', () => {
    const result = parseChartSource('{"type": "bar",');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0].path).toBe('(root)');
      expect(result.issues[0].message).toMatch(/^is not valid JSON/);
    }
  });

  it('reports an empty source as invalid JSON', () => {
    const result = parseChartSource('');
    expect(result.ok).toBe(false);
  });
});
