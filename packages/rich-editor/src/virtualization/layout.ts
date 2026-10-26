import type { SerializedBlock } from './document';

export interface BlockMetrics {
  bottom: number;
  gap?: number;
  height: number;
  top: number;
}

export function collapsedMargin(a: number, b: number) {
  return Math.max(0, a, b) + Math.min(0, a, b);
}

export function occupiedHeight(current: BlockMetrics, next?: Pick<BlockMetrics, 'top'>) {
  return current.height + (current.gap ?? collapsedMargin(current.bottom, next?.top ?? 0));
}

export class HeightIndex {
  private readonly tree: Float64Array;
  readonly values: number[];

  constructor(values: number[]) {
    this.values = [...values];
    this.tree = new Float64Array(values.length + 1);
    for (let i = 1; i <= values.length; i++) {
      this.tree[i] += values[i - 1];
      const parent = i + (i & -i);
      if (parent < this.tree.length) this.tree[parent] += this.tree[i];
    }
  }

  offset(index: number) {
    let sum = 0;
    for (let i = index; i > 0; i -= i & -i) sum += this.tree[i];
    return sum;
  }

  get total() {
    return this.offset(this.values.length);
  }

  update(index: number, height: number) {
    const delta = height - this.values[index];
    this.values[index] = height;
    for (let i = index + 1; i < this.tree.length; i += i & -i) this.tree[i] += delta;
  }

  find(offset: number) {
    let index = 0;
    let bit = 1;
    while (bit * 2 < this.tree.length) bit *= 2;
    for (; bit; bit >>= 1) {
      const next = index + bit;
      if (next < this.tree.length && this.tree[next] <= offset) {
        index = next;
        offset -= this.tree[next];
      }
    }
    return Math.min(index, Math.max(0, this.values.length - 1));
  }
}

export interface Slot {
  active: boolean;
  beforeRelease?: () => void;
  committed: number;
  element?: HTMLElement;
  generation: number;
  id: number;
  index: number;
  pool: string;
}

export class TypePool {
  slots: Slot[] = [];
  created = 0;
  reused = 0;
  disposed = 0;

  update(
    indices: number[],
    typeOf: (index: number) => string,
    pinned = new Set<number>(),
    preserved = new Set<number>(),
  ) {
    const wanted = new Set(indices);
    let changed = false;
    for (const slot of this.slots) {
      if (slot.active && !wanted.has(slot.index) && !pinned.has(slot.id)) {
        slot.beforeRelease?.();
        slot.active = false;
        changed = true;
      }
    }
    const bound = new Set(this.slots.filter((slot) => slot.active).map((slot) => slot.index));
    const idle = new Map<string, Slot[]>();
    const owned = new Map(
      this.slots
        .filter((slot) => !slot.active && preserved.has(slot.id))
        .map((slot) => [slot.index, slot]),
    );
    for (const slot of this.slots) {
      if (!slot.active && !preserved.has(slot.id)) {
        const bucket = idle.get(slot.pool) ?? [];
        bucket.push(slot);
        idle.set(slot.pool, bucket);
      }
    }
    for (const index of indices) {
      if (bound.has(index)) continue;
      const pool = typeOf(index);
      let slot = owned.get(index) ?? idle.get(pool)?.pop();
      if (!slot) {
        slot = { id: ++this.created, index: -1, pool, active: false, generation: 0, committed: -1 };
        this.slots.push(slot);
      }
      if (slot.index !== index) {
        if (slot.index >= 0) this.reused++;
        slot.index = index;
        slot.generation++;
      }
      slot.active = true;
      changed = true;
    }
    const parked = this.slots.filter((slot) => !slot.active && preserved.has(slot.id)).length;
    let excess = this.slots.length - Math.max(16, indices.length * 2 + pinned.size) - parked;
    if (excess > 0) {
      this.slots = this.slots.filter((slot) => {
        if (!slot.active && !preserved.has(slot.id) && excess-- > 0) {
          this.disposed++;
          return false;
        }
        return true;
      });
      changed = true;
    }
    return changed;
  }
}

export interface ViewState {
  details: Record<string, boolean>;
  dynamic?: unknown;
  imageReady?: boolean;
}

const weights = new WeakMap<SerializedBlock, number>();
function textUnits(node: SerializedBlock): number {
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
  node: SerializedBlock,
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
