import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  $parseSerializedNode,
  type ElementNode,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type TextNode,
} from 'lexical';
import { type LoroDoc, LoroText, type LoroTreeNode, type TreeID } from 'loro-crdt';

import { transformOffset } from './offset';

export const COLLAB_TAG = 'collab';
export const TREE_NAME = 'lexical';
const TEXT_KEY = '#text';

export interface LoroBinding {
  dispose: () => void;
  import: (bytes: Uint8Array) => void;
}

export interface LoroBindingOptions {
  commitMessage?: string;
}

type Props = Record<string, unknown>;

function sameValue(a: unknown, b: unknown): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

function nodeProps(node: LexicalNode): Props {
  const { children: _children, ...props } = node.exportJSON() as Props;
  if ($isTextNode(node)) delete props.text;
  return props;
}

function storedProps(treeNode: LoroTreeNode): Props {
  const { [TEXT_KEY]: _text, ...props } = treeNode.data.toJSON() as Props;
  return props;
}

export function createLoroBinding(
  editor: LexicalEditor,
  doc: LoroDoc,
  options: LoroBindingOptions = {},
): LoroBinding {
  const tree = doc.getTree(TREE_NAME);
  tree.enableFractionalIndex(0);
  const keyToId = new Map<NodeKey, TreeID>();
  const idToKey = new Map<TreeID, NodeKey>();

  const link = (key: NodeKey, id: TreeID) => {
    const previousId = keyToId.get(key);
    if (previousId !== undefined) idToKey.delete(previousId);
    const previousKey = idToKey.get(id);
    if (previousKey !== undefined) keyToId.delete(previousKey);
    keyToId.set(key, id);
    idToKey.set(id, key);
  };

  const alive = (id: TreeID | undefined): id is TreeID =>
    id !== undefined && tree.has(id) && !tree.isNodeDeleted(id);

  // Peers may register different classes for one type (headless vs edit nodes) whose
  // exportJSON disagree; writing only this peer's own prop changes stops them from
  // endlessly overwriting each other's fields.
  const synced = new Map<NodeKey, Props>();

  const writeNode = (node: LexicalNode, treeNode: LoroTreeNode) => {
    const data = treeNode.data;
    const props = nodeProps(node);
    const previous = synced.get(node.getKey()) ?? {};
    for (const key of new Set([...Object.keys(previous), ...Object.keys(props)])) {
      const value = props[key];
      if (sameValue(previous[key], value) && (value === undefined || data.get(key) !== undefined)) {
        continue;
      }
      if (value === undefined) {
        if (data.get(key) !== undefined) data.delete(key);
      } else if (!sameValue(data.get(key), value)) {
        data.set(key, value as never);
      }
    }
    synced.set(node.getKey(), props);
    if ($isTextNode(node)) {
      const text = data.getOrCreateContainer(TEXT_KEY, new LoroText());
      const next = node.getTextContent();
      if (text.toString() !== next) text.update(next);
    }
  };

  const writeChildren = (parent: ElementNode, parentId: TreeID, visited: Set<TreeID>) => {
    parent.getChildren().forEach((child, index) => {
      let id = keyToId.get(child.getKey());
      if (alive(id)) {
        const current = tree.getNodeByID(id)!;
        if (current.parent()?.id !== parentId || current.index() !== index) {
          tree.move(id, parentId, index);
        }
      } else {
        id = tree.createNode(parentId, index).id;
        link(child.getKey(), id);
      }
      visited.add(id);
      writeNode(child, tree.getNodeByID(id)!);
      if ($isElementNode(child)) writeChildren(child, id, visited);
    });
  };

  // ponytail: full-tree walk per update; switch to dirtyElements/dirtyLeaves if long drafts lag
  const pushToDoc = () => {
    editor.getEditorState().read(() => {
      let rootId = keyToId.get('root');
      if (!alive(rootId)) {
        rootId = tree.roots()[0]?.id ?? tree.createNode().id;
        link('root', rootId);
      }
      const visited = new Set<TreeID>([rootId]);
      writeNode($getRoot(), tree.getNodeByID(rootId)!);
      writeChildren($getRoot(), rootId, visited);
      for (const treeNode of tree.nodes()) {
        if (!visited.has(treeNode.id) && alive(treeNode.id)) {
          tree.delete(treeNode.id);
          const key = idToKey.get(treeNode.id);
          if (key !== undefined) keyToId.delete(key);
          idToKey.delete(treeNode.id);
        }
      }
    });
    doc.commit({ message: options.commitMessage });
  };

  const applyText = (node: TextNode, next: string) => {
    const previous = node.getTextContent();
    if (previous === next) return;
    const selection = $getSelection();
    const points = $isRangeSelection(selection)
      ? [selection.anchor, selection.focus].filter(
          (point) => point.type === 'text' && point.key === node.getKey(),
        )
      : [];
    const offsets = points.map((point) => transformOffset(previous, next, point.offset));
    node.setTextContent(next);
    points.forEach((point, index) => point.set(node.getKey(), offsets[index], 'text'));
  };

  const readNode = (treeNode: LoroTreeNode): LexicalNode => {
    const node = readNodeUnsynced(treeNode);
    synced.set(node.getKey(), nodeProps(node));
    return node;
  };

  const readNodeUnsynced = (treeNode: LoroTreeNode): LexicalNode => {
    const props = storedProps(treeNode);
    const text = $isTextLike(props) ? String(treeNode.data.get(TEXT_KEY) ?? '') : undefined;
    const key = idToKey.get(treeNode.id);
    const existing = key === undefined ? null : $getNodeByKey(key);
    if (existing && existing.getType() === props.type) {
      if ($isTextNode(existing)) {
        if (!sameValue(nodeProps(existing), props)) {
          existing.updateFromJSON({ ...props, text: existing.getTextContent() } as never);
        }
        applyText(existing, text ?? '');
        return existing;
      }
      if (sameValue(nodeProps(existing), props)) return existing;
      const replacement = $parseSerializedNode({
        ...props,
        children: [],
      } as unknown as SerializedLexicalNode);
      existing.replace(replacement, $isElementNode(existing) && $isElementNode(replacement));
      link(replacement.getKey(), treeNode.id);
      return replacement;
    }
    const created = $parseSerializedNode({
      ...props,
      ...(text === undefined ? {} : { text }),
      children: [],
    } as unknown as SerializedLexicalNode);
    link(created.getKey(), treeNode.id);
    return created;
  };

  const readChildren = (parent: ElementNode, treeNode: LoroTreeNode, visited: Set<NodeKey>) => {
    (treeNode.children() ?? []).forEach((child, index) => {
      const node = readNode(child);
      visited.add(node.getKey());
      const current = parent.getChildAtIndex(index);
      if (!current || !current.is(node)) {
        if (index === 0) {
          const first = parent.getFirstChild();
          if (first) first.insertBefore(node);
          else parent.append(node);
        } else {
          parent.getChildAtIndex(index - 1)!.insertAfter(node);
        }
      }
      if ($isElementNode(node)) readChildren(node, child, visited);
    });
  };

  const $collectDescendants = (node: ElementNode, out: LexicalNode[]) => {
    for (const child of node.getChildren()) {
      out.push(child);
      if ($isElementNode(child)) $collectDescendants(child, out);
    }
  };

  const pullFromDoc = () => {
    editor.update(
      () => {
        const rootTreeNode = tree.roots()[0];
        if (!rootTreeNode) return;
        link('root', rootTreeNode.id);
        const rootProps = storedProps(rootTreeNode);
        if (rootProps.type === 'root' && !sameValue(nodeProps($getRoot()), rootProps)) {
          $getRoot().updateFromJSON(rootProps as never);
        }
        synced.set('root', nodeProps($getRoot()));
        const visited = new Set<NodeKey>(['root']);
        readChildren($getRoot(), rootTreeNode, visited);
        const all: LexicalNode[] = [];
        $collectDescendants($getRoot(), all);
        for (const node of all) {
          if (!visited.has(node.getKey()) && node.isAttached()) node.remove();
        }
      },
      { discrete: true, tag: COLLAB_TAG },
    );
  };

  if (tree.roots().length > 0) pullFromDoc();
  else pushToDoc();

  const unregister = editor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
    if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
    pushToDoc();
  });

  return {
    dispose: unregister,
    import: (bytes) => {
      doc.import(bytes);
      pullFromDoc();
    },
  };
}

function $isTextLike(props: Props): boolean {
  return typeof props.format === 'number' && typeof props.detail === 'number' && 'mode' in props;
}
