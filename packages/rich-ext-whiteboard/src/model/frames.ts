import type { ExcalidrawElement } from '../scene/types';
import { getElementBounds } from './bounds';
import { boundsContain, boundsIntersect } from './geometry';
import { bumpVersion } from './mutate';

export function isFrame(el: ExcalidrawElement): boolean {
  return el.type === 'frame' || el.type === 'magicframe';
}

const containerOf = (el: ExcalidrawElement): string | null =>
  el.type === 'text' ? (el.containerId ?? null) : null;

export function getFrameChildren(
  elements: readonly ExcalidrawElement[],
  frameId: string,
): ExcalidrawElement[] {
  return elements.filter((el) => !el.isDeleted && el.frameId === frameId);
}

const encloses = (frame: ExcalidrawElement, el: ExcalidrawElement) =>
  boundsContain(getElementBounds(frame), getElementBounds(el));

const overlaps = (frame: ExcalidrawElement, el: ExcalidrawElement) =>
  boundsIntersect(getElementBounds(frame), getElementBounds(el));

function withFrame(el: ExcalidrawElement, frameId: string | null): ExcalidrawElement {
  return (el.frameId ?? null) === frameId ? el : bumpVersion(el, { frameId });
}

function syncBoundTexts(elements: readonly ExcalidrawElement[]): ExcalidrawElement[] {
  const byId = new Map(elements.map((el) => [el.id, el]));
  return elements.map((el) => {
    const container = containerOf(el);
    const owner = container ? byId.get(container) : undefined;
    return owner ? withFrame(el, owner.frameId ?? null) : el;
  });
}

export function assignFrameMembership(
  elements: readonly ExcalidrawElement[],
  frameId: string,
): ExcalidrawElement[] {
  const frame = elements.find((el) => el.id === frameId);
  if (!frame || frame.isDeleted) return [...elements];
  const next = elements.map((el) => {
    if (el.id === frameId || el.isDeleted || isFrame(el) || containerOf(el)) return el;
    if (el.frameId && el.frameId !== frameId) return el;
    if (el.frameId === frameId) return withFrame(el, overlaps(frame, el) ? frameId : null);
    return withFrame(el, encloses(frame, el) ? frameId : null);
  });
  return syncBoundTexts(next);
}

export function updateFrameMembershipAfterMove(
  elements: readonly ExcalidrawElement[],
  movedIds: ReadonlySet<string>,
): ExcalidrawElement[] {
  const frames = elements.filter((el) => isFrame(el) && !el.isDeleted);
  const next = elements.map((el) => {
    if (!movedIds.has(el.id) || el.isDeleted || isFrame(el) || containerOf(el)) return el;
    if (el.frameId && movedIds.has(el.frameId)) return el;
    const current = el.frameId ? frames.find((frame) => frame.id === el.frameId) : undefined;
    if (current && overlaps(current, el)) return el;
    const host = frames.findLast((frame) => encloses(frame, el));
    return withFrame(el, host?.id ?? null);
  });
  return syncBoundTexts(next);
}

export function refreshFrames(
  elements: readonly ExcalidrawElement[],
  changedIds: ReadonlySet<string>,
): ExcalidrawElement[] {
  let current = updateFrameMembershipAfterMove(elements, changedIds);
  for (const el of elements)
    if (changedIds.has(el.id) && isFrame(el)) current = assignFrameMembership(current, el.id);
  return current;
}

export function withFrameChildren(
  elements: readonly ExcalidrawElement[],
  ids: ReadonlySet<string>,
): Set<string> {
  const out = new Set(ids);
  const frames = new Set(elements.filter((el) => ids.has(el.id) && isFrame(el)).map((el) => el.id));
  if (frames.size === 0) return out;
  for (const el of elements)
    if (!el.isDeleted && el.frameId && frames.has(el.frameId)) out.add(el.id);
  return out;
}
