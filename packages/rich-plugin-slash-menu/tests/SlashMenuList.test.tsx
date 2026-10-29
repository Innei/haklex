// @vitest-environment happy-dom
import type { CommandItemConfig } from '@haklex/rich-editor/commands';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import type { ReactNode } from 'react';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import type { SlashMenuItem } from '../src';
import { SlashMenuPlugin } from '../src';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

const nodeItems: CommandItemConfig[] = [];
let query = '';
let rendered: SlashMenuItem[] = [];

vi.mock('@haklex/rich-editor/commands', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@haklex/rich-editor/commands')>();
  return { ...actual, collectCommandItems: () => nodeItems };
});

vi.mock(
  '@lexical/react/LexicalTypeaheadMenuPlugin',
  async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const actual = await importOriginal();
    return {
      ...actual,
      LexicalTypeaheadMenuPlugin: ({
        options,
        menuRenderFn,
        onQueryChange,
      }: {
        menuRenderFn: (...args: unknown[]) => ReactNode;
        onQueryChange: (value: string) => void;
        options: SlashMenuItem[];
      }) => {
        useEffect(() => onQueryChange(query), [onQueryChange]);
        rendered = options;
        const anchor = document.getElementById('anchor');
        return menuRenderFn(
          { current: anchor },
          {
            options,
            selectedIndex: null,
            selectOptionAndCleanUp: () => {},
            setHighlightedIndex: () => {},
          },
          query,
        );
      },
      useBasicTypeaheadTriggerMatch: () => () => null,
    };
  },
);

describe('SlashMenuPlugin list', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    document.body.innerHTML = '';
    container = null;
    nodeItems.length = 0;
    rendered = [];
  });

  async function mount() {
    const anchor = document.createElement('div');
    anchor.id = 'anchor';
    document.body.append(anchor);
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <LexicalComposer
          initialConfig={{
            namespace: 'SlashMenuListTest',
            onError: (error) => {
              throw error;
            },
          }}
        >
          <SlashMenuPlugin />
        </LexicalComposer>,
      );
    });
  }

  it('keeps a no-results row with an Esc hint for an unmatched query', async () => {
    query = 'xyz';
    await mount();

    const empty = document.querySelector('[data-slot="slash-menu-empty"]');
    expect(empty?.textContent).toContain('No blocks match “xyz”');
    expect(empty?.textContent).toContain('keep as text');
    expect(empty?.querySelector('kbd')).not.toBeNull();
  });

  it('renders Title-case section labels from the registry', async () => {
    query = '';
    await mount();

    const labels = [...document.querySelectorAll('[data-slot="slash-menu-section"]')].map(
      (node) => node.textContent,
    );
    expect(labels.slice(0, 2)).toEqual(['Basic blocks', 'Lists']);
  });

  it('shows each block once under its canonical name', async () => {
    query = '';
    const linkCard = { title: 'Link Card', section: 'MEDIA', onSelect: () => {} };
    nodeItems.push(linkCard, { ...linkCard }, { title: 'Code Block', onSelect: () => {} });
    await mount();

    const titles = rendered.map((item) => item.title);
    expect(titles.filter((title) => title === 'Link card')).toHaveLength(1);
    expect(titles).toContain('Code block');
    expect(titles).toContain('Bulleted list');
    expect(titles).not.toContain('Link Card');
  });
});
