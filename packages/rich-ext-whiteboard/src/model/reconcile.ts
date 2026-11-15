import type { ExcalidrawElement } from '../scene/types';
import { isValidIndex } from './fractional-index';

export function orderByIndex<T extends { id: string; index?: string | null }>(
  elements: readonly T[],
): T[] {
  const groups: { followers: T[]; head: T | null }[] = [{ head: null, followers: [] }];
  for (const el of elements) {
    if (isValidIndex(el.index)) groups.push({ head: el, followers: [] });
    else groups.at(-1)!.followers.push(el);
  }
  const [leading, ...anchored] = groups;
  anchored.sort((a, b) => {
    const left = a.head!.index as string;
    const right = b.head!.index as string;
    if (left === right) return a.head!.id < b.head!.id ? -1 : 1;
    return left < right ? -1 : 1;
  });
  return [...leading.followers, ...anchored.flatMap((group) => [group.head!, ...group.followers])];
}

const remoteWins = (local: ExcalidrawElement, remote: ExcalidrawElement) => {
  const mine = local.version ?? 0;
  const theirs = remote.version ?? 0;
  if (theirs !== mine) return theirs > mine;
  return (remote.versionNonce ?? 0) < (local.versionNonce ?? 0);
};

export interface Reconciled {
  accepted: ExcalidrawElement[];
  deferred: ExcalidrawElement[];
  elements: ExcalidrawElement[];
}

export function reconcileElements(
  local: readonly ExcalidrawElement[],
  remote: readonly ExcalidrawElement[],
  protectedIds: ReadonlySet<string> = new Set(),
): Reconciled {
  const mine = new Map(local.map((el) => [el.id, el]));
  const taken = new Map<string, ExcalidrawElement>();
  const deferred: ExcalidrawElement[] = [];
  for (const el of remote) {
    const current = mine.get(el.id);
    if (current && protectedIds.has(el.id)) deferred.push(el);
    else if (!current || remoteWins(current, el)) taken.set(el.id, el);
  }
  const accepted = [...taken.values()];
  if (accepted.length === 0) return { elements: [...local], accepted, deferred };
  const merged = [
    ...local.map((el) => taken.get(el.id) ?? el),
    ...accepted.filter((el) => !mine.has(el.id)),
  ];
  return { elements: orderByIndex(merged), accepted, deferred };
}
