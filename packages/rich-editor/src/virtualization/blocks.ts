import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  type LexicalEditor,
  type NodeKey,
} from 'lexical';

import type { DocumentBlocks } from '../context/EditorBlockContext';
import type { DocumentRow } from './document';

export interface DocumentBlocksHost {
  focusBlock: (index: number, end?: boolean) => void;
  indexOf: (id: string) => number | undefined;
  islandIds: (editor: LexicalEditor) => string[] | undefined;
  readonly master: LexicalEditor;
  readonly rows: DocumentRow[];
}

export class DocumentBlockSelection implements DocumentBlocks {
  private range?: { anchorId: string; focusId: string };
  private listeners = new Set<() => void>();

  constructor(private readonly host: DocumentBlocksHost) {}

  get editor() {
    return this.host.master;
  }

  keys() {
    const bounds = this.bounds();
    return bounds ? this.host.rows.slice(bounds[0], bounds[1] + 1).map((row) => row.key) : [];
  }

  islandKeys(editor: LexicalEditor) {
    const bounds = this.bounds();
    const ids = this.host.islandIds(editor);
    if (!bounds || !ids) return [];
    return editor.getEditorState().read(() =>
      $getRoot()
        .getChildren()
        .filter((_, i) => {
          const index = ids[i] === undefined ? undefined : this.host.indexOf(ids[i]);
          return index !== undefined && index >= bounds[0] && index <= bounds[1];
        })
        .map((node) => node.getKey()),
    );
  }

  select(editor: LexicalEditor, anchorKey: NodeKey, focusKey: NodeKey) {
    const ids = this.host.islandIds(editor);
    if (!ids) return;
    const [anchor, focus] = editor.getEditorState().read(() => {
      const keys = $getRoot()
        .getChildren()
        .map((node) => node.getKey());
      return [ids[keys.indexOf(anchorKey)], ids[keys.indexOf(focusKey)]];
    });
    if (anchor && focus) this.set({ anchorId: anchor, focusId: focus });
  }

  selectAll() {
    const { rows } = this.host;
    if (rows.length) this.set({ anchorId: rows[0].id, focusId: rows.at(-1)!.id });
  }

  extend(step: -1 | 1) {
    const focus = this.range && this.host.indexOf(this.range.focusId);
    const next = focus === undefined ? undefined : this.host.rows[focus + step];
    if (!this.range || !next) return false;
    this.set({ anchorId: this.range.anchorId, focusId: next.id });
    return true;
  }

  clear() {
    if (this.range) this.set(undefined);
  }

  prune() {
    if (
      this.range &&
      (this.host.indexOf(this.range.anchorId) === undefined ||
        this.host.indexOf(this.range.focusId) === undefined)
    )
      this.set(undefined);
  }

  focusSelection() {
    const target = this.host.master.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return null;
      const node = selection.anchor.getNode();
      const top = node.getTopLevelElement() ?? node;
      const last = ($isElementNode(top) ? top.getLastDescendant() : null) ?? top;
      return {
        key: top.getKey(),
        end: node.is(last) && selection.anchor.offset === node.getTextContentSize(),
      };
    });
    const index = target ? this.host.rows.findIndex((row) => row.key === target.key) : -1;
    if (index >= 0) this.host.focusBlock(index, target!.end);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private bounds() {
    if (!this.range) return null;
    const anchor = this.host.indexOf(this.range.anchorId);
    const focus = this.host.indexOf(this.range.focusId);
    if (anchor === undefined || focus === undefined) return null;
    return [Math.min(anchor, focus), Math.max(anchor, focus)] as const;
  }

  private set(range: DocumentBlockSelection['range']) {
    this.range = range;
    this.listeners.forEach((listener) => listener());
  }
}
