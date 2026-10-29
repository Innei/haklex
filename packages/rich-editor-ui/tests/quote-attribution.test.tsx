// @vitest-environment happy-dom
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import type { EditorConfig, ElementDOMSlot, LexicalEditor, NodeKey } from 'lexical';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  ElementNode,
  setDOMUnmanaged,
} from 'lexical';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { QuoteAttributionPlugin } from '../src/components/quote-attribution';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

class TestQuoteNode extends ElementNode {
  __attribution: string | null;

  constructor(attribution: string | null = null, key?: NodeKey) {
    super(key);
    this.__attribution = attribution;
  }

  static getType() {
    return 'rich-quote';
  }

  static clone(node: TestQuoteNode) {
    return new TestQuoteNode(node.__attribution, node.__key);
  }

  createDOM(_config: EditorConfig) {
    const dom = document.createElement('blockquote');
    const slot = document.createElement('div');
    slot.setAttribute('data-quote-attribution-slot', '');
    slot.contentEditable = 'false';
    setDOMUnmanaged(slot, { captureSelection: true });
    dom.append(slot);
    return dom;
  }

  updateDOM() {
    return false;
  }

  getDOMSlot(element: HTMLElement): ElementDOMSlot<HTMLElement> {
    return super
      .getDOMSlot(element)
      .withBefore(element.querySelector('[data-quote-attribution-slot]'));
  }

  getAttribution() {
    return this.getLatest().__attribution;
  }

  setAttribution(value: string | null) {
    const writable = this.getWritable();
    writable.__attribution = value;
    return writable;
  }
}

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  if (root) act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

async function mount(attribution: string | null, editable = true) {
  let editor: LexicalEditor | undefined;
  function Capture() {
    [editor] = useLexicalComposerContext();
    return null;
  }
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(
      <LexicalComposer
        initialConfig={{
          namespace: 'QuoteAttributionTest',
          editable,
          nodes: [TestQuoteNode],
          onError: (error) => {
            throw error;
          },
          editorState: () => {
            const quote = new TestQuoteNode(attribution);
            quote.append($createTextNode('The best code is no code at all.'));
            $getRoot().append(quote, $createParagraphNode().append($createTextNode('After')));
          },
        }}
      >
        <ContentEditable aria-label="Editor" />
        <QuoteAttributionPlugin />
        <Capture />
      </LexicalComposer>,
    );
  });
  return editor!;
}

function slot() {
  return container!.querySelector<HTMLElement>('blockquote [data-quote-attribution-slot]');
}

describe('QuoteAttributionPlugin', () => {
  it('renders the attribution field inside the quote, not in a floating overlay', async () => {
    await mount('Author, Work');
    const input = slot()?.querySelector('input');
    expect(input?.value).toBe('Author, Work');
    expect(input?.getAttribute('aria-label')).toBe('Quote attribution');
    expect(document.body.querySelector('.rich-quote-attribution-overlay')).toBeNull();
  });

  it('marks an empty attribution so it only shows while the caret is in the quote', async () => {
    const editor = await mount(null);
    expect(slot()?.hasAttribute('data-empty')).toBe(true);
    expect(slot()?.hasAttribute('data-active')).toBe(false);
    await act(async () => {
      editor.update(
        () => {
          const quote = $getRoot().getFirstChild() as TestQuoteNode;
          quote.getFirstDescendant()?.selectEnd();
        },
        { discrete: true },
      );
    });
    expect(slot()?.hasAttribute('data-active')).toBe(true);
    await act(async () => {
      editor.update(() => $getRoot().getLastDescendant()?.selectEnd(), { discrete: true });
    });
    expect(slot()?.hasAttribute('data-active')).toBe(false);
  });

  it('shows the attribution as text when the editor is read-only', async () => {
    await mount('Author, Work', false);
    expect(slot()?.querySelector('input')).toBeNull();
    expect(slot()?.textContent).toBe('— Author, Work');
  });

  it('shows nothing for an empty attribution when read-only', async () => {
    await mount(null, false);
    expect(slot()?.textContent).toBe('');
  });
});
