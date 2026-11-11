import type { ExcalidrawElement, LinearElement, PointBinding } from '../scene/types';
import { randomId, randomInteger } from './random';

function remapBinding(
  binding: PointBinding | null | undefined,
  idMap: Map<string, string>,
): PointBinding | null {
  if (!binding) return null;
  const mapped = idMap.get(binding.elementId);
  return mapped ? { ...binding, elementId: mapped } : null;
}

export function cloneElements(
  source: readonly ExcalidrawElement[],
  offset: [number, number],
): { clones: ExcalidrawElement[]; idMap: Map<string, string> } {
  const idMap = new Map(source.map((el) => [el.id, randomId()]));
  const groupMap = new Map<string, string>();
  const mapGroup = (g: string) => {
    if (!groupMap.has(g)) groupMap.set(g, randomId());
    return groupMap.get(g)!;
  };
  const clones = source.map((el) => {
    const clone: Record<string, unknown> = {
      ...el,
      id: idMap.get(el.id)!,
      x: el.x + offset[0],
      y: el.y + offset[1],
      seed: randomInteger(),
      version: 1,
      versionNonce: randomInteger(),
      updated: Date.now(),
      index: null,
      groupIds: (el.groupIds ?? []).map(mapGroup),
      boundElements:
        el.boundElements
          ?.filter((b) => idMap.has(b.id))
          .map((b) => ({ ...b, id: idMap.get(b.id)! })) ?? null,
    };
    if (el.type === 'text')
      clone.containerId = el.containerId ? (idMap.get(el.containerId) ?? null) : null;
    if (el.type === 'arrow' || el.type === 'line') {
      const linear = el as LinearElement;
      clone.startBinding = remapBinding(linear.startBinding, idMap);
      clone.endBinding = remapBinding(linear.endBinding, idMap);
    }
    clone.frameId = el.frameId ? (idMap.get(el.frameId) ?? null) : null;
    return clone as unknown as ExcalidrawElement;
  });
  return { clones, idMap };
}
