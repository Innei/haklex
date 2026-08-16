// @vitest-environment happy-dom
import { $isLinkNode, LinkNode } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import type { LexicalEditor } from 'lexical';
import {
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $setSelection,
  PASTE_COMMAND,
} from 'lexical';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { PasteLinkPlugin } from '../src/plugins/PasteLinkPlugin';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

function EditorCapture({ onReady }: { onReady: (editor: LexicalEditor) => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);
  return null;
}

function createPasteEvent(text: string): ClipboardEvent {
  const clipboardData = new DataTransfer();
  clipboardData.setData('text/plain', text);
  return new ClipboardEvent('paste', { clipboardData });
}

function readLinks(editor: LexicalEditor): { url: string; text: string }[] {
  const links: { url: string; text: string }[] = [];
  editor.getEditorState().read(() => {
    const visit = (node: ReturnType<typeof $getRoot>) => {
      for (const child of node.getChildren()) {
        if ($isLinkNode(child)) {
          links.push({ url: child.getURL(), text: child.getTextContent() });
        } else if ('getChildren' in child) {
          visit(child as ReturnType<typeof $getRoot>);
        }
      }
    };
    visit($getRoot());
  });
  return links;
}

describe('PasteLinkPlugin', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  let editor: LexicalEditor;

  async function mountEditor() {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    let captured: LexicalEditor | undefined;
    await act(async () => {
      root?.render(
        <LexicalComposer
          initialConfig={{
            namespace: 'PasteLinkTest',
            nodes: [LinkNode],
            onError: (error) => {
              throw error;
            },
          }}
        >
          <EditorCapture
            onReady={(instance) => {
              captured = instance;
            }}
          />
          <LinkPlugin />
          <PasteLinkPlugin />
        </LexicalComposer>,
      );
    });

    if (!captured) throw new Error('editor was not captured');
    editor = captured;
  }

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
  });

  async function seedParagraphs(texts: string[]) {
    await mountEditor();
    editor.update(
      () => {
        const rootNode = $getRoot();
        rootNode.clear();
        for (const text of texts) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(text));
          rootNode.append(paragraph);
        }
      },
      { discrete: true },
    );
  }

  function selectTextRange(paragraphIndex: number, start: number, end: number) {
    editor.update(
      () => {
        const paragraph = $getRoot().getChildAtIndex(paragraphIndex)!;
        const textNode = (paragraph as ReturnType<typeof $createParagraphNode>).getFirstChild()!;
        const selection = $createRangeSelection();
        selection.anchor.set(textNode.getKey(), start, 'text');
        selection.focus.set(textNode.getKey(), end, 'text');
        $setSelection(selection);
      },
      { discrete: true },
    );
  }

  async function paste(text: string): Promise<boolean> {
    let handled = false;
    await act(async () => {
      handled = editor.dispatchCommand(PASTE_COMMAND, createPasteEvent(text));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    return handled;
  }

  it('wraps a partial text selection in a link', async () => {
    await seedParagraphs(['hello world']);
    selectTextRange(0, 0, 5);

    expect(await paste('https://example.com')).toBe(true);
    expect(readLinks(editor)).toEqual([{ url: 'https://example.com', text: 'hello' }]);
    expect(editor.getEditorState().read(() => $getRoot().getTextContent())).toBe('hello world');
  });

  it('wraps a full-paragraph selection in a link', async () => {
    await seedParagraphs(['hello world']);
    editor.update(
      () => {
        const paragraph = $getRoot().getFirstChild()!;
        (paragraph as ReturnType<typeof $createParagraphNode>).select(0, 1);
      },
      { discrete: true },
    );

    expect(await paste('https://example.com/a?b=c#d')).toBe(true);
    expect(readLinks(editor)).toEqual([
      { url: 'https://example.com/a?b=c#d', text: 'hello world' },
    ]);
  });

  it('accepts mailto links', async () => {
    await seedParagraphs(['contact me']);
    selectTextRange(0, 0, 10);

    expect(await paste('mailto:i@innei.dev')).toBe(true);
    expect(readLinks(editor)).toEqual([{ url: 'mailto:i@innei.dev', text: 'contact me' }]);
  });

  it('ignores a collapsed selection', async () => {
    await seedParagraphs(['hello world']);
    selectTextRange(0, 5, 5);

    expect(await paste('https://example.com')).toBe(false);
    expect(readLinks(editor)).toEqual([]);
  });

  it('ignores clipboard text that is not a bare url', async () => {
    await seedParagraphs(['hello world']);
    selectTextRange(0, 0, 5);

    expect(await paste('see https://example.com')).toBe(false);
    expect(await paste('example.com')).toBe(false);
    expect(await paste('javascript:alert(1)')).toBe(false);
    expect(readLinks(editor)).toEqual([]);
  });

  it('ignores selections spanning multiple blocks', async () => {
    await seedParagraphs(['first', 'second']);
    editor.update(
      () => {
        const first = $getRoot().getChildAtIndex(0)!;
        const second = $getRoot().getChildAtIndex(1)!;
        const firstText = (first as ReturnType<typeof $createParagraphNode>).getFirstChild()!;
        const secondText = (second as ReturnType<typeof $createParagraphNode>).getFirstChild()!;
        const selection = $createRangeSelection();
        selection.anchor.set(firstText.getKey(), 0, 'text');
        selection.focus.set(secondText.getKey(), 6, 'text');
        $setSelection(selection);
      },
      { discrete: true },
    );

    expect(await paste('https://example.com')).toBe(false);
    expect(readLinks(editor)).toEqual([]);
  });
});
