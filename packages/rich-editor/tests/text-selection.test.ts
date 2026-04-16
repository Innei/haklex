// @vitest-environment happy-dom

import {
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  $setState,
  createEditor,
} from 'lexical';
import { describe, expect, it, vi } from 'vitest';

import { createTextSelectionStore } from '../src/context/TextSelectionContext';
import { blockIdState } from '../src/plugins/BlockIdPlugin';
import {
  $captureTextSelection,
  $restoreTextSelection,
  createDOMRangeFromTextSelection,
  findDOMPointByTextOffset,
  getTextOffsetFromDOMPoint,
} from '../src/utils/text-selection';

function createTestEditor() {
  return createEditor({
    namespace: 'TextSelectionTest',
    onError: (error) => {
      throw error;
    },
  });
}

async function flushEditor() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('text selection utilities', () => {
  it('deduplicates identical snapshots in the text selection store', () => {
    const store = createTextSelectionStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.setSnapshot({
      text: 'hello',
      anchorBlockId: 'block-a',
      anchorOffset: 0,
      focusBlockId: 'block-a',
      focusOffset: 5,
    });
    store.setSnapshot({
      text: 'hello',
      anchorBlockId: 'block-a',
      anchorOffset: 0,
      focusBlockId: 'block-a',
      focusOffset: 5,
    });
    store.clearSnapshot();

    unsubscribe();

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('captures block-relative offsets from the current range selection', async () => {
    const editor = createTestEditor();

    editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      const first = $createTextNode('hello');
      const second = $createTextNode(' world');

      paragraph.append(first, second);
      $setState(paragraph, blockIdState, 'block-a');
      root.append(paragraph);

      const selection = $createRangeSelection();
      selection.anchor.set(first.getKey(), 2, 'text');
      selection.focus.set(second.getKey(), 3, 'text');
      $setSelection(selection);
    });

    await flushEditor();

    editor.getEditorState().read(() => {
      expect($captureTextSelection()).toEqual({
        text: 'llo wo',
        anchorBlockId: 'block-a',
        anchorOffset: 2,
        focusBlockId: 'block-a',
        focusOffset: 8,
      });
    });
  });

  it('restores a saved selection and preserves its offsets across blocks', async () => {
    const editor = createTestEditor();

    editor.update(() => {
      const root = $getRoot();

      const first = $createParagraphNode();
      first.append($createTextNode('hello'));
      $setState(first, blockIdState, 'block-a');

      const second = $createParagraphNode();
      second.append($createTextNode('world'));
      $setState(second, blockIdState, 'block-b');

      root.append(first, second);
    });

    await flushEditor();

    editor.update(() => {
      expect(
        $restoreTextSelection({
          text: 'ello\nwor',
          anchorBlockId: 'block-a',
          anchorOffset: 1,
          focusBlockId: 'block-b',
          focusOffset: 3,
        }),
      ).toBe(true);
    });

    await flushEditor();

    editor.getEditorState().read(() => {
      const snapshot = $captureTextSelection();

      expect($isRangeSelection($getSelection())).toBe(true);
      expect(snapshot).not.toBeNull();
      expect(snapshot).toMatchObject({
        anchorBlockId: 'block-a',
        anchorOffset: 1,
        focusBlockId: 'block-b',
        focusOffset: 3,
      });
    });
  });

  it('maps DOM offsets and recreates DOM ranges across line breaks', () => {
    document.body.innerHTML = `
      <div class="rich-editor__content">
        <p data-block-id="block-a">hello<br>world</p>
      </div>
    `;

    const root = document.querySelector('.rich-editor__content') as HTMLElement;
    const block = root.querySelector('[data-block-id="block-a"]') as HTMLElement;
    const br = block.querySelector('br') as HTMLBRElement;
    const brIndex = Array.from(block.childNodes).indexOf(br);

    expect(getTextOffsetFromDOMPoint(block, block, brIndex + 1)).toBe(6);

    const point = findDOMPointByTextOffset(block, 6);
    expect(point).toEqual({ node: block, offset: brIndex + 1 });

    const range = createDOMRangeFromTextSelection(root, {
      text: 'hello\nw',
      anchorBlockId: 'block-a',
      anchorOffset: 0,
      focusBlockId: 'block-a',
      focusOffset: 7,
    });

    expect(range).not.toBeNull();
    expect(range?.startContainer).toBe(block.firstChild);
    expect(range?.startOffset).toBe(0);
    expect(range?.endContainer).toBe(block.lastChild);
    expect(range?.endOffset).toBe(1);
  });
});
