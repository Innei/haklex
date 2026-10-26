import {
  $exportNodeJSON,
  $getNodeByKey,
  $getRoot,
  $getSlot,
  $getSlotNames,
  $getState,
  $isElementNode,
  $parseSerializedNode,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
} from 'lexical';

import { blockIdState } from '../plugins/BlockIdPlugin';

export interface SerializedBlock extends SerializedLexicalNode {
  $?: Record<string, any>;
  [key: string]: any;
  children?: SerializedBlock[];
}
export interface DocumentRow {
  data: SerializedBlock;
  id: string;
  key: string;
  node: LexicalNode;
  pool: string;
}

export function $serializeBlock(node: LexicalNode): SerializedBlock {
  const data = $exportNodeJSON(node) as SerializedBlock;
  if ($isElementNode(node)) data.children = node.getChildren().map($serializeBlock);
  for (const name of $getSlotNames(node)) {
    data.$slots ??= {};
    data.$slots[name] = $serializeBlock($getSlot(node, name)!);
  }
  return data;
}

export class VirtualDocument {
  rows: DocumentRow[] = [];
  onChange?: (source?: string) => void;
  private unsubscribe: () => void;
  private lastEdit?: { source: string; ids: string; time: number; count: number };

  constructor(readonly editor: LexicalEditor) {
    this.read();
    this.unsubscribe = editor.registerUpdateListener(({ dirtyElements, dirtyLeaves, tags }) => {
      if (!dirtyElements.size && !dirtyLeaves.size) return;
      this.read(new Set([...dirtyElements.keys(), ...dirtyLeaves]));
      const source = [...tags].find((tag) => tag.startsWith('virtual-island:'));
      if (!source) this.lastEdit = undefined;
      this.onChange?.(source);
    });
  }

  private read(dirty?: Set<string>) {
    const previous = new Map(this.rows.map((row) => [row.key, row]));
    this.rows = this.editor.getEditorState().read(() =>
      $getRoot()
        .getChildren()
        .map((node) => {
          const key = node.getKey();
          const old = previous.get(key);
          if (old?.node === node && !dirty?.has(key)) return old;
          const data = $serializeBlock(node);
          return {
            data,
            key,
            node,
            id: $getState(node, blockIdState) || key,
            pool: `${data.type}:${data.url ?? data.tag ?? data.listType ?? ''}`,
          };
        }),
    );
  }

  replace(ids: string[], children: SerializedBlock[], source: string) {
    const first = this.rows.findIndex((row) => row.id === ids[0]);
    if (first < 0 || ids.some((id, i) => this.rows[first + i]?.id !== id))
      throw new Error('Virtual editor island is stale or noncontiguous');
    const keys = this.rows.slice(first, first + ids.length).map((row) => row.key);
    const now = Date.now();
    const merge =
      this.lastEdit?.source === source &&
      this.lastEdit.ids === ids.join(',') &&
      this.lastEdit.count === children.length &&
      children.length === ids.length &&
      now - this.lastEdit.time < 600;
    this.editor.update(
      () => {
        const original = keys.map((key) => $getNodeByKey(key)!);
        if (original.some((node) => !node)) throw new Error('Virtual editor block was removed');
        let tail: LexicalNode | undefined;
        for (const data of children) {
          const node = $parseSerializedNode(data);
          if (tail) tail.insertAfter(node);
          else original[0].insertBefore(node);
          tail = node;
        }
        for (const node of original) node.remove();
      },
      {
        discrete: true,
        tag: [merge ? 'history-merge' : 'history-push', `virtual-island:${source}`],
      },
    );
    this.lastEdit = { source, ids: ids.join(','), time: now, count: children.length };
  }

  dispose() {
    this.unsubscribe();
  }
}
