import type { Klass, LexicalNode } from 'lexical';

import type { RichRendererModule } from './types';

/**
 * Merge preset and modules, deduplicating by:
 *   1. Same module reference → skip silently (idempotent)
 *   2. Same module.name → replace previous module entirely; warn in dev
 *   3. Else → append
 */
export function mergeModules<M extends RichRendererModule>(
  preset: M[] | undefined,
  modules: M[] | undefined,
): M[] {
  const all = [...(preset ?? []), ...(modules ?? [])];
  const refSeen = new Set<M>();
  const byName = new Map<string, number>();
  const result: M[] = [];

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
 * Dedup by class reference. When two Klasses share the same `getType()`,
 * a subclass relationship (edit Klass extends base Klass) auto-resolves:
 * the subclass replaces its parent. Unrelated collisions throw — `instanceof`
 * would break across module boundaries.
 */
export function dedupNodes(nodes: Klass<LexicalNode>[]): Klass<LexicalNode>[] {
  const seen = new Set<Klass<LexicalNode>>();
  const byType = new Map<string, number>();
  const result: Klass<LexicalNode>[] = [];

  for (const Node of nodes) {
    if (seen.has(Node)) continue;
    seen.add(Node);

    const type = typeof Node.getType === 'function' ? Node.getType() : undefined;
    if (type === undefined) {
      result.push(Node);
      continue;
    }

    const prevIdx = byType.get(type);
    if (prevIdx === undefined) {
      byType.set(type, result.length);
      result.push(Node);
      continue;
    }

    const prev = result[prevIdx];
    if (Node === prev) continue;

    if (Node.prototype instanceof prev) {
      result[prevIdx] = Node;
      continue;
    }
    if (prev.prototype instanceof Node) {
      continue;
    }

    throw new Error(
      `[rich-compose] node type collision on "${type}": two distinct Klass references registered. ` +
        `This breaks \`instanceof\` checks. Ensure peerDeps/lexical version are pinned and a single module exports each type.`,
    );
  }

  return result;
}
