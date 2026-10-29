// @vitest-environment happy-dom
import { DropdownMenu } from '@haklex/rich-editor-ui';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { BlockMenu } from '../src/BlockMenu';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = '';
});

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

async function mount(onTurnInto = vi.fn()) {
  const container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root?.render(
      <DropdownMenu open>
        <BlockMenu
          currentType="h2"
          onDelete={() => {}}
          onDuplicate={() => {}}
          onMoveDown={() => {}}
          onMoveUp={() => {}}
          onTurnInto={onTurnInto}
        />
      </DropdownMenu>,
    ),
  );
  await flush();
}

const text = (node: Element) =>
  [...node.childNodes]
    .filter((child) => !(child instanceof Element && child.tagName === 'KBD'))
    .map((child) => child.textContent)
    .join('')
    .trim();

describe('BlockMenu', () => {
  it('orders actions with Turn into first and Delete last', async () => {
    await mount();
    const items = [...document.querySelectorAll('[role="menuitem"]')];
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringMatching(/^Turn into.*Heading 2/),
      expect.stringContaining('Duplicate'),
      expect.stringContaining('Move up'),
      expect.stringContaining('Move down'),
      expect.stringContaining('Delete'),
    ]);
    expect(items.at(-1)?.querySelector('kbd')).not.toBeNull();
    expect(items[1].querySelector('kbd')).not.toBeNull();
  });

  it('lists Turn into types from the registry with the current one checked', async () => {
    const onTurnInto = vi.fn();
    await mount(onTurnInto);
    const trigger = document.querySelector('[role="menuitem"]') as HTMLElement;
    await act(async () => trigger.click());
    await flush();

    const options = [...document.querySelectorAll('[role="menuitemradio"]')];
    expect(options.map(text)).toEqual([
      'Text',
      'Heading 1',
      'Heading 2',
      'Heading 3',
      'Bulleted list',
      'Numbered list',
      'To-do list',
      'Quote',
      'Code block',
    ]);
    const checked = options.filter((option) => option.getAttribute('aria-checked') === 'true');
    expect(checked.map(text)).toEqual(['Heading 2']);
    expect(options[2].querySelector('svg.lucide-heading-2')).not.toBeNull();

    await act(async () => (options[7] as HTMLElement).click());
    expect(onTurnInto).toHaveBeenCalledWith('quote');
  });
});
