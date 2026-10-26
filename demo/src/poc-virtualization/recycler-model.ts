import { flushSync } from 'react-dom';

import {
  HeightIndex,
  type Slot,
  TypePool,
} from '../../../packages/rich-editor/src/virtualization/layout';
import type { BlockData, RenderPlan } from './recycler-plan';

export { HeightIndex, TypePool };
export type { Slot };

export interface ViewState {
  details: Record<string, boolean>;
  dynamic?: unknown;
  imageReady?: boolean;
}

const weights = new WeakMap<BlockData, number>();
function textUnits(node: BlockData): number {
  const cached = weights.get(node);
  if (cached !== undefined) return cached;
  const value =
    typeof node.text === 'string'
      ? node.text.replaceAll(/[\u0080-\uFFFF]/g, 'xx').length
      : (node.children ?? []).reduce((sum, child) => sum + textUnits(child), 0);
  weights.set(node, value);
  return value;
}

export function estimateHeight(
  node: BlockData,
  width: number,
  state?: ViewState,
  path = '0',
): number {
  const children = () =>
    (node.children ?? []).reduce(
      (sum, child, i) =>
        sum +
        estimateHeight(child, width - (node.type === 'details' ? 40 : 0), state, `${path}.${i}`),
      0,
    );
  switch (node.type) {
    case 'paragraph': {
      return Math.max(1, Math.ceil((textUnits(node) * 8) / Math.max(80, width))) * 28 + 16;
    }
    case 'image': {
      return node.width && node.height
        ? (Math.min(width, node.width) * node.height) / node.width + 64
        : 220;
    }
    case 'details': {
      return 64 + ((state?.details[path] ?? node.open) ? children() + 32 : 0);
    }
    case 'dynamic': {
      return (node.initialHeight ?? 320) + 40;
    }
    case 'table': {
      return (
        (node.children ?? []).reduce(
          (sum, row) =>
            sum +
            Math.max(
              48,
              ...(row.children ?? []).map((cell) =>
                estimateHeight(cell, width / Math.max(1, row.children?.length ?? 1), state),
              ),
            ) +
            20,
          0,
        ) + 32
      );
    }
    case 'code': {
      return 280;
    }
    default: {
      return Math.max(24, children() + 16);
    }
  }
}

export class RecyclerModel {
  readonly pool = new TypePool();
  readonly states = new Map<string, ViewState>();
  heights: HeightIndex;
  measured = new Set<number>();
  width: number;
  measurements = 0;
  corrections = 0;
  maxCorrection = 0;
  renders = 0;
  widgetMounts = 0;
  widgetBinds = 0;
  widgetUnmounts = 0;
  private listeners = new Set<() => void>();
  private observer: ResizeObserver;
  private observed = new WeakMap<Element, number>();
  private pending = new Map<number, number>();
  private raf = 0;
  private dead = false;

  constructor(
    readonly root: HTMLElement,
    readonly canvas: HTMLElement,
    public plan: RenderPlan,
  ) {
    this.width = canvas.clientWidth;
    this.heights = this.buildHeights();
    canvas.style.height = `${this.heights.total}px`;
    this.observer = new ResizeObserver((events) => {
      let resized = false;
      for (const event of events) {
        if (event.target === canvas || event.target === root) {
          if (Math.abs(canvas.clientWidth - this.width) > 0.5) this.resize(canvas.clientWidth);
          resized = true;
        } else {
          const slot = this.pool.slots.find((item) => item.id === this.observed.get(event.target));
          if (slot?.active) this.queueMeasure(slot);
        }
      }
      if (resized) this.refresh();
    });
    this.observer.observe(canvas);
    this.observer.observe(root);
    root.addEventListener('scroll', this.onScroll, { passive: true });
    root.addEventListener('focusout', this.onFocusOut);
    this.refresh(false);
  }

  private buildHeights() {
    return new HeightIndex(
      this.plan.rows.map((row) => estimateHeight(row.data, this.width, this.states.get(row.id))),
    );
  }
  state(id: string) {
    let state = this.states.get(id);
    if (!state) {
      state = { details: {} };
      this.states.set(id, state);
    }
    return state;
  }
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  private publish(sync = true) {
    if (!this.listeners.size || this.dead) return;
    const notify = () => {
      for (const listener of this.listeners) listener();
    };
    if (sync) flushSync(notify);
    else notify();
  }
  private onScroll = () => this.refresh();
  private onFocusOut = () =>
    queueMicrotask(() => {
      if (!this.dead) this.refresh();
    });

  refresh(sync = true) {
    if (this.dead || !this.plan.rows.length) return;
    const y = Math.max(0, this.root.scrollTop - 24);
    const buffer = this.root.clientHeight * 1.5;
    const first = this.heights.find(Math.max(0, y - buffer));
    const last = this.heights.find(y + this.root.clientHeight + buffer);
    const indices = Array.from({ length: last - first + 1 }, (_, i) => first + i);
    const pinned = new Set(
      this.pool.slots
        .filter((slot) => slot.active && slot.element?.contains(document.activeElement))
        .map((slot) => slot.id),
    );
    if (this.pool.update(indices, (index) => this.plan.rows[index].pool, pinned))
      this.publish(sync);
  }

  attach(slot: Slot, element: HTMLElement | null) {
    if (slot.element) this.observer.unobserve(slot.element);
    slot.element = element ?? undefined;
    if (element) {
      this.observed.set(element, slot.id);
      this.observer.observe(element);
    }
  }
  commit(slot: Slot) {
    slot.committed = slot.generation;
    if (slot.active) this.queueMeasure(slot);
  }
  private queueMeasure(slot: Slot) {
    this.pending.set(slot.id, slot.generation);
    if (!this.raf) this.raf = requestAnimationFrame(() => this.measure());
  }

  private anchor() {
    const top = Math.max(0, this.root.scrollTop - 24);
    const bounds = this.root.getBoundingClientRect();
    const visible = document
      .elementFromPoint(
        bounds.left + bounds.width / 2,
        bounds.top + Math.min(160, bounds.height / 3),
      )
      ?.closest('[data-probe-block]');
    const index =
      this.pool.slots.find((slot) => slot.active && slot.element === visible)?.index ??
      this.heights.find(top);
    return {
      index,
      within: top - this.heights.offset(index),
      inset: Math.min(24, this.root.scrollTop),
    };
  }
  private restore(anchor: ReturnType<RecyclerModel['anchor']>) {
    this.canvas.style.height = `${this.heights.total}px`;
    const target = anchor.inset + this.heights.offset(anchor.index) + anchor.within;
    const delta = target - this.root.scrollTop;
    if (Math.abs(delta) > 0.5) {
      this.root.scrollTop = target;
      this.corrections++;
      this.maxCorrection = Math.max(this.maxCorrection, Math.abs(delta));
    }
  }
  private measure() {
    this.raf = 0;
    if (this.dead) return;
    const anchor = this.anchor();
    const changes: Array<[number, number]> = [];
    for (const slot of this.pool.slots) {
      const generation = this.pending.get(slot.id);
      if (
        generation === undefined ||
        !slot.active ||
        !slot.element ||
        generation !== slot.generation ||
        slot.committed !== generation
      )
        continue;
      const height = slot.element.getBoundingClientRect().height;
      this.measurements++;
      this.measured.add(slot.index);
      if (Math.abs(height - this.heights.values[slot.index]) > 0.5)
        changes.push([slot.index, height]);
    }
    this.pending.clear();
    if (changes.length) {
      for (const [index, height] of changes) this.heights.update(index, height);
      this.restore(anchor);
      this.refresh();
      this.publish();
    }
  }

  resize(width: number) {
    if (width <= 0 || Math.abs(width - this.width) < 0.5) return;
    const anchor = this.anchor();
    this.width = width;
    this.heights = this.buildHeights();
    this.measured.clear();
    this.restore(anchor);
    this.refresh();
    this.publish();
    for (const slot of this.pool.slots) if (slot.active) this.queueMeasure(slot);
  }
  replace(plan: RenderPlan) {
    const anchor = this.anchor();
    const old = this.plan;
    const heights = this.heights;
    this.plan = plan;
    this.heights = this.buildHeights();
    for (let i = 0; i < plan.rows.length; i++)
      if (old.rows[i]?.data === plan.rows[i].data) this.heights.update(i, heights.values[i]);
    this.restore(anchor);
    this.refresh();
    this.publish();
    for (const slot of this.pool.slots) if (slot.active) this.queueMeasure(slot);
  }
  scrollTo(index: number) {
    this.root.scrollTop =
      24 + this.heights.offset(Math.max(0, Math.min(index, this.plan.rows.length - 1)));
    this.refresh();
  }
  stats() {
    const pools = new Map<string, { type: string; active: number; idle: number }>();
    for (const slot of this.pool.slots) {
      const entry = pools.get(slot.pool) ?? { type: slot.pool, active: 0, idle: 0 };
      if (slot.active) entry.active++;
      else entry.idle++;
      pools.set(slot.pool, entry);
    }
    const elements = [...this.canvas.querySelectorAll('*')];
    const shadowNodes = elements.reduce(
      (sum, element) => sum + (element.shadowRoot?.querySelectorAll('*').length ?? 0),
      0,
    );
    return {
      blocks: this.plan.rows.length,
      slots: this.pool.slots.length,
      active: this.pool.slots.filter((slot) => slot.active).length,
      created: this.pool.created,
      reused: this.pool.reused,
      disposed: this.pool.disposed,
      measured: this.measured.size,
      measurements: this.measurements,
      corrections: this.corrections,
      maxCorrection: this.maxCorrection,
      renders: this.renders,
      domNodes: elements.length,
      shadowNodes,
      widgetMounts: this.widgetMounts,
      widgetBinds: this.widgetBinds,
      widgetUnmounts: this.widgetUnmounts,
      pools: [...pools.values()],
    };
  }
  dispose() {
    this.dead = true;
    this.observer.disconnect();
    cancelAnimationFrame(this.raf);
    this.root.removeEventListener('scroll', this.onScroll);
    this.root.removeEventListener('focusout', this.onFocusOut);
    this.listeners.clear();
  }
}
