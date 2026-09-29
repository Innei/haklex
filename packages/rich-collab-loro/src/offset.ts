export function transformOffset(previous: string, next: string, offset: number): number {
  const limit = Math.min(previous.length, next.length);
  let prefix = 0;
  while (prefix < limit && previous[prefix] === next[prefix]) prefix++;
  let suffix = 0;
  while (
    suffix < limit - prefix &&
    previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]
  ) {
    suffix++;
  }
  if (offset <= prefix) return offset;
  if (offset >= previous.length - suffix) return offset + next.length - previous.length;
  return next.length - suffix;
}
