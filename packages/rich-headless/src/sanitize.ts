/**
 * Tolerate unknown node types in serialized Lexical state.
 *
 * Lexical's parseEditorState throws when it encounters a node type that
 * isn't registered. That's the right behavior in the editor (the doc would
 * silently break), but it's the wrong behavior on a long-lived server that
 * may lag behind the editor's node-set: a new node type added in the editor
 * package shouldn't bring the server's text-extraction path down until a
 * matching server-side bump ships.
 *
 * `sanitizeSerializedState` walks a serialized state JSON and:
 *   - drops decorator/leaf nodes whose type is unknown
 *   - unwraps element nodes whose type is unknown (children promoted)
 *
 * The result is always parseable by an editor configured with the same
 * `nodes` list, at the cost of losing the unknown nodes' rendering. For the
 * common server use case (lexical → markdown for search/feed), that's the
 * right tradeoff.
 */

import type { Klass, LexicalNode } from 'lexical';

interface AnyNode {
  [key: string]: unknown;
  children?: unknown[];
  type?: string;
}

export interface SanitizeOptions {
  /**
   * Lexical node classes to consider known. Defaults to all node classes
   * registered in this package via `allHeadlessNodes`. Pass an explicit set
   * if you've assembled a smaller registry.
   */
  nodes?: Klass<LexicalNode>[];
  /** Called once per encountered unknown type for observability. */
  onUnknown?: (type: string) => void;
}

const ROOT_TYPE = 'root';

function collectKnownTypes(nodes: Klass<LexicalNode>[]): Set<string> {
  const out = new Set<string>([ROOT_TYPE]);
  for (const klass of nodes) {
    const fn = (klass as unknown as { getType?: () => string }).getType;
    if (typeof fn === 'function') {
      out.add(fn.call(klass));
    }
  }
  return out;
}

function sanitizeNode(
  node: AnyNode,
  known: Set<string>,
  reported: Set<string>,
  onUnknown: ((type: string) => void) | undefined,
): AnyNode[] {
  if (!node || typeof node !== 'object') return [];

  const sanitizedChildren: AnyNode[] = [];
  if (Array.isArray(node.children)) {
    for (const child of node.children as AnyNode[]) {
      sanitizedChildren.push(...sanitizeNode(child, known, reported, onUnknown));
    }
  }

  const type = typeof node.type === 'string' ? node.type : undefined;

  if (!type || !known.has(type)) {
    if (type && onUnknown && !reported.has(type)) {
      reported.add(type);
      onUnknown(type);
    }
    // element-shaped → unwrap; leaf/decorator → drop
    return sanitizedChildren;
  }

  if (Array.isArray(node.children)) {
    return [{ ...node, children: sanitizedChildren }];
  }

  return [node];
}

/**
 * Returns a sanitized copy of `state` where any node whose `type` isn't in
 * the configured node-set has been unwrapped (element) or dropped (leaf).
 * Mutates nothing; safe to call on user-supplied JSON.
 */
export function sanitizeSerializedState<T extends { root?: AnyNode }>(
  state: T,
  options: SanitizeOptions & { nodes: Klass<LexicalNode>[] },
): T {
  const known = collectKnownTypes(options.nodes);
  const reported = new Set<string>();
  const root = state.root;
  if (!root || !Array.isArray(root.children)) return state;

  const newChildren: AnyNode[] = [];
  for (const child of root.children as AnyNode[]) {
    newChildren.push(...sanitizeNode(child, known, reported, options.onUnknown));
  }
  return { ...state, root: { ...root, children: newChildren } };
}

/**
 * String-in / string-out convenience for callers that work with raw JSON
 * (e.g. `editor.parseEditorState(json)` paths).
 *
 * If the input isn't valid JSON, it's returned unchanged — the caller's
 * existing parser will surface the JSON error.
 */
export function sanitizeSerializedJSON(
  json: string,
  options: SanitizeOptions & { nodes: Klass<LexicalNode>[] },
): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return json;
  }
  if (!parsed || typeof parsed !== 'object') return json;
  const sanitized = sanitizeSerializedState(parsed as { root?: AnyNode }, options);
  return JSON.stringify(sanitized);
}
