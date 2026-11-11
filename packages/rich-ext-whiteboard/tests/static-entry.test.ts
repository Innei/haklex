import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');
const IMPORT =
  /(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

function resolveLocal(from: string, spec: string): string | null {
  const base = path.resolve(path.dirname(from), spec);
  for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function walk(entry: string) {
  const files = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (files.has(file)) continue;
    files.add(file);
    for (const match of readFileSync(file, 'utf8').matchAll(IMPORT)) {
      const spec = match[1] ?? match[2];
      if (!spec.startsWith('.')) continue;
      const next = resolveLocal(file, spec);
      if (next) queue.push(next);
    }
  }
  return { files: [...files].map((f) => path.relative(SRC, f)) };
}

describe('static entry', () => {
  const { files } = walk(path.join(SRC, 'static.ts'));

  it('never reaches the editor', () => {
    expect(files.filter((f) => f.startsWith('editor/'))).toEqual([]);
    expect(files).not.toContain('WhiteboardEditorDialog.tsx');
    expect(files).not.toContain('WhiteboardEditRenderer.tsx');
  });
});
