import type { SerializedEditorState } from 'lexical';

export interface FootnoteData {
  definitions: Record<string, string>;
  displayNumberMap: Record<string, number>;
}

export function preprocessFootnotes(state: SerializedEditorState): FootnoteData {
  const definitions: Record<string, string> = {};
  const seen = new Set<string>();
  const displayNumberMap: Record<string, number> = {};
  let counter = 1;

  function walk(node: any): void {
    if (node.type === 'footnote' && node.identifier) {
      const id = node.identifier;
      if (!seen.has(id)) {
        seen.add(id);
        displayNumberMap[id] = counter++;
      }
    }
    if (node.type === 'footnote-section' && node.definitions) {
      Object.assign(definitions, node.definitions);
    }
    if (node.children) {
      for (const child of node.children) walk(child);
    }
    if (node.root) walk(node.root);
    if (node.content && typeof node.content === 'object' && node.content.root) {
      walk(node.content);
    }
    if (node.cells && Array.isArray(node.cells)) {
      for (const cell of node.cells) {
        if (cell && cell.root) walk(cell);
      }
    }
  }

  walk(state);

  for (const id of seen) {
    if (!(id in definitions)) {
      definitions[id] = '';
    }
  }

  return { definitions, displayNumberMap };
}
