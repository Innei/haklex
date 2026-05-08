import type { Klass, LexicalNode } from 'lexical';

import type { RichRendererModule } from './types';

/**
 * Merge preset and modules, deduplicating by:
 *   1. Same module reference → skip silently (idempotent)
 *   2. Same module.name → replace previous module entirely; warn in dev
 *   3. Else → append
 */
export function mergeModules(
  preset: RichRendererModule[] | undefined,
  modules: RichRendererModule[] | undefined,
): RichRendererModule[] {
  const all = [...(preset ?? []), ...(modules ?? [])];
  const refSeen = new Set<RichRendererModule>();
  const byName = new Map<string, number>();
  const result: RichRendererModule[] = [];

  for (const m of all) {
    if (refSeen.has(m)) continue;
    refSeen.add(m);

    const existingIdx = byName.get(m.name);
    if (existingIdx !== undefined) {
       
      console.warn(
        `[rich-compose] module name collision: "${m.name}" — replacing previous registration. ` +
          `Pass the same module reference to silence this warning.`,
      );
      result[existingIdx] = m;
      continue;
    }

    byName.set(m.name, result.length);
    result.push(m);
  }

  return result;
}

/**
 * Dedup by class reference. Throws if two distinct Klasses share the same
 * `getType()` — multiple Klass instances will break `instanceof` checks
 * across module boundaries.
 */
export function dedupNodes(nodes: Klass<LexicalNode>[]): Klass<LexicalNode>[] {
  const seen = new Set<Klass<LexicalNode>>();
  const byType = new Map<string, Klass<LexicalNode>>();
  const result: Klass<LexicalNode>[] = [];

  for (const Node of nodes) {
    if (seen.has(Node)) continue;
    seen.add(Node);

    const type = typeof Node.getType === 'function' ? Node.getType() : undefined;
    if (type !== undefined) {
      const prev = byType.get(type);
      if (prev !== undefined && prev !== Node) {
        throw new Error(
          `[rich-compose] node type collision on "${type}": two distinct Klass references registered. ` +
            `This breaks \`instanceof\` checks. Ensure peerDeps/lexical version are pinned and a single module exports each type.`,
        );
      }
      byType.set(type, Node);
    }

    result.push(Node);
  }

  return result;
}
