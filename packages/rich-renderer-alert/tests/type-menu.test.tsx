// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { AlertEditRenderer } from '../src/AlertEditRenderer';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let container: HTMLDivElement | null = null;
let root: Root | null = null;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

async function mount() {
  const onTypeChange = vi.fn();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root!.render(<AlertEditRenderer editable type="warning" onTypeChange={onTypeChange} />),
  );
  return onTypeChange;
}

describe('AlertEditRenderer type menu', () => {
  it('labels the trigger with the current type and shows a chevron', async () => {
    await mount();
    const trigger = container!.querySelector<HTMLElement>('[aria-haspopup]')!;
    expect(trigger.getAttribute('aria-label')).toBe('Alert type: Warning');
    expect(trigger.querySelectorAll('svg')).toHaveLength(2);
  });

  it('checks the current type and switches on select', async () => {
    const onTypeChange = await mount();
    const trigger = container!.querySelector<HTMLElement>('[aria-haspopup]')!;
    await act(async () => trigger.click());
    const items = [...document.body.querySelectorAll<HTMLElement>('[role="menuitemradio"]')];
    expect(items).toHaveLength(5);
    const checked = items.filter((item) => item.getAttribute('aria-checked') === 'true');
    expect(checked.map((item) => item.textContent)).toEqual(['Warning']);
    await act(async () => items.find((item) => item.textContent === 'Tip')!.click());
    expect(onTypeChange).toHaveBeenCalledWith('tip');
  });
});
