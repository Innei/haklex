// @vitest-environment happy-dom
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $parseSerializedNode,
  createEditor,
  SKIP_DOM_SELECTION_TAG,
} from 'lexical';
import { createElement, useLayoutEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';

import { EditorRecycler } from '../src/virtualization/controller';
import { PreserveNodeManager } from '../src/virtualization/preserve';
import type { EditorVirtualizationOptions } from '../src/virtualization/types';

const paragraph = (id: string, text: string) => ({
  type: 'paragraph',
  version: 1,
  format: '',
  indent: 0,
  direction: null,
  $: { blockId: id },
  children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }],
});

const recyclers: EditorRecycler[] = [];

function setup(options: Partial<EditorVirtualizationOptions> = {}) {
  const master = createEditor({
    onError: (error) => {
      throw error;
    },
  });
  master.setEditorState(
    master.parseEditorState({
      root: {
        type: 'root',
        version: 1,
        format: '',
        indent: 0,
        direction: null,
        children: Array.from({ length: 200 }, (_, i) => paragraph(`b${i}`, `Text ${i}`)),
      },
    }),
  );
  const viewport = document.createElement('div');
  const canvas = document.createElement('div');
  const outside = document.createElement('button');
  viewport.append(canvas);
  document.body.append(viewport, outside);
  canvas.getBoundingClientRect = () => new DOMRect(0, -viewport.scrollTop, 800, 20000);
  const recycler = new EditorRecycler(master, canvas, {
    scrollContainer: viewport,
    overscan: 0,
    estimateBlockHeight: () => 100,
    preserveCapacity: 0,
    ...options,
  });
  recyclers.push(recycler);
  const mount = (index: number) => {
    const slot = recycler.pool.slots.find((item) => item.active && item.index === index)!;
    const element = document.createElement('div');
    const root = document.createElement('div');
    root.contentEditable = 'true';
    element.append(root);
    canvas.append(element);
    recycler.attach(slot, element);
    recycler.bind(slot);
    recycler.island(slot).editor.setRootElement(root);
    return { slot, root, editor: recycler.island(slot).editor };
  };
  const scrollTo = (top: number) => {
    viewport.scrollTop = top;
    recycler.refresh(false);
  };
  return { recycler, master, outside, mount, scrollTo };
}

afterEach(() => {
  for (const recycler of recyclers.splice(0)) recycler.dispose();
  document.body.innerHTML = '';
});

describe('virtual editor selection retention', () => {
  it('keeps the block holding the selection mounted after focus moves outside the editor', () => {
    const { outside, mount, scrollTo } = setup();
    const block = mount(0);
    block.root.focus();
    block.editor.update(() => $getRoot().selectEnd(), { discrete: true });
    outside.focus();

    scrollTo(4000);

    expect(block.slot.active).toBe(true);
    expect(block.slot.index).toBe(0);
  });

  it('releases the previous block once another block takes the selection', () => {
    const { outside, mount, scrollTo } = setup();
    const first = mount(0);
    first.root.focus();
    first.editor.update(() => $getRoot().selectEnd(), { discrete: true });
    scrollTo(100);
    const second = mount(1);
    second.root.focus();
    second.editor.update(() => $getRoot().selectEnd(), { discrete: true });
    outside.focus();

    scrollTo(4000);

    expect(first.slot.active && first.slot.index === 0).toBe(false);
    expect(second.slot.active).toBe(true);
    expect(second.slot.index).toBe(1);
  });
});

const snapshot = (editor: ReturnType<typeof createEditor>) =>
  editor.getEditorState().read(() => ({
    json: JSON.stringify(editor.getEditorState().toJSON()),
    keys: $getRoot()
      .getChildren()
      .map((node) => node.getKey()),
  }));

const selectInFirstText = (editor: ReturnType<typeof createEditor>) => {
  let key = '';
  editor.update(
    () => {
      const node = $getRoot().getFirstDescendant()!;
      if ($isTextNode(node)) node.select(1, 3);
      key = node.getKey();
    },
    { discrete: true },
  );
  return key;
};

const anchorKey = (editor: ReturnType<typeof createEditor>) =>
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    return $isRangeSelection(selection) ? selection.anchor.key : null;
  });

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const activeIndices = (recycler: EditorRecycler) =>
  recycler.pool.slots.filter((slot) => slot.active).map((slot) => slot.index);

const renderSlotIndex = (recycler: EditorRecycler, slot: { index: number }) => {
  const container = document.createElement('div');
  document.body.append(container);
  const Probe = () => {
    const [, setRevision] = useState(0);
    useLayoutEffect(() => recycler.subscribe(() => setRevision((value) => value + 1)), []);
    return createElement('span', null, String(slot.index));
  };
  const root = createRoot(container);
  flushSync(() => root.render(createElement(Probe)));
  return () => container.textContent;
};

describe('virtual editor island growth', () => {
  it('merges following rows into the island without touching the master document', () => {
    const { recycler, master, mount } = setup({ overscan: 300 });
    const block = mount(0);
    const neighbor = mount(1);
    const key = selectInFirstText(block.editor);
    const before = snapshot(master);

    expect(recycler.extendIsland(block.slot, 3)).toBe(true);

    expect(recycler.island(block.slot).ids).toEqual(['b0', 'b1', 'b2', 'b3']);
    expect(block.editor.getEditorState().read(() => $getRoot().getChildrenSize())).toBe(4);
    expect(block.root.children).toHaveLength(4);
    expect(anchorKey(block.editor)).toBe(key);
    expect(neighbor.slot.active).toBe(false);
    expect(snapshot(master)).toEqual(before);
  });

  it('moves the slot to the first row when merging backward', () => {
    const { recycler, master, mount } = setup({ overscan: 300 });
    const block = mount(2);
    const before = snapshot(master);

    expect(recycler.extendIsland(block.slot, 0)).toBe(true);

    expect(recycler.island(block.slot).ids).toEqual(['b0', 'b1', 'b2']);
    expect(block.slot.index).toBe(0);
    expect(snapshot(master)).toEqual(before);
  });

  it('splits back to the caret row once the selection collapses', async () => {
    const { recycler, master, mount } = setup({ overscan: 300 });
    const block = mount(0);
    selectInFirstText(block.editor);
    recycler.extendIsland(block.slot, 3);
    const before = snapshot(master);

    block.editor.update(
      () => {
        const text = $getRoot().getChildAtIndex(2)!.getFirstDescendant()!;
        if ($isTextNode(text)) text.select(2, 2);
      },
      { discrete: true },
    );
    await nextFrame();

    expect(recycler.island(block.slot).ids).toEqual(['b2']);
    expect(block.slot.index).toBe(2);
    expect(block.root.children).toHaveLength(1);
    expect(activeIndices(recycler)).toEqual(expect.arrayContaining([0, 1, 2, 3]));
    expect(snapshot(master)).toEqual(before);
  });

  it('keeps the island merged while the selection spans blocks', async () => {
    const { recycler, mount } = setup({ overscan: 300 });
    const block = mount(0);
    selectInFirstText(block.editor);
    recycler.extendIsland(block.slot, 3);

    block.editor.update(
      () => {
        const selection = $getSelection();
        const text = $getRoot().getChildAtIndex(2)!.getFirstDescendant()!;
        if ($isRangeSelection(selection) && $isTextNode(text))
          selection.focus.set(text.getKey(), 2, 'text');
      },
      { discrete: true },
    );
    await nextFrame();

    expect(recycler.island(block.slot).ids).toEqual(['b0', 'b1', 'b2', 'b3']);
  });

  it('does not split while the DOM selection still spans blocks', async () => {
    const { recycler, mount } = setup({ overscan: 300 });
    const block = mount(0);
    block.editor.update(() => $getRoot().selectStart(), { discrete: true });
    recycler.extendIsland(block.slot, 2);
    const texts = block.root.querySelectorAll('span');
    const range = document.createRange();
    range.setStart(texts[0].firstChild!, 1);
    range.setEnd(texts[2].firstChild!, 2);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    await new Promise((resolve) => setTimeout(resolve));
    block.editor.update(() => $getRoot().selectStart(), {
      discrete: true,
      tag: SKIP_DOM_SELECTION_TAG,
    });

    await nextFrame();

    expect(recycler.island(block.slot).ids).toEqual(['b0', 'b1', 'b2']);
  });

  it('takes in a row restored inside a merged island and keeps writing edits back', () => {
    const { recycler, master, mount } = setup({ overscan: 300 });
    const block = mount(0);
    selectInFirstText(block.editor);
    recycler.extendIsland(block.slot, 3);

    master.update(
      () => {
        const restored = $parseSerializedNode(paragraph('restored', 'Restored'));
        $getRoot().getChildAtIndex(1)!.insertAfter(restored);
      },
      { discrete: true },
    );
    recycler.bind(block.slot);
    block.editor.update(
      () => {
        const text = $getRoot().getLastDescendant()!;
        if ($isTextNode(text)) text.setTextContent('Edited after undo');
      },
      { discrete: true },
    );

    expect(recycler.island(block.slot).ids).toEqual(['b0', 'b1', 'restored', 'b2', 'b3']);
    expect(master.getEditorState().read(() => $getRoot().getTextContent())).toContain(
      'Edited after undo',
    );
  });

  it('ignores drags that start inside a nested editable or a decorator', () => {
    const { recycler, mount } = setup({ overscan: 300 });
    const block = mount(0);
    for (const editable of ['true', 'false']) {
      const inner = document.createElement('div');
      inner.contentEditable = editable;
      block.root.append(inner);
      inner.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, button: 0, clientY: 40 }),
      );
      document.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, buttons: 1, clientY: 350 }),
      );
      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      inner.remove();
    }

    expect(recycler.island(block.slot).ids).toEqual(['b0']);
  });

  it('does not take over a neighbor that is retained or composing', () => {
    const { recycler, mount } = setup({ overscan: 300 });
    const block = mount(0);
    const neighbor = mount(1);
    recycler.island(neighbor.slot).retained = 1;

    expect(recycler.extendIsland(block.slot, 3)).toBe(false);

    expect(recycler.island(block.slot).ids).toEqual(['b0']);
    expect(neighbor.slot.active).toBe(true);
  });

  it('renders the split position before splitIsland returns', () => {
    const { recycler, mount } = setup({ overscan: 300 });
    const block = mount(0);
    selectInFirstText(block.editor);
    recycler.extendIsland(block.slot, 3);
    const rendered = renderSlotIndex(recycler, block.slot);

    block.editor.update(
      () => {
        const text = $getRoot().getChildAtIndex(2)!.getFirstDescendant()!;
        if ($isTextNode(text)) text.select(2, 2);
      },
      { discrete: true },
    );
    recycler.splitIsland(block.slot);

    expect(rendered()).toBe('2');
  });

  it('renders a backward drag merge before the event returns', () => {
    const { recycler, mount } = setup({ overscan: 300 });
    const block = mount(2);
    const rendered = renderSlotIndex(recycler, block.slot);
    block.root
      .querySelector('span')!
      .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, clientY: 250 }));

    document.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, buttons: 1, clientY: 50 }),
    );

    expect(rendered()).toBe('0');
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });

  it('gives pasted blocks fresh ids when their copied ids already exist in the document', async () => {
    const { recycler, master, mount } = setup({ overscan: 300 });
    const neighbor = mount(1);
    const block = mount(3);

    for (let round = 0; round < 2; round++) {
      block.editor.update(
        () => {
          const target = $getRoot().getFirstChild()!;
          target.insertAfter($parseSerializedNode(paragraph('b2', 'Pasted two')));
          target.insertAfter($parseSerializedNode(paragraph('b1', 'Pasted one')));
        },
        { discrete: true },
      );
      await Promise.resolve();
    }

    const ids = master.getEditorState().read(() => recycler.rows.map((row) => row.id));
    const island = recycler.island(block.slot).ids;
    expect(new Set(ids).size).toBe(ids.length);
    expect(island[0]).toBe('b3');
    expect(island).toHaveLength(5);
    expect(island.slice(1).some((id) => ['b0', 'b1', 'b2', 'b4'].includes(id))).toBe(false);
    expect(recycler.island(neighbor.slot).ids).toEqual(['b1']);
    expect(ids.slice(3, 8)).toEqual(island);
  });

  it('refuses to grow past selectionMergeLimit', () => {
    const { recycler, mount } = setup({ overscan: 300, selectionMergeLimit: 3 });
    const block = mount(0);

    expect(recycler.extendIsland(block.slot, 3)).toBe(false);

    expect(recycler.island(block.slot).ids).toEqual(['b0']);
  });

  it('grows on Shift+Down when the focus is in the island’s last block', () => {
    const { recycler, mount } = setup({ overscan: 300 });
    const block = mount(0);
    selectInFirstText(block.editor);

    expect(recycler.extendForKey(block.slot, 'down')).toBe(true);

    expect(recycler.island(block.slot).ids).toEqual(['b0', 'b1']);
  });

  it('grows on Shift+Right only when the focus sits at the island’s end', () => {
    const { recycler, mount } = setup({ overscan: 300 });
    const block = mount(0);
    selectInFirstText(block.editor);

    expect(recycler.extendForKey(block.slot, 'right')).toBe(false);
    expect(recycler.island(block.slot).ids).toEqual(['b0']);

    block.editor.update(
      () => {
        const selection = $getSelection();
        const text = $getRoot().getLastDescendant()!;
        if ($isRangeSelection(selection) && $isTextNode(text))
          selection.focus.set(text.getKey(), text.getTextContentSize(), 'text');
      },
      { discrete: true },
    );

    expect(recycler.extendForKey(block.slot, 'right')).toBe(true);
    expect(recycler.island(block.slot).ids).toEqual(['b0', 'b1']);
  });

  it('grows while a drag that started in the block moves below it', () => {
    const { recycler, mount } = setup({ overscan: 300 });
    const block = mount(0);
    const target = block.root.querySelector('span') ?? block.root;
    target.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, button: 0, clientY: 40 }),
    );

    document.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, buttons: 1, clientY: 350 }),
    );
    expect(recycler.island(block.slot).ids).toEqual(['b0', 'b1', 'b2', 'b3']);

    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    document.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, buttons: 1, clientY: 550 }),
    );
    expect(recycler.island(block.slot).ids).toHaveLength(4);
  });
});

describe('virtual editor host placement', () => {
  it('leaves a host in place when it already precedes its next host', () => {
    const parent = document.createElement('div');
    const [host, leaving, next] = [0, 1, 2].map(() => document.createElement('div'));
    parent.append(host, leaving, next);
    const moves: Node[] = [];
    const insertBefore = parent.insertBefore.bind(parent);
    parent.insertBefore = <T extends Node>(node: T, child: Node | null) => {
      moves.push(node);
      return insertBefore(node, child);
    };

    new PreserveNodeManager(4, () => {}).mount(1, host, parent, next);

    expect(moves).toEqual([]);
    expect(host.nextSibling).toBe(leaving);
  });

  it('moves a host that sits after its next host', () => {
    const parent = document.createElement('div');
    const [host, next] = [0, 1].map(() => document.createElement('div'));
    parent.append(next, host);

    new PreserveNodeManager(4, () => {}).mount(1, host, parent, next);

    expect(host.nextSibling).toBe(next);
  });
});

const rowKeys = (recycler: EditorRecycler, from: number, to: number) =>
  recycler.rows.slice(from, to + 1).map((row) => row.key);

const firstKey = (editor: ReturnType<typeof createEditor>) =>
  editor.getEditorState().read(() => $getRoot().getFirstChild()!.getKey());

describe('virtual editor document block selection', () => {
  it('selects every row of the document and reports it per island', () => {
    const { recycler, mount } = setup({ overscan: 300 });
    const block = mount(2);
    let notified = 0;
    recycler.documentBlocks.subscribe(() => notified++);

    recycler.documentBlocks.selectAll();

    expect(recycler.documentBlocks.keys()).toEqual(rowKeys(recycler, 0, 199));
    expect(recycler.documentBlocks.islandKeys(block.editor)).toEqual([firstKey(block.editor)]);
    expect(notified).toBe(1);
  });

  it('extends from an island block selection across rows', () => {
    const { recycler, mount } = setup({ overscan: 300 });
    const block = mount(2);
    const key = firstKey(block.editor);

    recycler.documentBlocks.select(block.editor, key, key);
    expect(recycler.documentBlocks.extend(1)).toBe(true);
    expect(recycler.documentBlocks.keys()).toEqual(rowKeys(recycler, 2, 3));

    recycler.documentBlocks.extend(-1);
    recycler.documentBlocks.extend(-1);
    expect(recycler.documentBlocks.keys()).toEqual(rowKeys(recycler, 1, 2));
  });

  it('clears when an end of the range leaves the document', () => {
    const { recycler, master, mount } = setup({ overscan: 300 });
    const block = mount(2);
    const key = firstKey(block.editor);
    recycler.documentBlocks.select(block.editor, key, key);
    recycler.documentBlocks.extend(1);

    master.update(() => $getRoot().getChildAtIndex(3)!.remove(), { discrete: true });

    expect(recycler.documentBlocks.keys()).toEqual([]);
  });

  it('clears on a pointer press inside the editor', () => {
    const { recycler, mount } = setup({ overscan: 300 });
    const block = mount(0);
    recycler.documentBlocks.selectAll();

    block.root.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));

    expect(recycler.documentBlocks.keys()).toEqual([]);
  });
});

describe('virtual editor block focus', () => {
  it('moves DOM focus into the block it places the caret in', async () => {
    const { recycler, outside, mount } = setup({ overscan: 300 });
    const block = mount(1);
    outside.focus();

    recycler.focusBlock(1, true, false);
    await nextFrame();

    expect(document.activeElement).toBe(block.root);
  });
});
