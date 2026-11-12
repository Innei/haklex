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

  it('keeps a details body selection out of its non-Lexical summary', () => {
    const root = document.createElement('div');
    root.innerHTML =
      '<details data-block-id="details" open><summary>Agent runtime</summary><div><p><span data-lexical-text="true">First item</span></p><p><span data-lexical-text="true">Second item</span></p></div></details>';
    const text = root.querySelectorAll('[data-lexical-text]')[1].firstChild!;
    const range = createDOMRangeFromTextSelection(root, {
      text: 'Second',
      anchorBlockId: 'details',
      anchorOffset: 10,
      focusBlockId: 'details',
      focusOffset: 16,
    });

    expect(range?.toString()).toBe('Second');
    expect(range?.endContainer).toBe(text);
    expect(getTextOffsetFromDOMPoint(root.firstElementChild!, text, 6)).toBe(16);
  });

  it('keeps a selection after an inline decorator on the text the reader selected', () => {
    const root = document.createElement('div');
    root.innerHTML =
      '<p data-block-id="formula"><span data-lexical-text="true">公式 </span><span contenteditable="false"><span class="katex">t95t_{95}</span></span><span data-lexical-text="true"> 之后的文字，还有脚注</span><sup contenteditable="false"><a>1</a></sup><span data-lexical-text="true">之后的文字。</span></p>';
    const block = root.firstElementChild!;
    const after = root.querySelectorAll('[data-lexical-text]')[1].firstChild!;
    const range = createDOMRangeFromTextSelection(root, {
      text: '还有脚注',
      anchorBlockId: 'formula',
      anchorOffset: 10,
      focusBlockId: 'formula',
      focusOffset: 14,
    });

    expect(range?.toString()).toBe('还有脚注');
    expect(getTextOffsetFromDOMPoint(block, after, 7)).toBe(10);
    const tail = root.querySelectorAll('[data-lexical-text]')[2].firstChild!;
    expect(findDOMPointByTextOffset(block, 15)).toEqual({ node: tail, offset: 1 });
  });

  it('starts a selection after an inline decorator that sits right before it', () => {
    const root = document.createElement('div');
    root.innerHTML =
      '<p data-block-id="note"><span data-lexical-text="true">还有脚注</span><sup contenteditable="false"><a>1</a></sup><span data-lexical-text="true">之后的文字。</span></p>';
    const range = createDOMRangeFromTextSelection(root, {
      text: '之后的',
      anchorBlockId: 'note',
      anchorOffset: 7,
      focusBlockId: 'note',
      focusOffset: 4,
    });

    expect(range?.toString()).toBe('之后的');
    const ending = createDOMRangeFromTextSelection(root, {
      text: '脚注',
      anchorBlockId: 'note',
      anchorOffset: 2,
      focusBlockId: 'note',
      focusOffset: 4,
    });
    expect(ending?.toString()).toBe('脚注');
  });

  it('does not count a non-editable label inside a block', () => {
    const root = document.createElement('div');
    root.innerHTML =
      '<div data-block-id="alert"><div contenteditable="false">Note</div><div><p><span data-lexical-text="true">提示框里的文字内容</span></p></div></div>';
    const range = createDOMRangeFromTextSelection(root, {
      text: '文字',
      anchorBlockId: 'alert',
      anchorOffset: 5,
      focusBlockId: 'alert',
      focusOffset: 7,
    });

    expect(range?.toString()).toBe('文字');
  });

  it('maps backward selections through nested details without counting either summary', () => {
    const root = document.createElement('div');
    root.innerHTML =
      '<details data-block-id="details" open><summary>Outer title</summary><div><p>First</p><details open><summary>Inner title</summary><div><p>Second</p></div></details><p>Third</p></div></details>';
    const range = createDOMRangeFromTextSelection(root, {
      text: 'econdThird',
      anchorBlockId: 'details',
      anchorOffset: 16,
      focusBlockId: 'details',
      focusOffset: 6,
    });

    expect(range?.toString()).toBe('econdThird');
    const block = root.firstElementChild!;
    const end = findDOMPointByTextOffset(block, 100)!;
    expect(getTextOffsetFromDOMPoint(block, end.node, end.offset)).toBe(16);
  });
});
