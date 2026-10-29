// @vitest-environment happy-dom
import { $isMentionNode, MentionNode } from '@haklex/rich-editor/nodes';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { ElementNode, LexicalEditor, TextNode } from 'lexical';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import type { MentionMenuItem } from '../src';
import { MentionMenuPlugin } from '../src';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

interface CapturedProps {
  menuRenderFn: (
    anchor: { current: HTMLElement | null },
    props: {
      options: MentionMenuItem[];
      selectedIndex: number | null;
      selectOptionAndCleanUp: (option: MentionMenuItem) => void;
      setHighlightedIndex: (index: number) => void;
    },
    matchingString: string,
  ) => ReactNode;
  onQueryChange: (query: string | null) => void;
  onSelectOption: (
    option: MentionMenuItem,
    textNode: TextNode | null,
    closeMenu: () => void,
    matchingString: string,
  ) => void;
  options: MentionMenuItem[];
}

const captured = vi.hoisted(() => ({ current: null as unknown }));

vi.mock(
  '@lexical/react/LexicalTypeaheadMenuPlugin',
  async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const actual = await importOriginal();
    return {
      ...actual,
      LexicalTypeaheadMenuPlugin: (props: unknown) => {
        captured.current = props;
        return null;
      },
    };
  },
);

function props(): CapturedProps {
  return captured.current as CapturedProps;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let container: HTMLDivElement | null = null;
let root: Root | null = null;
let menuRoot: Root | null = null;
let editorRef: LexicalEditor | null = null;

function CaptureEditor() {
  const [editor] = useLexicalComposerContext();
  editorRef = editor;
  return null;
}

async function mount() {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(
      <LexicalComposer
        initialConfig={{
          namespace: 'mention-menu-test',
          nodes: [MentionNode],
          onError: (error) => {
            throw error;
          },
        }}
      >
        <MentionMenuPlugin />
        <CaptureEditor />
      </LexicalComposer>,
    );
  });
}

async function query(q: string) {
  await act(async () => props().onQueryChange(q));
}

async function renderMenu(): Promise<HTMLElement> {
  const anchor = document.createElement('div');
  document.body.append(anchor);
  const host = document.createElement('div');
  document.body.append(host);
  menuRoot = createRoot(host);
  const element = props().menuRenderFn(
    { current: anchor },
    {
      options: props().options,
      selectedIndex: 0,
      selectOptionAndCleanUp: () => {},
      setHighlightedIndex: () => {},
    },
    '',
  );
  await act(async () => menuRoot!.render(<>{element}</>));
  return anchor;
}

afterEach(() => {
  act(() => {
    menuRoot?.unmount();
    root?.unmount();
  });
  container?.remove();
  root = null;
  menuRoot = null;
  container = null;
  editorRef = null;
  captured.current = null;
  document.body.innerHTML = '';
});

describe('MentionMenuPlugin', () => {
  it('lists one row per platform for a bare query', async () => {
    await mount();
    await query('innei');
    expect(props().options.map((o) => [o.platformKey, o.handleText])).toEqual([
      ['GH', 'innei'],
      ['TW', 'innei'],
      ['TG', 'innei'],
      ['ZH', 'innei'],
    ]);

    const menu = await renderMenu();
    const rows = [...menu.querySelectorAll('[role="option"]')];
    expect(rows).toHaveLength(4);
    expect(rows[0].textContent).toContain('innei');
    expect(rows[0].textContent).toContain('GitHub');
    expect(rows[1].textContent).toContain('X');
  });

  it('inserts the mention for the chosen platform row', async () => {
    await mount();
    await query('innei');
    const telegram = props().options.find((o) => o.platformKey === 'TG')!;
    await act(async () => {
      editorRef!.update(() => {
        const text = $createTextNode('@innei');
        $getRoot().append($createParagraphNode().append(text));
        props().onSelectOption(telegram, text, () => {}, 'innei');
      });
    });
    const mention = editorRef!.getEditorState().read(() => {
      const node = $getRoot().getLastChildOrThrow<ElementNode>().getFirstChild();
      return $isMentionNode(node) ? [node.getPlatform(), node.getHandle()] : null;
    });
    expect(mention).toEqual(['TG', 'innei']);
  });

  it('keeps the @GH: code syntax as a fast path', async () => {
    await mount();
    await query('GH:innei');
    expect(props().options.map((o) => [o.platformKey, o.handleText])).toEqual([['GH', 'innei']]);
  });

  it('shows a No matches row instead of vanishing', async () => {
    await mount();
    await query('XX:innei');
    expect(props().options).toHaveLength(0);
    const menu = await renderMenu();
    expect(menu.textContent).toContain('No matches');
  });
});
