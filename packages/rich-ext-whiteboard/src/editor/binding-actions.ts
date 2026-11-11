import type { LinearEnd } from '../model/binding';
import {
  bindLinearEnd,
  getHoveredBindable,
  unbindDetached,
  unbindLinearEnd,
  updateBoundArrows,
} from '../model/binding';
import { getLinearAbsolutePoints } from '../model/bounds';
import { updateElbowArrow } from '../model/elbow';
import type { Point } from '../model/geometry';
import type { ExcalidrawElement, LinearElement } from '../scene/types';
import { relayoutBoundTexts } from './text-actions';

export function refreshBindings(
  elements: readonly ExcalidrawElement[],
  changedIds: ReadonlySet<string>,
): ExcalidrawElement[] {
  const detached = unbindDetached(elements, changedIds);
  const updated = updateBoundArrows(detached, changedIds);
  const arrows = new Set(updated.filter((el, i) => el !== detached[i]).map((el) => el.id));
  return arrows.size > 0 ? relayoutBoundTexts(updated, arrows) : updated;
}

function excludedFor(elements: readonly ExcalidrawElement[], linearId: string): Set<string> {
  const ids = new Set([linearId]);
  for (const el of elements) if (el.type === 'text' && el.containerId === linearId) ids.add(el.id);
  return ids;
}

export function findBindingTarget(
  elements: readonly ExcalidrawElement[],
  linearId: string,
  p: Point,
  zoom: number,
): ExcalidrawElement | null {
  return getHoveredBindable(elements, p, zoom, excludedFor(elements, linearId));
}

export function bindArrowEnds(
  elements: readonly ExcalidrawElement[],
  linearId: string,
  ends: readonly LinearEnd[],
  zoom: number,
): ExcalidrawElement[] {
  let current = [...elements];
  for (const end of ends) {
    const linear = current.find((el) => el.id === linearId) as LinearElement | undefined;
    if (!linear || linear.type !== 'arrow') return current;
    const abs = getLinearAbsolutePoints(linear);
    const p = end === 'start' ? abs[0] : abs.at(-1)!;
    const target = findBindingTarget(current, linearId, p, zoom);
    current = target
      ? bindLinearEnd(current, linearId, end, target.id)
      : unbindLinearEnd(current, linearId, end);
  }
  return relayoutBoundTexts(rerouteElbow(current, linearId), new Set([linearId]));
}

export function rerouteElbow(
  elements: readonly ExcalidrawElement[],
  linearId: string,
): ExcalidrawElement[] {
  return elements.map((el) =>
    el.id === linearId && (el as LinearElement).elbowed
      ? updateElbowArrow(el as LinearElement, elements)
      : el,
  );
}
