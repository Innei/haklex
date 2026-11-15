import type { ExcalidrawElement } from '../scene/types';
import { bumpVersion } from './mutate';
import { randomInteger } from './random';

export function supersede(
  current: readonly ExcalidrawElement[],
  target: readonly ExcalidrawElement[],
): ExcalidrawElement[] {
  const live = new Map(current.map((el) => [el.id, el]));
  const kept = new Set<string>();
  const next = target.map((el) => {
    kept.add(el.id);
    const now = live.get(el.id);
    if (!now || now === el) return el;
    return {
      ...el,
      version: Math.max(now.version ?? 0, el.version ?? 0) + 1,
      versionNonce: randomInteger(),
      updated: Date.now(),
    };
  });
  for (const el of current) {
    if (kept.has(el.id)) continue;
    next.push(el.isDeleted ? el : bumpVersion(el, { isDeleted: true }));
  }
  return next;
}
