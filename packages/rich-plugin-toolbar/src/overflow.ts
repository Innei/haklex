export interface MeasuredEntry {
  separator?: boolean;
  width: number;
}

interface FitOptions {
  available: number | null;
  gap: number;
  reserve: number;
}

function runWidth(entries: MeasuredEntry[], count: number, gap: number) {
  let total = 0;
  for (let i = 0; i < count; i++) total += entries[i].width + (i > 0 ? gap : 0);
  return total;
}

export function fitCount(entries: MeasuredEntry[], { available, gap, reserve }: FitOptions) {
  if (available === null || runWidth(entries, entries.length, gap) <= available) {
    return entries.length;
  }
  let count = 0;
  while (count < entries.length && runWidth(entries, count + 1, gap) + gap + reserve <= available) {
    count++;
  }
  while (count > 0 && entries[count - 1].separator) count--;
  return count;
}
