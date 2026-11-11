const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const ZERO = DIGITS[0];
const SMALLEST_INTEGER = `A${ZERO.repeat(26)}`;

function midpoint(a: string, b: string | null): string {
  if (b !== null && a >= b) throw new Error(`${a} >= ${b}`);
  if (a.slice(-1) === ZERO || (b && b.slice(-1) === ZERO)) throw new Error('trailing zero');
  if (b) {
    let n = 0;
    while ((a[n] || ZERO) === b[n]) n++;
    if (n > 0) return b.slice(0, n) + midpoint(a.slice(n), b.slice(n));
  }
  const digitA = a ? DIGITS.indexOf(a[0]) : 0;
  const digitB = b !== null ? DIGITS.indexOf(b[0]) : DIGITS.length;
  if (digitB - digitA > 1) return DIGITS[Math.round(0.5 * (digitA + digitB))];
  if (b && b.length > 1) return b.slice(0, 1);
  return DIGITS[digitA] + midpoint(a.slice(1), null);
}

function integerLength(head: string): number {
  if (head >= 'a' && head <= 'z') return head.charCodeAt(0) - 97 + 2;
  if (head >= 'A' && head <= 'Z') return 90 - head.charCodeAt(0) + 2;
  throw new Error(`invalid order key head: ${head}`);
}

function integerPart(key: string): string {
  const length = integerLength(key[0]);
  if (length > key.length) throw new Error(`invalid order key: ${key}`);
  return key.slice(0, length);
}

export function isValidIndex(key: unknown): key is string {
  if (typeof key !== 'string' || key.length === 0) return false;
  try {
    if (key === SMALLEST_INTEGER) return false;
    const int = integerPart(key);
    if (![...key].every((c) => DIGITS.includes(c))) return false;
    return key.slice(int.length).slice(-1) !== ZERO;
  } catch {
    return false;
  }
}

function assertValid(key: string) {
  if (!isValidIndex(key)) throw new Error(`invalid order key: ${key}`);
}

function incrementInteger(x: string): string | null {
  const [head, ...digits] = x.split('');
  let carry = true;
  for (let i = digits.length - 1; carry && i >= 0; i--) {
    const d = DIGITS.indexOf(digits[i]) + 1;
    if (d === DIGITS.length) {
      digits[i] = ZERO;
    } else {
      digits[i] = DIGITS[d];
      carry = false;
    }
  }
  if (!carry) return head + digits.join('');
  if (head === 'Z') return `a${ZERO}`;
  if (head === 'z') return null;
  const next = String.fromCharCode(head.charCodeAt(0) + 1);
  if (next > 'a') digits.push(ZERO);
  else digits.pop();
  return next + digits.join('');
}

function decrementInteger(x: string): string | null {
  const [head, ...digits] = x.split('');
  let borrow = true;
  for (let i = digits.length - 1; borrow && i >= 0; i--) {
    const d = DIGITS.indexOf(digits[i]) - 1;
    if (d === -1) {
      digits[i] = DIGITS.slice(-1);
    } else {
      digits[i] = DIGITS[d];
      borrow = false;
    }
  }
  if (!borrow) return head + digits.join('');
  if (head === 'a') return `Z${DIGITS.slice(-1)}`;
  if (head === 'A') return null;
  const next = String.fromCharCode(head.charCodeAt(0) - 1);
  if (next < 'Z') digits.push(DIGITS.slice(-1));
  else digits.pop();
  return next + digits.join('');
}

export function generateKeyBetween(a: string | null, b: string | null): string {
  if (a !== null) assertValid(a);
  if (b !== null) assertValid(b);
  if (a !== null && b !== null && a >= b) throw new Error(`${a} >= ${b}`);
  if (a === null) {
    if (b === null) return `a${ZERO}`;
    const ib = integerPart(b);
    const fb = b.slice(ib.length);
    if (ib === SMALLEST_INTEGER) return ib + midpoint('', fb);
    if (ib < b) return ib;
    const res = decrementInteger(ib);
    if (res === null) throw new Error('cannot decrement any more');
    return res;
  }
  if (b === null) {
    const ia = integerPart(a);
    const fa = a.slice(ia.length);
    const i = incrementInteger(ia);
    return i === null ? ia + midpoint(fa, null) : i;
  }
  const ia = integerPart(a);
  const fa = a.slice(ia.length);
  const ib = integerPart(b);
  const fb = b.slice(ib.length);
  if (ia === ib) return ia + midpoint(fa, fb);
  const i = incrementInteger(ia);
  if (i === null) throw new Error('cannot increment any more');
  if (i < b) return i;
  return ia + midpoint(fa, null);
}

export function generateNKeysBetween(a: string | null, b: string | null, n: number): string[] {
  if (n <= 0) return [];
  if (n === 1) return [generateKeyBetween(a, b)];
  if (b === null) {
    let c = generateKeyBetween(a, b);
    const result = [c];
    for (let i = 0; i < n - 1; i++) {
      c = generateKeyBetween(c, b);
      result.push(c);
    }
    return result;
  }
  if (a === null) {
    let c = generateKeyBetween(a, b);
    const result = [c];
    for (let i = 0; i < n - 1; i++) {
      c = generateKeyBetween(a, c);
      result.push(c);
    }
    return result.reverse();
  }
  const mid = Math.floor(n / 2);
  const c = generateKeyBetween(a, b);
  return [...generateNKeysBetween(a, c, mid), c, ...generateNKeysBetween(c, b, n - mid - 1)];
}

interface Indexed {
  index?: string | null;
}

export function syncIndices<T extends Indexed>(elements: readonly T[]): T[] {
  const valid: boolean[] = [];
  let last: string | null = null;
  for (const el of elements) {
    const ok = isValidIndex(el.index) && (last === null || el.index > last);
    valid.push(ok);
    if (ok) last = el.index as string;
  }
  if (valid.every(Boolean)) return [...elements];

  const out = [...elements];
  let i = 0;
  while (i < out.length) {
    if (valid[i]) {
      i++;
      continue;
    }
    const start = i;
    while (i < out.length && !valid[i]) i++;
    const lower = start > 0 ? (out[start - 1].index as string) : null;
    const upper = i < out.length ? (out[i].index as string) : null;
    const keys = generateNKeysBetween(lower, upper, i - start);
    for (let k = start; k < i; k++) out[k] = { ...out[k], index: keys[k - start] };
  }
  return out;
}
