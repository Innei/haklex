import {
  $getRoot,
  $isElementNode,
  $isTextNode,
  $parseSerializedNode,
  type ElementNode,
  type LexicalEditor,
  type LexicalNode,
  type SerializedEditorState,
  type SerializedLexicalNode,
} from 'lexical';
import type { LoroDoc } from 'loro-crdt';

import { createLoroBinding } from './binding';

type Json = SerializedLexicalNode & {
  $?: { blockId?: string };
  children?: Json[];
  text?: string;
};

type Frontiers = ReturnType<LoroDoc['frontiers']>;

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .filter((key) => (value as Record<string, unknown>)[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function shallow({ children: _children, text: _text, ...rest }: Json): string {
  return stable(rest);
}

function $serialize(node: LexicalNode): Json {
  const json = node.exportJSON() as Json;
  if ($isElementNode(node)) json.children = node.getChildren().map($serialize);
  return json;
}

// ponytail: O(n·m) LCS per element; fine for article-sized blocks, switch to Myers if docs grow huge
function lcs(a: string[], b: string[]): Array<[number, number]> {
  const table = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] =
        a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const pairs: Array<[number, number]> = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) pairs.push([i++, j++]);
    else if (table[i + 1][j] >= table[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

function $update(node: LexicalNode, current: Json, target: Json): LexicalNode {
  if ($isTextNode(node)) {
    if (shallow(current) !== shallow(target)) {
      node.updateFromJSON({ ...target, text: node.getTextContent() } as never);
    }
    if (node.getTextContent() !== target.text) node.setTextContent(target.text ?? '');
    return node;
  }
  if ($isElementNode(node)) {
    let element: ElementNode = node;
    if (shallow(current) !== shallow(target)) {
      const replacement = $parseSerializedNode({ ...target, children: [] } as Json);
      if (!$isElementNode(replacement)) return node;
      node.replace(replacement, true);
      element = replacement;
    }
    $reconcileChildren(element, target.children ?? []);
    return element;
  }
  if (stable(current) === stable(target)) return node;
  const replacement = $parseSerializedNode(target);
  node.replace(replacement);
  return replacement;
}

function pairable(current: Json, target: Json): boolean {
  if (current.type !== target.type) return false;
  const a = current.$?.blockId;
  const b = target.$?.blockId;
  return a === undefined || b === undefined || a === b;
}

function $reconcileChildren(parent: ElementNode, targets: Json[]): void {
  const current = parent.getChildren();
  const currentJson = current.map($serialize);
  const pairs = lcs(currentJson.map(stable), targets.map(stable));
  const result: LexicalNode[] = [];
  let ci = 0;
  let tj = 0;
  for (const [i, j] of [...pairs, [current.length, targets.length] as [number, number]]) {
    const pending = Array.from({ length: i - ci }, (_, k) => ci + k);
    for (let t = tj; t < j; t++) {
      const target = targets[t];
      const blockId = target.$?.blockId;
      let slot =
        blockId === undefined
          ? -1
          : pending.findIndex(
              (c) => currentJson[c].$?.blockId === blockId && pairable(currentJson[c], target),
            );
      if (slot === -1) slot = pending.findIndex((c) => pairable(currentJson[c], target));
      if (slot === -1) {
        result.push($parseSerializedNode(target));
      } else {
        const [c] = pending.splice(slot, 1);
        result.push($update(current[c], currentJson[c], target));
      }
    }
    if (i < current.length) result.push(current[i]);
    ci = i + 1;
    tj = j + 1;
  }
  const kept = new Set(result.map((node) => node.getKey()));
  for (const node of parent.getChildren()) {
    if (!kept.has(node.getKey())) node.remove(true);
  }
  result.forEach((node, index) => {
    const at = parent.getChildAtIndex(index);
    if (at && at.is(node)) return;
    if (index === 0) {
      const first = parent.getFirstChild();
      if (first) first.insertBefore(node);
      else parent.append(node);
    } else {
      result[index - 1].insertAfter(node);
    }
  });
}

export function $reconcileRoot(target: SerializedEditorState['root']): void {
  const root = $getRoot();
  const targetJson = target as unknown as Json;
  if (shallow($serialize(root)) !== shallow(targetJson)) root.updateFromJSON(target);
  const normalized = (targetJson.children ?? []).map((child) =>
    $serialize($parseSerializedNode(child)),
  );
  $reconcileChildren(root, normalized);
}

export function editAtVersion(
  doc: LoroDoc,
  frontiers: Frontiers,
  createEditor: () => LexicalEditor,
  target: SerializedEditorState,
  commitMessage?: string,
): Uint8Array {
  const fork = doc.forkAt(frontiers);
  const editor = createEditor();
  const binding = createLoroBinding(editor, fork, { commitMessage });
  const from = fork.oplogVersion();
  editor.update(() => $reconcileRoot(target.root), { discrete: true });
  binding.dispose();
  return fork.export({ from, mode: 'update' });
}
