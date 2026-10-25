export function withHostFallback<
  C extends Record<string, string>,
  V extends Partial<Record<keyof C, string>>,
>(contract: C, values: V): V {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value == null) continue;
    const name = contract[key].slice(4, -1).replace(/^--rc-/, '--rc-host-');
    result[key] = `var(${name}, ${value})`;
  }
  return result as V;
}
