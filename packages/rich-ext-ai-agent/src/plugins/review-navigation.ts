export const REVIEW_CURRENT_ATTR = 'data-review-current';

export type ReviewShortcut = 'previous' | 'next' | 'accept' | 'reject';

export function getReviewPosition(
  keys: readonly string[],
  current: string | null,
): { position: number; total: number } {
  const index = current === null ? -1 : keys.indexOf(current);
  return { position: index + 1, total: keys.length };
}

export function stepReviewHunk(
  keys: readonly string[],
  current: string | null,
  direction: 1 | -1,
): string | null {
  if (keys.length === 0) return null;
  const index = current === null ? -1 : keys.indexOf(current);
  if (index === -1) return direction === 1 ? keys[0] : keys.at(-1)!;
  return keys[(index + direction + keys.length) % keys.length];
}

export function reconcileCurrentHunk(
  previousKeys: readonly string[],
  nextKeys: readonly string[],
  current: string | null,
): string | null {
  if (nextKeys.length === 0) return null;
  if (current !== null && nextKeys.includes(current)) return current;
  const previousIndex = current === null ? -1 : previousKeys.indexOf(current);
  if (previousIndex === -1) return nextKeys[0];
  return nextKeys[Math.min(previousIndex, nextKeys.length - 1)];
}

export function matchReviewShortcut(event: KeyboardEvent, isMac: boolean): ReviewShortcut | null {
  if (event.isComposing || event.shiftKey) return null;

  const mod = isMac ? event.metaKey : event.ctrlKey;
  const otherMod = isMac ? event.ctrlKey : event.metaKey;

  if (event.altKey && !mod && !otherMod) {
    if (event.key === 'ArrowUp') return 'previous';
    if (event.key === 'ArrowDown') return 'next';
    return null;
  }

  if (mod && !event.altKey && !otherMod) {
    if (event.key === 'Enter') return 'accept';
    if (event.key === 'Backspace') return 'reject';
  }

  return null;
}

export function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLSelectElement) return true;
  return target.isContentEditable;
}
