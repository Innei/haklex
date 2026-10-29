// @vitest-environment happy-dom
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ChartConfigPanel } from '../src/config/ChartConfigPanel';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

const SPEC = JSON.stringify({
  version: 1,
  type: 'bar',
  title: 'Visits',
  x: 'month',
  refs: [{ y: 150, label: 'Goal' }],
  series: [{ key: 'visits', label: 'Visits' }],
  data: [
    { month: 'Jan', visits: 120 },
    { month: 'Feb', visits: 160 },
  ],
});

let container: HTMLDivElement | null = null;
let root: Root | null = null;
let current = '';

function Harness({ initial }: { initial: string }) {
  const [spec, setSpec] = useState(initial);
  current = spec;
  return <ChartConfigPanel spec={spec} onChange={setSpec} />;
}

async function mount(spec = SPEC) {
  current = spec;
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root!.render(<Harness initial={spec} />));
  return container;
}

const spec = () => JSON.parse(current);

function button(el: HTMLElement, name: string) {
  const found = [...el.querySelectorAll('button')].find(
    (b) => b.textContent === name || b.getAttribute('aria-label') === name,
  );
  if (!found) throw new Error(`button "${name}" not found`);
  return found;
}

function field(el: HTMLElement, name: string) {
  const byAria = el.querySelector<HTMLInputElement>(`[aria-label="${name}"]`);
  if (byAria) return byAria;
  const label = [...el.querySelectorAll('label')].find((l) => l.textContent === name);
  const control = label?.htmlFor ? el.ownerDocument.getElementById(label.htmlFor) : null;
  if (!control) throw new Error(`field "${name}" not found`);
  return control as HTMLInputElement;
}

function checkbox(el: HTMLElement, name: string) {
  const found = [...el.querySelectorAll<HTMLElement>('[role="checkbox"]')].find(
    (box) => box.textContent === name,
  );
  if (!found) throw new Error(`checkbox "${name}" not found`);
  return found;
}

async function type(input: HTMLInputElement, text: string) {
  await act(async () => {
    input.focus();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () => input.blur());
}

async function click(target: HTMLElement) {
  await act(async () => target.click());
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

describe('ChartConfigPanel · Setup', () => {
  it('switches the chart type', async () => {
    const el = await mount();
    await click(button(el, 'Line'));
    expect(spec().type).toBe('line');
  });

  it('commits the title on blur and keeps unknown fields', async () => {
    const el = await mount();
    const title = field(el, 'Title');
    await act(async () => {
      title.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
        title,
        'Views',
      );
      title.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(spec().title).toBe('Visits');
    await act(async () => title.blur());
    expect(spec().title).toBe('Views');
    expect(spec().refs).toEqual([{ y: 150, label: 'Goal' }]);
  });

  it('picks the category field from the data', async () => {
    const el = await mount(
      JSON.stringify({ ...JSON.parse(SPEC), data: [{ month: 'Jan', region: 'EU', visits: 1 }] }),
    );
    const trigger = field(el, 'Category field (x)');
    expect(trigger.getAttribute('role')).toBe('combobox');
    await act(async () => trigger.click());
    const options = [...document.body.querySelectorAll<HTMLElement>('[role="option"]')];
    expect(options.map((o) => o.textContent)).toEqual(['month', 'region']);
    await act(async () => options[1].click());
    expect(spec().x).toBe('region');
  });

  it('adds, renames, recolors and removes series', async () => {
    const el = await mount();
    expect(button(el, 'Remove series 1').disabled).toBe(true);

    await click(button(el, 'Add series'));
    expect(spec().series).toHaveLength(2);

    await type(field(el, 'Series 2 key'), 'clicks');
    expect(spec().series[1].key).toBe('clicks');
    expect(spec().data[0]).toEqual({ month: 'Jan', visits: 120, clicks: null });

    await type(field(el, 'Series 2 label'), 'Clicks');
    expect(spec().series[1].label).toBe('Clicks');

    await click(button(el, 'Series 2 color'));
    await click(button(el, 'Color 4'));
    expect(spec().series[1].color).toBe(4);

    await click(button(el, 'Remove series 1'));
    expect(spec().series.map((s: { key: string }) => s.key)).toEqual(['clicks']);
  });
});

describe('ChartConfigPanel · focus', () => {
  it('keeps the series row mounted when its key is renamed', async () => {
    const el = await mount();
    const key = field(el, 'Series 1 key');
    const label = field(el, 'Series 1 label');
    await act(async () => {
      key.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(key, 'views');
      key.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => label.focus());
    expect(spec().series[0].key).toBe('views');
    expect(label.isConnected).toBe(true);
    expect(document.activeElement).toBe(label);
  });
});

describe('ChartConfigPanel · Data', () => {
  it('edits cells, columns and rows', async () => {
    const el = await mount();
    await click(button(el, 'Data'));

    await type(field(el, 'Row 2 visits'), '1,500');
    expect(spec().data[1].visits).toBe(1500);

    await type(field(el, 'Row 2 visits'), 'abc');
    expect(spec().data[1].visits).toBe(1500);
    expect(field(el, 'Row 2 visits').value).toBe('1500');

    await type(field(el, 'Rename month'), 'period');
    expect(spec().x).toBe('period');
    expect(spec().data[0].period).toBe('Jan');

    await click(button(el, 'Add row'));
    expect(spec().data).toHaveLength(3);
    await type(field(el, 'Row 3 period'), 'Mar');
    expect(spec().data[2]).toEqual({ period: 'Mar', visits: null });

    await click(button(el, 'Remove row 1'));
    expect(spec().data.map((r: { period: string }) => r.period)).toEqual(['Feb', 'Mar']);
  });
});

describe('ChartConfigPanel · Style', () => {
  it('sets labels, axis range and number format', async () => {
    const el = await mount();
    await click(button(el, 'Style'));

    await type(field(el, 'Subtitle'), 'Q1');
    await type(field(el, 'Y max'), '300');
    await type(field(el, 'Unit'), '%');
    await type(field(el, 'Decimals'), '1');
    expect(spec()).toMatchObject({
      subtitle: 'Q1',
      y: { max: 300 },
      format: { unit: '%', decimals: 1 },
    });

    await type(field(el, 'Decimals'), '200');
    expect(spec().format.decimals).toBe(1);

    await type(field(el, 'Y max'), '');
    expect('y' in spec()).toBe(false);
  });

  it('offers stacked only for multi-series bar or area, and donut only for pie', async () => {
    const el = await mount();
    await click(button(el, 'Style'));
    expect(el.textContent).not.toContain('Stacked');
    expect(el.textContent).not.toContain('Donut');

    await click(button(el, 'Setup'));
    await click(button(el, 'Add series'));
    await click(button(el, 'Style'));
    await click(checkbox(el, 'Stacked'));
    expect(spec().stacked).toBe(true);

    await click(button(el, 'Setup'));
    await click(button(el, 'Pie'));
    await click(button(el, 'Style'));
    expect(el.textContent).not.toContain('Stacked');
    await click(checkbox(el, 'Donut'));
    expect(spec().donut).toBe(true);
  });
});

describe('ChartConfigPanel · invalid spec', () => {
  it('shows a notice instead of the form when the spec is not a JSON object', async () => {
    const el = await mount('{"type"');
    expect(el.textContent).toContain('Chart spec is not valid JSON');
    expect(el.querySelector('input')).toBeNull();
  });
});
