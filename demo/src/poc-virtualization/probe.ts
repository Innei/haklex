import { flushSync } from 'react-dom';

import type { StateCheck } from './complex';

export type Mode = 'baseline' | 'css' | 'measured' | 'stale';
export type Scenario = 'text' | 'mixed' | 'late' | 'resize' | 'revision' | 'complex';

interface Entry {
  element: HTMLElement;
  height: number;
  keepAlive: boolean;
  mounted: boolean;
  near: boolean;
  setMounted: (mounted: boolean) => void;
}

interface Anchor {
  id: string;
  root: HTMLElement;
  scrollTop: number;
  textOffset?: number;
  y: number;
}

export const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export function anchorAt(root: HTMLElement): Anchor | undefined {
  const bounds = root.getBoundingClientRect();
  const x = bounds.left + bounds.width / 2;
  const y = bounds.top + Math.min(160, bounds.height / 3);
  const element = document.elementFromPoint(x, y)?.closest('[data-probe-block]');
  if (!element || !root.contains(element)) return;
  const range = (
    document as Document & { caretRangeFromPoint?: (x: number, y: number) => Range | null }
  ).caretRangeFromPoint?.(x, y);
  if (range && element.contains(range.startContainer) && range.startContainer.nodeType === 3) {
    const offset = Math.min(
      range.startOffset,
      Math.max(0, (range.startContainer.textContent?.length ?? 0) - 1),
    );
    range.setStart(range.startContainer, offset);
    range.setEnd(
      range.startContainer,
      Math.min(range.startOffset + 1, range.startContainer.textContent?.length ?? 0),
    );
    const prefix = range.cloneRange();
    prefix.selectNodeContents(element);
    prefix.setEnd(range.startContainer, range.startOffset);
    return {
      id: (element as HTMLElement).dataset.probeBlock!,
      root,
      textOffset: prefix.toString().length,
      y: range.getBoundingClientRect().top,
      scrollTop: root.scrollTop,
    };
  }
  return {
    id: (element as HTMLElement).dataset.probeBlock!,
    root,
    y: element.getBoundingClientRect().top,
    scrollTop: root.scrollTop,
  };
}

export function anchorY(anchor: Anchor) {
  const element = anchor.root.querySelector(`[data-probe-block="${CSS.escape(anchor.id)}"]`);
  if (!element) return;
  if (anchor.textOffset === undefined) return element.getBoundingClientRect().top;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let remaining = anchor.textOffset;
  let node = walker.nextNode();
  while (node) {
    const length = node.textContent?.length ?? 0;
    if (remaining < length) {
      const range = document.createRange();
      range.setStart(node, remaining);
      range.setEnd(node, remaining + 1);
      return range.getBoundingClientRect().top;
    }
    remaining -= length;
    node = walker.nextNode();
  }
}

export class RecyclingProbe {
  readonly entries = new Map<string, Entry>();
  readonly corrections: number[] = [];
  readonly restoreErrors: number[] = [];
  private readonly intersection: IntersectionObserver;
  private readonly resize: ResizeObserver;
  private readonly bodyIds = new WeakMap<Element, string>();
  private saved?: Anchor;
  private raf = 0;
  private disposed = false;

  constructor(
    readonly root: HTMLElement,
    readonly mode: Mode,
  ) {
    this.intersection = new IntersectionObserver(
      (events) => {
        for (const event of events) {
          const entry = this.entries.get((event.target as HTMLElement).dataset.probeBlock!);
          if (entry) entry.near = event.isIntersecting;
        }
        this.reconcile();
      },
      { root, rootMargin: `${root.clientHeight * 2}px 0px`, threshold: 0 },
    );
    this.resize = new ResizeObserver((events) => {
      for (const event of events) {
        const entry = this.entries.get(this.bodyIds.get(event.target) ?? '');
        if (entry?.mounted)
          entry.height =
            event.borderBoxSize[0]?.blockSize ?? event.target.getBoundingClientRect().height;
      }
      this.correctAnchor();
      this.reconcile();
    });
    const remember = () => {
      if (this.disposed) return;
      this.correctAnchor();
      this.saved = anchorAt(root);
      this.raf = requestAnimationFrame(remember);
    };
    this.raf = requestAnimationFrame(remember);
  }

  register(id: string, element: HTMLElement, setMounted: Entry['setMounted'], keepAlive = false) {
    this.entries.set(id, { element, height: 0, keepAlive, mounted: true, near: true, setMounted });
    if (this.mode === 'measured' || this.mode === 'stale') this.intersection.observe(element);
    return () => {
      this.intersection.unobserve(element);
      this.entries.delete(id);
    };
  }

  observeBody(id: string, body: HTMLElement) {
    this.bodyIds.set(body, id);
    if (this.mode === 'measured' || this.mode === 'stale') this.resize.observe(body);
    return () => this.resize.unobserve(body);
  }

  private correctAnchor() {
    if (this.mode !== 'measured' || !this.saved) return;
    const y = anchorY(this.saved);
    if (y === undefined) return;
    const expected = this.saved.y - (this.root.scrollTop - this.saved.scrollTop);
    const delta = y - expected;
    if (Math.abs(delta) > 0.5) {
      this.root.scrollTop += delta;
      this.corrections.push(delta);
    }
    this.saved = anchorAt(this.root);
  }

  private reconcile() {
    if (this.disposed || (this.mode !== 'measured' && this.mode !== 'stale')) return;
    const changes: Array<[Entry, boolean]> = [];
    // shortcut: scans records on observer delivery, use a dirty candidate set for production.
    for (const entry of this.entries.values()) {
      const pending = entry.element.querySelector('[data-image-ready="false"]');
      const focused = entry.element.contains(document.activeElement);
      const mounted = entry.near || entry.height <= 0 || Boolean(pending) || focused;
      if (mounted !== entry.mounted) changes.push([entry, mounted]);
    }
    if (!changes.length) return;
    this.correctAnchor();
    this.saved = anchorAt(this.root);
    flushSync(() => {
      for (const [entry, mounted] of changes) {
        entry.mounted = mounted;
        entry.setMounted(mounted);
      }
    });
    for (const [entry, mounted] of changes) {
      if (mounted)
        this.restoreErrors.push(entry.element.getBoundingClientRect().height - entry.height);
    }
    this.correctAnchor();
  }

  changeLayout(mutate: () => void) {
    this.saved = anchorAt(this.root);
    flushSync(() => {
      if (this.mode === 'measured') {
        for (const entry of this.entries.values()) {
          entry.mounted = true;
          entry.setMounted(true);
        }
      }
      mutate();
    });
    if (this.mode === 'measured') {
      for (const entry of this.entries.values())
        entry.height = entry.element.getBoundingClientRect().height;
    }
    this.correctAnchor();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.intersection.disconnect();
    this.resize.disconnect();
  }
}

export interface Result {
  blocks: number;
  corrections: number;
  driftFrames: number;
  framesOver50ms: number;
  heightSwing: number;
  maxCorrection: number;
  maxDrift: number;
  maxFrameMs: number;
  maxLandingDrift: number;
  maxRestoreError: number;
  minMounted: number;
  missedAnchors: number;
  mode: Mode;
  mounted: number;
  p95Drift: number;
  placeholderSamples: number;
  retainedBodies: number;
  samples: number;
  scenario: Scenario;
  stateCheck?: StateCheck;
  trace: Array<{
    step: number;
    phase: string;
    drift: number | null;
    landingDrift: number | null;
    scrollTop: number;
    height: number;
  }>;
  viewportHeight: number;
  viewportWidth: number;
  width: number;
}

export async function exercise(
  probe: RecyclingProbe,
  scenario: Scenario,
  mutate: () => void,
): Promise<Result> {
  const root = probe.root;
  const trace: Result['trace'] = [];
  const drifts: number[] = [];
  const landingDrifts: number[] = [];
  let missedAnchors = 0;
  let placeholderSamples = 0;
  let maxFrameMs = 0;
  let framesOver50ms = 0;
  let minMounted = probe.entries.size;
  const sample = async (delta: number, step: number, phase: string, change = false) => {
    let anchor = anchorAt(root);
    const before = root.scrollTop;
    const intended = Math.max(
      -before,
      Math.min(delta, root.scrollHeight - root.clientHeight - before),
    );
    const started = performance.now();
    root.scrollTop = before + intended;
    if (phase === 'jump') anchor = anchorAt(root);
    const landing = anchorAt(root);
    if (change) probe.changeLayout(mutate);
    await frame();
    const elapsed = performance.now() - started;
    maxFrameMs = Math.max(maxFrameMs, elapsed);
    if (elapsed > 50) framesOver50ms++;
    const y = anchor && anchorY(anchor);
    const drift =
      anchor && y !== undefined ? y - anchor.y + (phase === 'jump' ? 0 : intended) : null;
    const landingY = landing && anchorY(landing);
    const landingDrift = landing && landingY !== undefined ? landingY - landing.y : null;
    if (landingDrift !== null) landingDrifts.push(Math.abs(landingDrift));
    const visible = anchorAt(root);
    if (
      visible &&
      root
        .querySelector(`[data-probe-block="${CSS.escape(visible.id)}"]`)
        ?.getAttribute('data-mounted') === 'false'
    )
      placeholderSamples++;
    if (!anchor || y === undefined) missedAnchors++;
    else drifts.push(Math.abs(drift!));
    trace.push({
      step,
      phase,
      drift,
      landingDrift,
      scrollTop: root.scrollTop,
      height: root.scrollHeight,
    });
    minMounted = Math.min(
      minMounted,
      [...probe.entries.values()].filter((entry) => entry.mounted).length,
    );
  };
  for (let i = 0; i < 42; i++) await sample(900, i, 'fast-down');
  for (let i = 0; i < 18; i++)
    await sample(0, 42 + i, 'hold', i === 0 && (scenario === 'resize' || scenario === 'revision'));
  for (let i = 0; i < 42; i++) await sample(-900, 60 + i, 'fast-up');
  for (let i = 0; i < 8; i++)
    await sample(root.scrollHeight * (i % 2 ? -0.75 : 0.75), 102 + i, 'jump');
  for (let i = 0; i < 24; i++) await sample(0, 110 + i, 'settle');
  const sorted = [...drifts].sort((a, b) => a - b);
  const absMax = (values: number[]) => Math.max(0, ...values.map(Math.abs));
  return {
    mode: probe.mode,
    scenario,
    blocks: probe.entries.size,
    width: root.querySelector<HTMLElement>('.poc-column')!.clientWidth,
    viewportHeight: root.clientHeight,
    viewportWidth: root.clientWidth,
    maxDrift: absMax(drifts),
    p95Drift: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
    driftFrames: drifts.filter((value) => value > 1).length,
    samples: drifts.length,
    missedAnchors,
    maxRestoreError: absMax(probe.restoreErrors),
    corrections: probe.corrections.length,
    maxCorrection: absMax(probe.corrections),
    heightSwing:
      Math.max(...trace.map((row) => row.height)) - Math.min(...trace.map((row) => row.height)),
    mounted: [...probe.entries.values()].filter((entry) => entry.mounted).length,
    retainedBodies: [...probe.entries.values()].filter((entry) => !entry.mounted && entry.keepAlive)
      .length,
    minMounted,
    maxFrameMs,
    maxLandingDrift: absMax(landingDrifts),
    placeholderSamples,
    framesOver50ms,
    trace,
  };
}
