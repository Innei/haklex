import type { ExcalidrawElement, LinearElement, TextElement } from '../scene/types';
import { bindLinearEnd } from './binding';
import { getCommonBounds } from './bounds';
import { newTextElement } from './create';
import { isValidIndex, syncIndices } from './fractional-index';
import { bumpVersion } from './mutate';
import { randomId } from './random';
import { normalizeElement } from './restore';
import { resolveRichTextHeights } from './richtext-layout';
import { parseSvgSize } from './svg';
import { layoutBoundText, refreshTextDimensions } from './text-layout';

export type SkeletonElement = Record<string, unknown> & {
  children?: string[];
  end?: { id?: string };
  id?: string;
  label?: Record<string, unknown> & { text?: string };
  start?: { id?: string };
  type: string;
};

export interface ConvertedSkeletons {
  created: ExcalidrawElement[];
  touched: ExcalidrawElement[];
}

const FRAME_PADDING = 10;
const SVG_FALLBACK_SIZE = 100;
const LINEAR = new Set(['arrow', 'line']);

const positive = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

function shape(skeleton: SkeletonElement): ExcalidrawElement {
  const { children: _children, end: _end, label: _label, start: _start, ...rest } = skeleton;
  const raw = { ...rest, id: skeleton.id ?? randomId() } as unknown as ExcalidrawElement;
  const el = normalizeElement(raw);
  if (LINEAR.has(el.type)) {
    const points = (el as LinearElement).points;
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    return {
      ...el,
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  }
  if (el.type === 'svg' && !(positive(rest.width) && positive(rest.height))) {
    const size = parseSvgSize((el as { svg?: string }).svg ?? '');
    return {
      ...el,
      width: size?.width ?? SVG_FALLBACK_SIZE,
      height: size?.height ?? SVG_FALLBACK_SIZE,
    };
  }
  if (el.type === 'text') return refreshTextDimensions(el as TextElement);
  return el;
}

function labelFor(container: ExcalidrawElement, label: SkeletonElement['label']): TextElement {
  const { text = '', ...style } = label ?? {};
  return newTextElement({
    strokeColor: container.strokeColor,
    textAlign: 'center',
    verticalAlign: 'middle',
    ...(style as Partial<TextElement>),
    id: typeof style.id === 'string' ? style.id : randomId(),
    text,
    containerId: container.id,
    frameId: container.frameId ?? null,
  });
}

function fitFrame(frame: ExcalidrawElement, members: readonly ExcalidrawElement[]) {
  if (members.length === 0) return frame;
  const [minX, minY, maxX, maxY] = getCommonBounds(members);
  return {
    ...frame,
    x: minX - FRAME_PADDING,
    y: minY - FRAME_PADDING,
    width: maxX - minX + FRAME_PADDING * 2,
    height: maxY - minY + FRAME_PADDING * 2,
  };
}

function placed(list: ExcalidrawElement[], el: ExcalidrawElement): ExcalidrawElement[] {
  if (list.some((existing) => existing.id === el.id))
    return list.map((existing) => (existing.id === el.id ? el : existing));
  const index = el.index;
  if (!isValidIndex(index)) return [...list, el];
  const above = list.findIndex(
    (existing) => isValidIndex(existing.index) && existing.index > index,
  );
  return above < 0 ? [...list, el] : [...list.slice(0, above), el, ...list.slice(above)];
}

export function convertSkeletons(
  skeletons: readonly SkeletonElement[],
  scene: readonly ExcalidrawElement[],
): ConvertedSkeletons {
  const createdIds = new Set<string>();
  const sources = new Map<string, SkeletonElement>();
  let working: ExcalidrawElement[] = [...scene];

  const replace = (next: ExcalidrawElement) => {
    working = working.map((el) => (el.id === next.id ? next : el));
  };
  const byId = (id: string) => working.find((el) => el.id === id);

  for (const skeleton of skeletons) {
    const shaped = shape(skeleton);
    const replaced = scene.find((existing) => existing.id === shaped.id);
    const layered = replaced ? { ...shaped, index: shaped.index ?? replaced.index } : shaped;
    const el =
      replaced && (layered.version ?? 0) <= (replaced.version ?? 0)
        ? bumpVersion({ ...layered, version: replaced.version })
        : layered;
    createdIds.add(el.id);
    sources.set(el.id, skeleton);
    working = placed(working, el);
  }

  for (const [id, skeleton] of sources) {
    if (!LINEAR.has(skeleton.type)) continue;
    for (const end of ['start', 'end'] as const) {
      const targetId = skeleton[end]?.id;
      const target = typeof targetId === 'string' ? byId(targetId) : undefined;
      if (!target || target.isDeleted || target.id === id) continue;
      working = bindLinearEnd(working, id, end, target.id);
    }
  }

  for (const [id, skeleton] of sources) {
    if (!skeleton.label || typeof skeleton.label.text !== 'string') continue;
    const container = byId(id)!;
    const laid = layoutBoundText(container, labelFor(container, skeleton.label));
    createdIds.add(laid.text.id);
    replace({
      ...laid.container,
      boundElements: [...(container.boundElements ?? []), { id: laid.text.id, type: 'text' }],
    });
    working = [...working, laid.text];
  }

  for (const [id, skeleton] of sources) {
    if (skeleton.type !== 'frame' || !Array.isArray(skeleton.children)) continue;
    const wanted = new Set(skeleton.children);
    const joins = (el: ExcalidrawElement) =>
      !el.isDeleted &&
      (wanted.has(el.id) || (el.type === 'text' && !!el.containerId && wanted.has(el.containerId)));
    working = working.map((el) => {
      if (!joins(el) || el.frameId === id) return el;
      return createdIds.has(el.id) ? { ...el, frameId: id } : bumpVersion(el, { frameId: id });
    });
    if (positive(skeleton.width) && positive(skeleton.height)) continue;
    replace(
      fitFrame(
        byId(id)!,
        working.filter((el) => el.frameId === id && !el.isDeleted),
      ),
    );
  }

  const indexed = syncIndices(working);
  working = resolveRichTextHeights(
    working.map((el, i) => (createdIds.has(el.id) ? indexed[i] : el)),
  );
  const before = new Map(scene.map((el) => [el.id, el]));
  return {
    created: working.filter((el) => createdIds.has(el.id)),
    touched: working.filter((el) => !createdIds.has(el.id) && before.get(el.id) !== el),
  };
}
