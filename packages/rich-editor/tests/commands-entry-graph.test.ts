import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import * as commandRegistry from '../src/command-registry-entry';

const srcDir = path.resolve(__dirname, '../src');
const importPattern = /\b(?:from|import)\s*["']([^"']+)["']/g;

function resolveLocal(from: string, specifier: string): string | null {
  const base = path.resolve(path.dirname(from), specifier);
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
  ]) {
    if (existsSync(candidate) && /\.tsx?$/.test(candidate)) return candidate;
  }
  return null;
}

function collectGraph(entry: string) {
  const files = new Set<string>();
  const bareImports = new Map<string, string[]>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (files.has(file)) continue;
    files.add(file);
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1];
      if (specifier.startsWith('.')) {
        const target = resolveLocal(file, specifier);
        if (target) queue.push(target);
      } else {
        const importers = bareImports.get(specifier) ?? [];
        importers.push(file.slice(srcDir.length + 1));
        bareImports.set(specifier, importers);
      }
    }
  }
  return { files, bareImports };
}

describe('commands entry module graph', () => {
  const { files, bareImports } = collectGraph(path.resolve(srcDir, 'commands-entry.ts'));

  it('does not reach the icon-bearing command registry', () => {
    expect(files).not.toContain(path.resolve(srcDir, 'commands/registry.ts'));
  });

  it('adds no lucide-react importer of its own', () => {
    const lucideImporters = bareImports.get('lucide-react') ?? [];
    expect(lucideImporters.filter((file) => file.startsWith('commands/'))).toEqual([]);
  });

  it('exposes the registry from its own entry', () => {
    expect(commandRegistry.getCommandMeta('Code Block')?.title).toBe('Code block');
    expect(commandRegistry.TURN_INTO_COMMAND_IDS.length).toBeGreaterThan(0);
  });
});
