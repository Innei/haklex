// @vitest-environment happy-dom
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { SlashMenuItem, SlashMenuPlugin } from '../src';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

vi.mock('../src/styles.css', () => {
  const identityProxy = new Proxy({}, { get: (_target, prop: string) => prop, has: () => true });
  return identityProxy;
});

vi.mock('@haklex/rich-style-token', () => ({
  PortalThemeWrapper: ({ children }: { children?: React.ReactNode }) => children,
}));

vi.mock('@haklex/rich-editor/commands', () => ({
  collectCommandItems: () => [],
}));

let capturedOptions: unknown[] | undefined;

vi.mock(
  '@lexical/react/LexicalTypeaheadMenuPlugin',
  async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const actual = await importOriginal();
    return {
      ...actual,
      LexicalTypeaheadMenuPlugin: ({ options }: { options: unknown[] }) => {
        capturedOptions = options;
        return null;
      },
      useBasicTypeaheadTriggerMatch: () => () => null,
    };
  },
);

function makeItem(title: string, nested?: boolean): SlashMenuItem {
  return new SlashMenuItem(title, { nested, onSelect: () => {} });
}

describe('SlashMenuPlugin nested filtering', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
      root = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
    capturedOptions = undefined;
  });

  async function mount(items: SlashMenuItem[], nested: boolean) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <LexicalComposer
          initialConfig={{
            namespace: 'SlashMenuNestedFilterTest',
            onError: (error) => {
              throw error;
            },
          }}
        >
          <SlashMenuPlugin items={items} nested={nested} />
        </LexicalComposer>,
      );
    });
  }

  it('excludes items flagged nested: false when nested is true', async () => {
    const items = [makeItem('Table', false), makeItem('Text', true), makeItem('Image')];

    await mount(items, true);

    expect(capturedOptions).toBeDefined();
    const titles = (capturedOptions as SlashMenuItem[]).map((item) => item.title);
    expect(titles).not.toContain('Table');
    expect(titles).toEqual(expect.arrayContaining(['Text', 'Image']));
    expect(titles).toHaveLength(2);
  });

  it('keeps all items, including nested: false ones, when nested is not set', async () => {
    const items = [makeItem('Table', false), makeItem('Text', true), makeItem('Image')];

    await mount(items, false);

    const titles = (capturedOptions as SlashMenuItem[]).map((item) => item.title);
    expect(titles).toEqual(['Table', 'Text', 'Image']);
  });
});
