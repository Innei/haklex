import { $generateHtmlFromNodes } from '@lexical/html';
import {
  $createNodeSelection,
  $createParagraphNode,
  $getRoot,
  $isElementNode,
  $parseSerializedNode,
  $setSelection,
  createEditor,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical';

type SerializedNode = ReturnType<LexicalNode['exportJSON']> & {
  children?: SerializedNode[];
};

function serializeNodeWithChildren(node: LexicalNode): SerializedNode {
  const serialized = node.exportJSON() as SerializedNode;

  if ($isElementNode(node)) {
    serialized.children = node.getChildren().map(serializeNodeWithChildren);
  }

  return serialized;
}

function selectTopLevelNode(node: LexicalNode, placement: 'start' | 'end'): void {
  if ($isElementNode(node)) {
    if (placement === 'end') {
      node.selectEnd();
    } else {
      node.selectStart();
    }
    return;
  }

  const selection = $createNodeSelection();
  selection.add(node.getKey());
  $setSelection(selection);
}

export function buildBlockClipboardData(
  editor: LexicalEditor,
  nodes: readonly LexicalNode[],
): Record<string, string> {
  const lexicalEditor = editor as LexicalEditor & {
    _config: { namespace: string };
    _nodes: Map<string, { klass: unknown }>;
  };
  const namespace = lexicalEditor._config.namespace;
  const serializedNodes = nodes.map(serializeNodeWithChildren);

  let html = '';
  try {
    const registeredNodeKlasses = [
      ...new Set([...lexicalEditor._nodes.values()].map((entry) => entry.klass)),
    ] as Array<new (...args: never[]) => LexicalNode>;
    const tempEditor = createEditor({
      namespace: `${namespace}-block-selection-html`,
      nodes: registeredNodeKlasses as any,
      onError: (error) => {
        throw error;
      },
    });

    tempEditor.update(
      () => {
        const root = $getRoot();
        for (const serializedNode of serializedNodes) {
          root.append($parseSerializedNode(serializedNode));
        }
        html = $generateHtmlFromNodes(tempEditor, null);
      },
      { discrete: true },
    );
  } catch {
    html = '';
  }

  return {
    'application/x-lexical-editor': JSON.stringify({
      namespace,
      nodes: serializedNodes,
    }),
    'text/html': html,
    'text/plain': nodes.map((node) => node.getTextContent()).join('\n\n'),
  };
}

export function removeTopLevelNodesAndRestoreSelection(nodes: readonly LexicalNode[]): void {
  if (nodes.length === 0) return;

  const firstNode = nodes[0];
  const lastNode = nodes.at(-1)!;
  const previousSibling = firstNode.getPreviousSibling();
  const nextSibling = lastNode.getNextSibling();

  for (const node of nodes) {
    node.remove();
  }

  const root = $getRoot();
  if (root.getChildrenSize() === 0) {
    const paragraph = $createParagraphNode();
    root.append(paragraph);
    paragraph.selectStart();
    return;
  }

  if (nextSibling) {
    selectTopLevelNode(nextSibling, 'start');
    return;
  }

  if (previousSibling) {
    selectTopLevelNode(previousSibling, 'end');
    return;
  }

  const fallbackNode = root.getFirstChild();
  if (fallbackNode) {
    selectTopLevelNode(fallbackNode, 'start');
  }
}
