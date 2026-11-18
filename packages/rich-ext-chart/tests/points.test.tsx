// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { ChartView } from '../src/ChartView';
import type { ChartPoint, ChartSpec } from '../src/types';
import { validateChartSpec } from '../src/validate';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;
let host: HTMLElement;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  host?.remove();
});

function render(spec: ChartSpec, onPointClick = vi.fn(), onPointHover = vi.fn()) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root!.render(
      <ChartView hideToggle spec={spec} onPointClick={onPointClick} onPointHover={onPointHover} />,
    ),
  );
  return { onPointClick, onPointHover };
}

const hit = (id: string) => host.querySelector(`[data-point="${id}"]`) as SVGElement;
const click = (id: string) =>
  act(() => hit(id).dispatchEvent(new MouseEvent('click', { bubbles: true })));
const enter = (id: string) =>
  act(() =>
    hit(id).dispatchEvent(
      new PointerEvent('pointerover', { bubbles: true, relatedTarget: document.body }),
    ),
  );

const rows = [
  { day: 'Nov 1', commits: 3, releases: 1 },
  { day: 'Nov 2', commits: 5, releases: 0 },
];
const base = {
  version: 1 as const,
  x: 'day',
  data: rows,
  series: [{ key: 'commits' }, { key: 'releases' }],
};

describe('points', () => {
  it('a bar is a point of its series at its category', () => {
    const { onPointClick, onPointHover } = render({ ...base, type: 'bar' });
    click('commits:1');
    enter('releases:0');
    const expected: ChartPoint = { series: 'commits', x: 'Nov 2', value: 5, index: 1 };
    expect(onPointClick).toHaveBeenCalledWith(expected);
    expect(onPointHover).toHaveBeenCalledWith({
      series: 'releases',
      x: 'Nov 1',
      value: 1,
      index: 0,
    });
  });

  it('a stacked bar segment and a line or area vertex are points too', () => {
    const stacked = render({ ...base, type: 'bar', stacked: true });
    click('releases:0');
    expect(stacked.onPointClick).toHaveBeenCalledWith({
      series: 'releases',
      x: 'Nov 1',
      value: 1,
      index: 0,
    });
    act(() => root!.unmount());
    host.remove();
    for (const type of ['line', 'area'] as const) {
      const line = render({ ...base, type });
      click('commits:0');
      expect(line.onPointClick).toHaveBeenCalledWith({
        series: 'commits',
        x: 'Nov 1',
        value: 3,
        index: 0,
      });
      act(() => root!.unmount());
      host.remove();
    }
    root = null;
  });

  it('a pie slice is a point of the only series', () => {
    const { onPointClick } = render({ ...base, type: 'pie', series: [{ key: 'commits' }] });
    click('commits:1');
    expect(onPointClick).toHaveBeenCalledWith({
      series: 'commits',
      x: 'Nov 2',
      value: 5,
      index: 1,
    });
  });

  it('leaving a point says so', () => {
    const { onPointHover } = render({ ...base, type: 'bar' });
    enter('commits:0');
    act(() =>
      hit('commits:0').dispatchEvent(
        new PointerEvent('pointerout', { bubbles: true, relatedTarget: document.body }),
      ),
    );
    expect(onPointHover).toHaveBeenLastCalledWith(null);
  });
});

describe('scatter', () => {
  const scatter: ChartSpec = {
    version: 1,
    type: 'scatter',
    x: 'files',
    xLabel: 'Files changed',
    series: [{ key: 'minutes', label: 'Review minutes' }],
    data: [
      { files: 2, minutes: 10 },
      { files: 14, minutes: 45 },
      { files: 30, minutes: null },
    ],
  };

  it('needs numbers on both axes', () => {
    expect(validateChartSpec(scatter).ok).toBe(true);
    const bad = validateChartSpec({ ...scatter, data: [{ files: 'two', minutes: 1 }] });
    expect(bad.ok).toBe(false);
    if (!bad.ok)
      expect(bad.issues).toContainEqual(
        expect.objectContaining({
          path: 'data[0].files',
          message: 'must be a number on a scatter x axis, got "two"',
        }),
      );
  });

  it('draws one dot per row and series with a value, each a point', () => {
    const { onPointClick } = render(scatter);
    expect(host.querySelectorAll('[data-point]')).toHaveLength(4);
    click('minutes:1');
    expect(onPointClick).toHaveBeenCalledWith({ series: 'minutes', x: 14, value: 45, index: 1 });
    expect(host.querySelector('[role="img"]')!.getAttribute('aria-label')).toContain(
      'Scatter chart',
    );
  });
});
