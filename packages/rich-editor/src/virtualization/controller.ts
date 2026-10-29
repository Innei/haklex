import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $parseSerializedNode,
  $setSelection,
  $setState,
  createEditor,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  SKIP_DOM_SELECTION_TAG,
  SKIP_SCROLL_INTO_VIEW_TAG,
} from 'lexical';
import { nanoid } from 'nanoid';
import { flushSync } from 'react-dom';

import { blockIdState } from '../plugins/BlockIdPlugin';
import { DocumentBlockSelection } from './blocks';
import { type SerializedBlock, VirtualDocument } from './document';
import {
  type BlockMetrics,
  estimateHeight,
  HeightIndex,
  occupiedHeight,
  type Slot,
  TypePool,
} from './layout';
import { PreserveNodeManager } from './preserve';
import { $syncChildren } from './sync';
import type { EditorVirtualizationOptions } from './types';
import { resolveScrollContainer } from './viewport';

function $topLevel(node: LexicalNode | null) {
  while (node?.getParent() && node.getParent()!.getType() !== 'root') node = node.getParent();
  return node?.getParent() ? node : null;
}

function caretFromPoint(x: number, y: number) {
  const position = document.caretPositionFromPoint?.(x, y);
  if (position) return { node: position.offsetNode, offset: position.offset };
  const range = document.caretRangeFromPoint?.(x, y);
  return range ? { node: range.startContainer, offset: range.startOffset } : null;
}

export interface Island {
  data: string;
  editor: LexicalEditor;
  generation: number;
  ids: string[];
  loading: boolean;
  retained: number;
  source: boolean;
  unsubscribe: () => void;
}

export class EditorRecycler {
  readonly document: VirtualDocument;
  readonly pool = new TypePool();
  readonly islands = new Map<number, Island>();
  readonly states = new Map<string, Map<string, unknown>>();
  readonly viewport: HTMLElement | Window;
  readonly preserve: PreserveNodeManager;
  readonly documentBlocks = new DocumentBlockSelection(this);
  heights: HeightIndex;
  revision = 0;
  private indices = new Map<string, number>();
  private listeners = new Set<() => void>();
  private observer: ResizeObserver;
  private frame = 0;
  private dead = false;
  private width: number;
  private metrics = new Map<string, BlockMetrics>();
  private firstParagraph = -1;
  private selectionOwner?: number;
  private splitting = new Set<number>();
  private drag?: { slot: Slot; y: number };

  constructor(
    readonly master: LexicalEditor,
    readonly canvas: HTMLElement,
    readonly options: EditorVirtualizationOptions,
  ) {
    this.viewport = resolveScrollContainer(canvas, options.scrollContainer);
    this.preserve = new PreserveNodeManager(options.preserveCapacity ?? 32, (id) => {
      this.pool.slots.find((slot) => slot.id === id)?.beforeRelease?.();
    });
    if (
      options.overscan !== undefined &&
      (!Number.isFinite(options.overscan) || options.overscan < 0)
    )
      throw new Error('Virtual editor overscan must be a nonnegative number');
    this.document = new VirtualDocument(master);
    this.indices = new Map(this.rows.map((row, index) => [row.id, index]));
    this.firstParagraph = this.rows.findIndex((row) => row.data.type === 'paragraph');
    master.update(() => $getRoot().markDirty(), { discrete: true, tag: 'history-merge' });
    this.width = canvas.clientWidth;
    try {
      this.heights = this.buildHeights();
    } catch (error) {
      this.document.dispose();
      throw error;
    }
    canvas.style.height = `${this.heights.total}px`;
    this.document.onChange = (source) => {
      this.reconcileDocument(source);
    };
    this.previousRows = this.rows.map((row) => ({ id: row.id, data: row.data }));
    this.observer = new ResizeObserver(() => this.queueMeasure());
    this.observer.observe(canvas);
    if (this.viewport instanceof HTMLElement) this.observer.observe(this.viewport);
    this.viewport.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll);
    canvas.addEventListener('focusin', this.onFocusIn);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    this.refresh(false);
  }

  private previousRows: Array<{ id: string; data: SerializedBlock }> = [];
  get rows() {
    return this.document.rows;
  }
  get scrollTop() {
    return this.viewport instanceof HTMLElement ? this.viewport.scrollTop : window.scrollY;
  }
  private setScrollTop(top: number) {
    if (this.viewport instanceof HTMLElement) this.viewport.scrollTop = top;
    else window.scrollTo(window.scrollX, top);
  }
  private viewportTop() {
    return this.viewport instanceof HTMLElement
      ? this.viewport.getBoundingClientRect().top + this.viewport.clientTop
      : 0;
  }
  private viewportHeight() {
    return this.viewport instanceof HTMLElement ? this.viewport.clientHeight : window.innerHeight;
  }
  private canvasTop() {
    return this.canvas.getBoundingClientRect().top - this.viewportTop() + this.scrollTop;
  }
  private buildHeights() {
    return new HeightIndex(this.rows.map((row) => this.estimate(row.data)));
  }
  private estimate(data: SerializedBlock) {
    const height =
      this.options.estimateBlockHeight?.(data, this.width) ?? estimateHeight(data, this.width);
    if (!Number.isFinite(height) || height <= 0)
      throw new Error('Virtual editor estimated height must be positive and finite');
    return Math.max(24, height);
  }
  private reconcileDocument(source?: string) {
    const anchor = this.anchor();
    const previous = new Map(
      this.previousRows.map((row, index) => [
        row.id,
        { ...row, height: this.heights.values[index] },
      ]),
    );
    if (
      this.rows.length !== this.previousRows.length ||
      this.rows.some((row, i) => row.id !== this.previousRows[i].id)
    )
      this.heights = new HeightIndex(
        this.rows.map((row) => previous.get(row.id)?.height ?? this.estimate(row.data)),
      );
    const indices = new Map(this.rows.map((row, index) => [row.id, index]));
    this.indices = indices;
    this.documentBlocks.prune();
    this.firstParagraph = this.rows.findIndex((row) => row.data.type === 'paragraph');
    for (const id of this.metrics.keys()) if (!indices.has(id)) this.metrics.delete(id);
    for (const slot of this.pool.slots) {
      const island = this.islands.get(slot.id);
      if (!island) continue;
      const positions = island.ids.flatMap((id) => indices.get(id) ?? []);
      island.ids =
        positions.length > 1
          ? this.rows.slice(Math.min(...positions), Math.max(...positions) + 1).map((row) => row.id)
          : positions.map((index) => this.rows[index].id);
      island.source = source === `virtual-island:${slot.id}`;
      if (island.ids.length) {
        slot.index = indices.get(island.ids[0])!;
        slot.pool = this.rows[slot.index].pool;
      } else {
        slot.beforeRelease?.();
        slot.active = false;
      }
    }
    this.pool.slots = this.pool.slots.filter((slot) => {
      const island = this.islands.get(slot.id);
      if (!island || island.ids.length) return true;
      island.unsubscribe();
      this.preserve.forget(slot.id);
      this.islands.delete(slot.id);
      this.pool.disposed++;
      return false;
    });
    this.previousRows = this.rows.map((row) => ({ id: row.id, data: row.data }));
    this.restore(anchor);
    this.refresh(false);
    this.publish();
    this.queueMeasure();
  }
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  private publish(sync = true) {
    if (this.dead || !this.listeners.size) return;
    this.revision++;
    const notify = () => this.listeners.forEach((listener) => listener());
    if (sync) flushSync(notify);
    else notify();
  }
  private onScroll = () => {
    this.refresh();
    if (this.drag) this.dragTo(this.drag.y);
  };
  indexOf(id: string) {
    return this.indices.get(id);
  }
  islandIds(editor: LexicalEditor) {
    for (const island of this.islands.values()) if (island.editor === editor) return island.ids;
  }
  private onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    this.documentBlocks.clear();
    const target = this.pool.slots.find(
      (item) => item.active && item.element?.contains(event.target as Node),
    );
    if (!target) return;
    const owner = this.pool.slots.find((item) => item.active && item.id === this.selectionOwner);
    const slot = event.shiftKey && owner && owner !== target ? owner : target;
    const root = this.island(slot).editor.getRootElement();
    if (!root) return;
    if (slot !== target) {
      event.preventDefault();
      this.extendToPoint(slot, root, event.clientX, event.clientY);
    } else if ((event.target as Element).closest?.('[contenteditable]') !== root) return;
    this.drag = { slot, y: event.clientY };
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.endDrag);
    document.addEventListener('pointercancel', this.endDrag);
  };
  private onPointerMove = (event: PointerEvent) => {
    if (!this.drag) return;
    if (!(event.buttons & 1)) return this.endDrag();
    this.drag.y = event.clientY;
    this.dragTo(event.clientY);
  };
  private endDrag = () => {
    this.drag = undefined;
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.endDrag);
    document.removeEventListener('pointercancel', this.endDrag);
  };
  private rowAt(clientY: number) {
    const y = clientY - this.canvas.getBoundingClientRect().top - this.leadingMargin;
    return this.heights.find(Math.max(0, y));
  }
  private dragTo(clientY: number) {
    const slot = this.drag?.slot;
    if (!slot?.active) return;
    const index = this.rowAt(clientY);
    if (index < slot.index || index >= slot.index + this.island(slot).ids.length)
      this.extendIsland(slot, index, true);
  }
  private extendToPoint(slot: Slot, root: HTMLElement, x: number, y: number) {
    if (!this.extendIsland(slot, this.rowAt(y), true)) return;
    const selection = window.getSelection();
    const caret = caretFromPoint(x, y);
    if (
      selection?.anchorNode &&
      root.contains(selection.anchorNode) &&
      caret &&
      root.contains(caret.node)
    )
      selection.extend(caret.node, caret.offset);
  }
  private onFocusIn = (event: FocusEvent) => {
    const slot = this.pool.slots.find((item) => item.element?.contains(event.target as Node));
    if (slot) this.selectionOwner = slot.id;
  };
  private holdsSelection(slot: Slot, island: Island) {
    return (
      slot.id === this.selectionOwner &&
      island.editor.getEditorState().read(() => $getSelection() !== null)
    );
  }
  refresh(sync = true) {
    if (this.dead || !this.rows.length) return;
    const y = Math.max(0, this.scrollTop - this.canvasTop());
    const buffer = this.options.overscan ?? this.viewportHeight() * 1.5;
    const first = this.heights.find(Math.max(0, y - buffer));
    const last = this.heights.find(y + this.viewportHeight() + buffer);
    const covered = new Set<number>();
    const groupHeads: number[] = [];
    const pinned = new Set<number>();
    for (const slot of this.pool.slots) {
      const island = this.islands.get(slot.id);
      if (!island || (!slot.active && !this.preserve.has(slot.id))) continue;
      if (
        island.retained ||
        island.editor.isComposing() ||
        slot.element?.contains(document.activeElement) ||
        this.holdsSelection(slot, island)
      )
        pinned.add(slot.id);
      for (let i = 1; i < island.ids.length; i++) covered.add(slot.index + i);
      if (island.ids.length > 1 && slot.index < first && slot.index + island.ids.length > first)
        groupHeads.push(slot.index);
    }
    const indices = [
      ...groupHeads,
      ...Array.from({ length: last - first + 1 }, (_, i) => first + i),
    ].filter((i) => !covered.has(i));
    const wanted = new Set(indices);
    const resumed = new Set<number>();
    for (const slot of this.pool.slots)
      if ((wanted.has(slot.index) || pinned.has(slot.id)) && this.preserve.activate(slot.id))
        resumed.add(slot.id);
    for (const slot of this.pool.slots)
      if (slot.active && !wanted.has(slot.index) && !pinned.has(slot.id))
        this.preserve.park(slot.id, this.islands.get(slot.id)?.ids.join(',') ?? '');
    const protectedSlots = new Set([...this.preserve.ids(), ...resumed]);
    const changed = this.pool.update(indices, (i) => this.rows[i].pool, pinned, protectedSlots);
    for (const [id, island] of this.islands)
      if (!this.pool.slots.some((slot) => slot.id === id)) {
        island.unsubscribe();
        island.editor.setRootElement(null);
        this.preserve.forget(id);
        this.islands.delete(id);
      }
    if (changed) this.publish(sync);
  }
  island(slot: Slot) {
    let island = this.islands.get(slot.id);
    if (island) return island;
    const editor = this.master.read(() => createEditor());
    island = {
      editor,
      ids: [],
      generation: -1,
      loading: false,
      source: false,
      data: '',
      unsubscribe: () => {},
      retained: 0,
    };
    this.islands.set(slot.id, island);
    island.unsubscribe = editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves, tags }) => {
        if (island!.ids.length > 1) this.queueSplit(slot);
        if (
          island!.loading ||
          !island!.ids.length ||
          tags.has('virtual-bind') ||
          (!dirtyElements.size && !dirtyLeaves.size)
        )
          return;
        const children = editorState.toJSON().root.children as SerializedBlock[];
        const serialized = JSON.stringify(children);
        if (serialized === island!.data) return;
        const used = new Set<string>();
        children.forEach((data, i) => {
          let id = data.$?.blockId;
          const foreign = this.indices.has(id) && !island!.ids.includes(id);
          if (!id || used.has(id) || foreign) id = i === 0 ? island!.ids[0] : nanoid(8);
          data.$ = { ...data.$, blockId: id };
          used.add(id);
        });
        const oldIds = [...island!.ids];
        island!.ids = children.map((data) => data.$!.blockId);
        island!.data = JSON.stringify(children);
        editor.update(
          () =>
            $getRoot()
              .getChildren()
              .forEach((node, i) => $setState(node, blockIdState, island!.ids[i])),
          { tag: 'virtual-bind' },
        );
        this.document.replace(oldIds, children, String(slot.id));
      },
    );
    return island;
  }
  bind(slot: Slot) {
    const island = this.island(slot);
    const rebound = island.generation !== slot.generation;
    if (rebound) island.ids = [this.rows[slot.index].id];
    const rows = island.ids
      .map((id) => this.rows[this.indices.get(id) ?? -1])
      .filter((row) => !!row);
    if (!rows.length) return;
    const children = rows.map((row) => row.data);
    const data = JSON.stringify(children);
    if (!rebound && (island.source || data === island.data)) {
      island.source = false;
      island.data = data;
      return;
    }
    island.generation = slot.generation;
    island.data = data;
    island.loading = true;
    try {
      island.editor.update(
        () => {
          $syncChildren($getRoot(), children);
          if (rebound) $setSelection(null);
        },
        {
          discrete: true,
          tag: rebound ? ['virtual-bind', SKIP_DOM_SELECTION_TAG] : 'virtual-bind',
        },
      );
    } finally {
      island.loading = false;
    }
    this.restorePanels(slot);
    this.queueMeasure();
  }
  attach(slot: Slot, element: HTMLElement | null) {
    if (slot.element) this.observer.unobserve(slot.element);
    slot.element = element ?? undefined;
    if (element) this.observer.observe(element);
  }
  mount(slot: Slot, host: HTMLElement) {
    const next = this.pool.slots
      .filter((other) => other.active && other.index > slot.index)
      .sort((a, b) => a.index - b.index)
      .map((other) => this.preserve.host(other.id))
      .find((element) => element?.parentElement === this.canvas);
    this.preserve.mount(slot.id, host, slot.active ? this.canvas : null, next ?? null);
  }
  state(id: string) {
    let state = this.states.get(id);
    if (!state) {
      state = new Map();
      this.states.set(id, state);
    }
    return state;
  }
  nodeState(slot: Slot, key: NodeKey | undefined, expectedId: string) {
    const island = this.island(slot);
    const scope = island.editor.getEditorState().read(() => {
      let node = key ? $getNodeByKey(key) : $getRoot().getFirstChild();
      const path: number[] = [];
      while (node?.getParent() && node.getParent()!.getType() !== 'root') {
        path.unshift(node.getIndexWithinParent());
        node = node.getParent();
      }
      const index = node?.getIndexWithinParent() ?? 0;
      const id = index === 0 ? expectedId : (island.ids[index] ?? expectedId);
      return `${id}:${path.join('.')}`;
    });
    return this.state(scope);
  }
  capturePanels(slot: Slot) {
    const id = this.islands.get(slot.id)?.ids[0];
    if (!id) return;
    this.state(id).set(
      'details',
      this.panels(slot).map(({ panel }) => panel.open),
    );
  }
  restorePanels(slot: Slot) {
    const saved = this.state(this.island(slot).ids[0]).get('details') as boolean[] | undefined;
    this.panels(slot).forEach(({ panel, initialOpen }, i) => {
      panel.open = saved?.[i] ?? initialOpen;
    });
  }
  private panels(slot: Slot) {
    const editor = this.island(slot).editor;
    return editor.getEditorState().read(() => {
      const panels: Array<{ panel: HTMLDetailsElement; initialOpen: boolean }> = [];
      const walk = (node: LexicalNode) => {
        if (node.getType() === 'details') {
          const panel = editor.getElementByKey(node.getKey());
          if (panel instanceof HTMLDetailsElement)
            panels.push({
              panel,
              initialOpen: (node as LexicalNode & { getOpen: () => boolean }).getOpen(),
            });
        }
        if ($isElementNode(node)) node.getChildren().forEach(walk);
      };
      walk($getRoot());
      return panels;
    });
  }
  private anchor() {
    const bounds = this.canvas.getBoundingClientRect();
    const target = document
      .elementFromPoint(
        bounds.left + bounds.width / 2,
        Math.max(this.viewportTop() + 8, bounds.top + 1),
      )
      ?.closest('[data-virtual-editor-slot]');
    const slot = this.pool.slots.find((item) => item.active && item.element === target);
    const index = slot?.index ?? this.heights.find(Math.max(0, this.scrollTop - this.canvasTop()));
    return {
      id: this.previousRows[index]?.id ?? this.rows[index]?.id,
      offset: this.scrollTop - this.canvasTop() - this.blockOffset(index),
    };
  }
  private restore(anchor: ReturnType<EditorRecycler['anchor']>) {
    this.canvas.style.height = `${this.heights.total + this.leadingMargin}px`;
    const index = anchor.id ? (this.indices.get(anchor.id) ?? -1) : -1;
    if (index >= 0) this.setScrollTop(this.canvasTop() + this.blockOffset(index) + anchor.offset);
  }
  private queueMeasure() {
    if (!this.dead && !this.frame) this.frame = requestAnimationFrame(() => this.measure());
  }
  slotOffset(slot: Slot) {
    return this.blockOffset(slot.index) - (this.metrics.get(this.rows[slot.index]?.id)?.top ?? 0);
  }
  private get leadingMargin() {
    return this.metrics.get(this.rows[0]?.id)?.top ?? 0;
  }
  blockOffset(index: number) {
    return this.heights.offset(index) + this.leadingMargin;
  }
  commitLayout() {
    cancelAnimationFrame(this.frame);
    this.measure(false);
  }
  private measure(sync = true) {
    this.frame = 0;
    if (this.dead) return;
    const anchor = this.anchor();
    let changed = false;
    if (Math.abs(this.canvas.clientWidth - this.width) > 0.5) {
      this.width = this.canvas.clientWidth;
      this.metrics.clear();
      this.heights = this.buildHeights();
      changed = true;
    }
    const measured = new Set<number>();
    for (const slot of this.pool.slots) {
      if (!slot.active) continue;
      const island = this.islands.get(slot.id);
      const root = island?.editor.getRootElement();
      if (!root || !island?.ids.length) continue;
      const elements = island.editor.getEditorState().read(() =>
        $getRoot()
          .getChildren()
          .map((node) => island.editor.getElementByKey(node.getKey())),
      );
      elements.forEach((element, i) => {
        if (!element) return;
        const index = this.indices.get(island.ids[i]) ?? -1;
        const previous = this.rows[index - 1]?.data;
        element.toggleAttribute(
          'data-document-first',
          index === 0 && element === root.firstElementChild,
        );
        element.toggleAttribute(
          'data-document-last',
          index === this.rows.length - 1 && element === root.lastElementChild,
        );
        element.toggleAttribute('data-document-first-paragraph', index === this.firstParagraph);
        element.dataset.documentPrevTag =
          previous?.type === 'heading'
            ? previous.tag
            : previous?.type === 'horizontalrule'
              ? 'hr'
              : '';
      });
      const bounds = root.getBoundingClientRect();
      const rects = elements.map((element) => element?.getBoundingClientRect());
      island.ids.forEach((id, i) => {
        const index = this.indices.get(id) ?? -1;
        const element = elements[i];
        if (index < 0 || !element) return;
        element.dataset.blockId = id;
        const rect = rects[i]!;
        const style = getComputedStyle(element);
        const top = i === 0 ? rect.top - bounds.top : parseFloat(style.marginTop) || 0;
        const bottom =
          i === island.ids.length - 1
            ? bounds.bottom - rect.bottom
            : parseFloat(style.marginBottom) || 0;
        if (Math.abs(top - (this.metrics.get(id)?.top ?? 0)) > 0.1) changed = true;
        this.metrics.set(id, {
          height: rect.height,
          top,
          bottom,
          gap: rects[i + 1] ? rects[i + 1]!.top - rect.bottom : undefined,
        });
        measured.add(index);
        if (index > 0) measured.add(index - 1);
      });
    }
    for (const index of measured) {
      const metrics = this.metrics.get(this.rows[index].id);
      if (!metrics) continue;
      const height = Math.max(
        1,
        occupiedHeight(metrics, this.metrics.get(this.rows[index + 1]?.id)),
      );
      if (Math.abs(height - this.heights.values[index]) > 0.1) {
        this.heights.update(index, height);
        changed = true;
      }
    }
    if (changed) {
      this.restore(anchor);
      this.refresh(false);
      this.publish(sync);
    }
  }
  scrollTo(index: number) {
    this.setScrollTop(
      this.canvasTop() + this.blockOffset(Math.max(0, Math.min(index, this.rows.length - 1))),
    );
    this.refresh();
  }
  focusBlock(index: number, end = false, scroll = true) {
    if (index < 0 || index >= this.rows.length) return;
    if (scroll) this.scrollTo(index);
    requestAnimationFrame(() => {
      const slot = this.pool.slots.find(
        (item) => item.active && this.islands.get(item.id)?.ids.includes(this.rows[index]?.id),
      );
      if (!slot) return;
      const { editor } = this.island(slot);
      // Lexical writes a DOM selection into an unfocused root without focusing it.
      editor.getRootElement()?.focus({ preventScroll: true });
      editor.update(
        () => {
          if (end) $getRoot().selectEnd();
          else $getRoot().selectStart();
        },
        { tag: scroll ? undefined : SKIP_SCROLL_INTO_VIEW_TAG },
      );
    });
  }
  extendIsland(slot: Slot, toIndex: number, sync = false) {
    const island = this.island(slot);
    const first = slot.index;
    const last = first + island.ids.length - 1;
    const target = Math.max(0, Math.min(toIndex, this.rows.length - 1));
    if (target >= first && target <= last) return true;
    const backward = target < first;
    const added = backward ? this.rows.slice(target, first) : this.rows.slice(last + 1, target + 1);
    if (island.ids.length + added.length > (this.options.selectionMergeLimit ?? 200)) return false;
    const addedIds = new Set(added.map((row) => row.id));
    const holders = this.pool.slots.filter(
      (other) => other !== slot && this.islands.get(other.id)?.ids.some((id) => addedIds.has(id)),
    );
    if (
      holders.some((other) => {
        const held = this.islands.get(other.id)!;
        return held.retained > 0 || held.editor.isComposing();
      })
    )
      return false;
    for (const other of holders) {
      other.beforeRelease?.();
      other.active = false;
      this.islands.get(other.id)!.generation = -1;
    }
    island.ids = backward ? [...addedIds, ...island.ids] : [...island.ids, ...addedIds];
    if (backward) slot.index = target;
    island.data = JSON.stringify(island.ids.map((id) => this.rows[this.indices.get(id)!].data));
    island.editor.update(
      () => {
        const nodes = added.map((row) => $parseSerializedNode(row.data));
        const head = $getRoot().getFirstChild();
        if (backward && head) nodes.forEach((node) => head.insertBefore(node));
        else $getRoot().append(...nodes);
      },
      { discrete: true, tag: ['virtual-bind', SKIP_DOM_SELECTION_TAG] },
    );
    this.refresh(false);
    this.publish(sync);
    this.queueMeasure();
    return true;
  }
  extendForKey(slot: Slot, key: 'up' | 'down' | 'left' | 'right') {
    const island = this.island(slot);
    const forward = key === 'down' || key === 'right';
    const atEdge = island.editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return false;
      const root = $getRoot();
      const focus = selection.focus.getNode();
      if (key === 'up' || key === 'down')
        return $topLevel(focus)?.is(forward ? root.getLastChild() : root.getFirstChild()) ?? false;
      const edge = forward ? root.getLastDescendant() : root.getFirstDescendant();
      return (
        !!edge &&
        focus.is(edge) &&
        selection.focus.offset === (forward ? edge.getTextContentSize() : 0)
      );
    });
    const index = forward ? slot.index + island.ids.length : slot.index - 1;
    if (!atEdge || index < 0 || index >= this.rows.length) return false;
    return this.extendIsland(slot, index);
  }
  splitIsland(slot: Slot) {
    const island = this.islands.get(slot.id);
    if (!island || island.ids.length < 2) return;
    const keep = island.editor.getEditorState().read(() => {
      const selection = $getSelection();
      const node = $topLevel($isRangeSelection(selection) ? selection.focus.getNode() : null);
      return node?.getIndexWithinParent() ?? 0;
    });
    const id = island.ids[keep] ?? island.ids[0];
    island.ids = [id];
    slot.index = this.indices.get(id)!;
    island.data = JSON.stringify([this.rows[slot.index].data]);
    island.editor.update(
      () =>
        $getRoot()
          .getChildren()
          .forEach((node, i) => {
            if (i !== keep) node.remove();
          }),
      { discrete: true, tag: 'virtual-bind' },
    );
    this.refresh(false);
    this.publish();
    this.queueMeasure();
  }
  private queueSplit(slot: Slot) {
    if (this.splitting.has(slot.id)) return;
    this.splitting.add(slot.id);
    requestAnimationFrame(() => {
      this.splitting.delete(slot.id);
      const island = this.islands.get(slot.id);
      if (this.dead || !slot.active || !island || island.editor.isComposing()) return;
      const live = window.getSelection();
      const root = island.editor.getRootElement();
      if (live && !live.isCollapsed && live.anchorNode && root?.contains(live.anchorNode)) return;
      const collapsed = island.editor.getEditorState().read(() => {
        const selection = $getSelection();
        return selection === null || ($isRangeSelection(selection) && selection.isCollapsed());
      });
      if (collapsed) this.splitIsland(slot);
    });
  }
  joinNeighbor(slot: Slot, backward: boolean) {
    const island = this.island(slot);
    const index = backward ? slot.index - 1 : slot.index + island.ids.length;
    const row = this.rows[index];
    if (!row) return false;
    for (const other of this.pool.slots)
      if (other !== slot && this.islands.get(other.id)?.ids.includes(row.id)) {
        other.beforeRelease?.();
        other.active = false;
      }
    island.ids = backward ? [row.id, ...island.ids] : [...island.ids, row.id];
    if (backward) slot.index = index;
    island.editor.update(
      () => {
        const node = $parseSerializedNode(row.data);
        if (backward) $getRoot().getFirstChild()!.insertBefore(node);
        else $getRoot().append(node);
        const selection = $getSelection();
        if ($isRangeSelection(selection)) selection.deleteCharacter(backward);
      },
      { discrete: true },
    );
    return true;
  }
  dispose() {
    this.dead = true;
    this.document.dispose();
    this.observer.disconnect();
    cancelAnimationFrame(this.frame);
    this.viewport.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    this.canvas.removeEventListener('focusin', this.onFocusIn);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.endDrag();
    for (const island of this.islands.values()) island.unsubscribe();
    this.listeners.clear();
    this.preserve.clear();
  }
}
