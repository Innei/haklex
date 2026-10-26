import {
  type BlockMetrics,
  estimateHeight,
  HeightIndex,
  occupiedHeight,
  PreserveNodeManager,
  resolveScrollContainer,
  type Slot,
  TypePool,
} from '@haklex/rich-editor/recycler';
import { flushSync } from 'react-dom';

import type { RendererDocument } from '../static-renderer/surface';
import type { RendererVirtualizationOptions } from './plugin';

export class RendererRecycler {
  readonly pool = new TypePool();
  readonly preserve: PreserveNodeManager;
  readonly viewport: HTMLElement | Window;
  readonly states = new Map<string, Map<string, unknown>>();
  readonly retained = new Map<number, number>();
  heights: HeightIndex;
  private metrics = new Map<string, BlockMetrics>();
  private listeners = new Set<() => void>();
  private observer: ResizeObserver;
  private width: number;
  private frame = 0;
  private dead = false;
  private firstParagraph: number;

  constructor(
    readonly document: RendererDocument,
    readonly canvas: HTMLElement,
    readonly options: RendererVirtualizationOptions,
  ) {
    if (
      options.overscan !== undefined &&
      (!Number.isFinite(options.overscan) || options.overscan < 0)
    )
      throw new Error('Renderer overscan must be a nonnegative number');
    this.viewport = resolveScrollContainer(canvas, options.scrollContainer);
    this.preserve = new PreserveNodeManager(options.preserveCapacity ?? 32, (id) => {
      const slot = this.pool.slots.find((slot) => slot.id === id);
      slot?.beforeRelease?.();
      if (slot) slot.committed = -1;
    });
    this.width = canvas.clientWidth;
    this.heights = this.buildHeights();
    this.firstParagraph =
      this.rows.flatMap((row) => row.blocks).find((block) => block.data.type === 'paragraph')
        ?.index ?? -1;
    this.canvas.style.height = `${this.heights.total}px`;
    this.observer = new ResizeObserver(this.queueMeasure);
    this.observer.observe(canvas);
    if (this.viewport instanceof HTMLElement) this.observer.observe(this.viewport);
    this.viewport.addEventListener('scroll', this.onScroll, { passive: true });
    this.canvas.addEventListener('focusout', this.onFocusOut);
    window.addEventListener('resize', this.onScroll);
    window.addEventListener('hashchange', this.onHash);
    this.refresh(false);
    queueMicrotask(() => {
      if (!this.dead) this.onHash();
    });
  }
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
    return new HeightIndex(
      this.rows.map((row) =>
        row.blocks.reduce((total, block) => {
          const height =
            this.options.estimateBlockHeight?.(block.data, this.width) ??
            estimateHeight(block.data, this.width);
          if (!Number.isFinite(height) || height <= 0)
            throw new Error('Renderer estimated height must be positive and finite');
          return total + height;
        }, 0),
      ),
    );
  }
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  private publish(sync = true) {
    if (this.dead || !this.listeners.size) return;
    const notify = () => this.listeners.forEach((fn) => fn());
    if (sync) flushSync(notify);
    else notify();
  }
  private onScroll = () => this.refresh();
  private onFocusOut = () =>
    queueMicrotask(() => {
      if (!this.dead) this.refresh();
    });
  refresh(sync = true) {
    if (this.dead || !this.rows.length) return;
    const y = Math.max(0, this.scrollTop - this.canvasTop());
    const buffer = this.options.overscan ?? this.viewportHeight() * 1.5;
    const first = this.heights.find(Math.max(0, y - buffer));
    const last = this.heights.find(y + this.viewportHeight() + buffer);
    const indices = Array.from({ length: last - first + 1 }, (_, i) => first + i);
    const wanted = new Set(indices);
    const pinned = new Set(
      this.pool.slots
        .filter(
          (slot) =>
            slot.active &&
            (this.retained.get(slot.id) ||
              slot.element?.contains(globalThis.document.activeElement)),
        )
        .map((slot) => slot.id),
    );
    const resumed = new Set<number>();
    for (const slot of this.pool.slots)
      if ((wanted.has(slot.index) || pinned.has(slot.id)) && this.preserve.activate(slot.id))
        resumed.add(slot.id);
    for (const slot of this.pool.slots)
      if (slot.active && !wanted.has(slot.index) && !pinned.has(slot.id))
        this.preserve.park(slot.id, this.rows[slot.index].id);
    const previous = this.pool.slots.map((slot) => slot.id);
    const changed = this.pool.update(
      indices,
      (index) => this.rows[index].pool,
      pinned,
      new Set([...this.preserve.ids(), ...resumed]),
    );
    for (const id of previous)
      if (!this.pool.slots.some((slot) => slot.id === id)) this.preserve.forget(id);
    if (changed) this.publish(sync);
  }
  mount(slot: Slot, host: HTMLElement) {
    const next = this.pool.slots
      .filter((other) => other.active && other.index > slot.index)
      .sort((a, b) => a.index - b.index)
      .map((other) => this.preserve.host(other.id))
      .find((element) => element?.parentElement === this.canvas);
    this.preserve.mount(slot.id, host, slot.active ? this.canvas : null, next ?? null);
  }
  attach(slot: Slot, element: HTMLElement | null) {
    if (slot.element) this.observer.unobserve(slot.element);
    slot.element = element ?? undefined;
    if (element) this.observer.observe(element);
  }
  nodeState(id: string, key?: string) {
    const path = `${id}:${this.document.nodePath(key)}`;
    let state = this.states.get(path);
    if (!state) {
      state = new Map();
      this.states.set(path, state);
    }
    return state;
  }
  capturePanels(slot: Slot) {
    this.nodeState(this.rows[slot.index].id).set(
      'details',
      [...(slot.element?.querySelectorAll('details') ?? [])].map((panel) => panel.open),
    );
  }
  bind(slot: Slot) {
    if (slot.committed === slot.generation) return;
    slot.committed = slot.generation;
    const saved = this.nodeState(this.rows[slot.index].id).get('details') as boolean[] | undefined;
    const defaults: boolean[] = [];
    const walk = (node: any) => {
      if (node.type === 'details') defaults.push(!!node.open);
      node.children?.forEach(walk);
    };
    walk(this.rows[slot.index].data);
    slot.element
      ?.querySelectorAll('details')
      .forEach((panel, index) => (panel.open = saved?.[index] ?? defaults[index] ?? false));
  }
  private get leadingMargin() {
    return this.metrics.get(this.rows[0]?.id)?.top ?? 0;
  }
  blockOffset(index: number) {
    return this.heights.offset(index) + this.leadingMargin;
  }
  slotOffset(slot: Slot) {
    return this.blockOffset(slot.index) - (this.metrics.get(this.rows[slot.index]?.id)?.top ?? 0);
  }
  private anchor() {
    const bounds = this.canvas.getBoundingClientRect();
    const target = globalThis.document
      .elementFromPoint(
        bounds.left + bounds.width / 2,
        Math.max(this.viewportTop() + 8, bounds.top + 1),
      )
      ?.closest('[data-virtual-renderer-slot]');
    const slot = this.pool.slots.find((slot) => slot.active && slot.element === target);
    const index = slot?.index ?? this.heights.find(Math.max(0, this.scrollTop - this.canvasTop()));
    return { index, offset: this.scrollTop - this.canvasTop() - this.blockOffset(index) };
  }
  private queueMeasure = () => {
    if (!this.dead && !this.frame) this.frame = requestAnimationFrame(() => this.measure());
  };
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
      const root = slot.element?.firstElementChild;
      if (!root) continue;
      root.setAttribute(
        'data-rich-nested',
        this.canvas.closest('.rich-content')?.getAttribute('data-rich-nested') ?? 'false',
      );
      const elements = [...root.children] as HTMLElement[];
      const blocks = this.rows[slot.index].blocks;
      elements.forEach((element, position) => {
        const block = blocks[position];
        if (!block) return;
        element.dataset.blockId = block.id;
        element.dataset.rendererBlockIndex = String(block.index);
        element.toggleAttribute('data-document-first', slot.index === 0 && position === 0);
        element.toggleAttribute(
          'data-document-last',
          slot.index === this.rows.length - 1 && position === elements.length - 1,
        );
        element.toggleAttribute(
          'data-document-first-paragraph',
          block.index === this.firstParagraph,
        );
        const previous =
          blocks[position - 1]?.data ?? this.rows[slot.index - 1]?.blocks.at(-1)?.data;
        element.dataset.documentPrevTag =
          previous?.type === 'heading'
            ? previous.tag
            : previous?.type === 'horizontalrule'
              ? 'hr'
              : '';
      });
      const bounds = root.getBoundingClientRect();
      const rects = elements
        .filter((element) => getComputedStyle(element).display !== 'none')
        .map((element) => element.getBoundingClientRect());
      const start = rects.length ? Math.min(...rects.map((rect) => rect.top)) : bounds.top;
      const end = rects.length ? Math.max(...rects.map((rect) => rect.bottom)) : bounds.bottom;
      const top = start - bounds.top;
      if (Math.abs(top - (this.metrics.get(this.rows[slot.index].id)?.top ?? 0)) > 0.1)
        changed = true;
      this.metrics.set(this.rows[slot.index].id, {
        height: end - start,
        top,
        bottom: bounds.bottom - end,
      });
      measured.add(slot.index);
      if (slot.index > 0) measured.add(slot.index - 1);
    }
    for (const index of measured) {
      const metric = this.metrics.get(this.rows[index].id);
      if (!metric) continue;
      const height = Math.max(
        0,
        occupiedHeight(metric, this.metrics.get(this.rows[index + 1]?.id)),
      );
      if (Math.abs(height - this.heights.values[index]) > 0.1) {
        this.heights.update(index, height);
        changed = true;
      }
    }
    if (changed) {
      this.canvas.style.height = `${this.heights.total + this.leadingMargin}px`;
      this.setScrollTop(this.canvasTop() + this.blockOffset(anchor.index) + anchor.offset);
      this.refresh(false);
      this.publish(sync);
    }
  }
  scrollTo(index: number) {
    if (!this.rows.length) return;
    this.setScrollTop(
      this.canvasTop() + this.blockOffset(Math.max(0, Math.min(index, this.rows.length - 1))),
    );
    this.refresh();
  }
  private onHash = () => {
    let slug: string;
    try {
      slug = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    const index = this.document.headingRows.get(slug);
    if (index !== undefined) {
      this.scrollTo(index);
      const target = this.canvas.querySelector(`#${CSS.escape(slug)}`);
      if (target)
        this.setScrollTop(this.scrollTop + target.getBoundingClientRect().top - this.viewportTop());
    }
  };
  dispose() {
    this.dead = true;
    this.observer.disconnect();
    cancelAnimationFrame(this.frame);
    this.viewport.removeEventListener('scroll', this.onScroll);
    this.canvas.removeEventListener('focusout', this.onFocusOut);
    window.removeEventListener('resize', this.onScroll);
    window.removeEventListener('hashchange', this.onHash);
    this.preserve.clear();
    this.listeners.clear();
  }
}
