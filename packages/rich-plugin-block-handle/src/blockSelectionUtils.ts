import { $generateNodesFromDOM } from '@lexical/html';
import {
  $createNodeSelection,
  $createParagraphNode,
  $createTabNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $parseSerializedNode,
  $setSelection,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical';

type SerializedNode = ReturnType<LexicalNode['exportJSON']> & {
  children?: SerializedNode[];
};
type SerializedClipboardNode = Parameters<typeof $parseSerializedNode>[0];

const PASTEABLE_CLIPBOARD_TYPES = [
  'application/x-lexical-editor',
  'text/html',
  'text/plain',
  'text/uri-list',
] as const;

function serializeNodeWithChildren(node: LexicalNode): SerializedNode {
  const serialized = node.exportJSON() as SerializedNode;

  if ($isElementNode(node)) {
    serialized.children = node.getChildren().map(serializeNodeWithChildren);
  }

  return serialized;
}

function getHtmlFromTopLevelNodes(editor: LexicalEditor, nodes: readonly LexicalNode[]): string {
  return nodes
    .map((node) => editor.getElementByKey(node.getKey())?.outerHTML ?? '')
    .filter(Boolean)
    .join('\n');
}

export function setBlockClipboardDataTransfer(
  dataTransfer: Pick<DataTransfer, 'setData'>,
  clipboardData: Record<string, string>,
): void {
  for (const [mimeType, value] of Object.entries(clipboardData)) {
    dataTransfer.setData(mimeType, value);
  }
}

export function createDataTransferFromBlockClipboardData(
  clipboardData: Record<string, string>,
): DataTransfer {
  return {
    files: { length: 0 } as FileList,
    get types() {
      return Object.keys(clipboardData);
    },
    getData(type: string) {
      return clipboardData[type] ?? '';
    },
    setData(type: string, value: string) {
      clipboardData[type] = value;
    },
  } as unknown as DataTransfer;
}

export async function readNativeClipboardDataTransfer(): Promise<DataTransfer | null> {
  const clipboard = globalThis.navigator?.clipboard;
  if (!clipboard) return null;

  const clipboardData: Record<string, string> = {};

  if (typeof clipboard.read === 'function') {
    try {
      const items = await clipboard.read();
      for (const item of items) {
        for (const type of PASTEABLE_CLIPBOARD_TYPES) {
          if (!item.types.includes(type)) continue;
          const blob = await item.getType(type);
          clipboardData[type] = await blob.text();
        }
      }
    } catch {
      // Fall back to readText(), which has broader browser support.
    }
  }

  if (!clipboardData['text/plain'] && typeof clipboard.readText === 'function') {
    try {
      const text = await clipboard.readText();
      if (text) {
        clipboardData['text/plain'] = text;
      }
    } catch {
      // The caller will report that no readable clipboard data was available.
    }
  }

  const dataTransfer = createDataTransferFromBlockClipboardData(clipboardData);
  return hasInsertableClipboardData(dataTransfer) ? dataTransfer : null;
}

export function writeBlockClipboardDataToNativeClipboard(
  editor: LexicalEditor,
  clipboardData: Record<string, string>,
): boolean {
  const rootElement = editor.getRootElement();
  const ownerDocument = rootElement?.ownerDocument ?? globalThis.document;
  if (!ownerDocument?.execCommand) return false;

  let wrote = false;
  const onCopy = (event: ClipboardEvent) => {
    if (!event.clipboardData) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    setBlockClipboardDataTransfer(event.clipboardData, clipboardData);
    wrote = true;
  };

  ownerDocument.addEventListener('copy', onCopy, true);
  try {
    return ownerDocument.execCommand('copy') && wrote;
  } finally {
    ownerDocument.removeEventListener('copy', onCopy, true);
  }
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
  };
  const namespace = lexicalEditor._config.namespace;
  const serializedNodes = nodes.map(serializeNodeWithChildren);
  const html = getHtmlFromTopLevelNodes(editor, nodes);

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

export function removeTopLevelNodesAndCreatePasteTarget(nodes: readonly LexicalNode[]): void {
  if (nodes.length === 0) return;

  const pasteTarget = $createParagraphNode();
  nodes[0].insertBefore(pasteTarget);

  for (const node of nodes) {
    node.remove();
  }

  pasteTarget.selectStart();
}

export function getDataTransferFromPasteEvent(event: unknown): DataTransfer | null {
  if (!event || typeof event !== 'object') return null;

  const pasteEvent = event as {
    clipboardData?: DataTransfer | null;
    dataTransfer?: DataTransfer | null;
  };

  return pasteEvent.clipboardData ?? pasteEvent.dataTransfer ?? null;
}

export function hasPasteableClipboardData(clipboardData: DataTransfer): boolean {
  if (clipboardData.files.length > 0) return true;

  return hasInsertableClipboardData(clipboardData);
}

export function hasInsertableClipboardData(clipboardData: DataTransfer): boolean {
  return PASTEABLE_CLIPBOARD_TYPES.some((type) => clipboardData.getData(type).length > 0);
}

export function isDataTransferOnlyPasteEvent(event: unknown): boolean {
  if (!event || typeof event !== 'object') return false;

  const pasteEvent = event as {
    clipboardData?: DataTransfer | null;
    dataTransfer?: DataTransfer | null;
  };

  return !pasteEvent.clipboardData && Boolean(pasteEvent.dataTransfer);
}

function insertPlainText(text: string): boolean {
  const selection = $getSelection();
  if (!selection) return false;

  if (!$isRangeSelection(selection)) {
    selection.insertRawText(text);
    return true;
  }

  const parts = text.split(/(\r?\n|\t)/);
  if (parts.at(-1) === '') parts.pop();

  for (const part of parts) {
    const currentSelection = $getSelection();
    if (!$isRangeSelection(currentSelection)) continue;

    if (part === '\n' || part === '\r\n') {
      currentSelection.insertParagraph();
    } else if (part === '\t') {
      currentSelection.insertNodes([$createTabNode()]);
    } else {
      currentSelection.insertText(part);
    }
  }

  return true;
}

export function insertDataTransferForBlockSelectionPaste(
  editor: LexicalEditor,
  dataTransfer: DataTransfer,
): boolean {
  const lexicalString = dataTransfer.getData('application/x-lexical-editor');

  if (lexicalString) {
    try {
      const payload = JSON.parse(lexicalString) as {
        namespace?: string;
        nodes?: SerializedClipboardNode[];
      };
      const lexicalEditor = editor as LexicalEditor & {
        _config: { namespace: string };
      };

      if (payload.namespace === lexicalEditor._config.namespace && Array.isArray(payload.nodes)) {
        const selection = $getSelection();
        if (!selection) return false;

        selection.insertNodes(payload.nodes.map($parseSerializedNode));
        return true;
      }
    } catch {
      // Fall back to lower-fidelity clipboard formats.
    }
  }

  const htmlString = dataTransfer.getData('text/html');
  const plainString = dataTransfer.getData('text/plain');

  if (htmlString && plainString !== htmlString) {
    try {
      const selection = $getSelection();
      if (!selection) return false;

      const dom = new DOMParser().parseFromString(htmlString, 'text/html');
      selection.insertNodes($generateNodesFromDOM(editor, dom));
      return true;
    } catch {
      // Fall back to plain text clipboard data.
    }
  }

  const text = plainString || dataTransfer.getData('text/uri-list');
  return text ? insertPlainText(text) : false;
}

export function replaceTopLevelNodesWithDataTransfer(
  editor: LexicalEditor,
  nodes: readonly LexicalNode[],
  dataTransfer: DataTransfer,
): boolean {
  if (nodes.length === 0 || !hasInsertableClipboardData(dataTransfer)) return false;

  removeTopLevelNodesAndCreatePasteTarget(nodes);
  return insertDataTransferForBlockSelectionPaste(editor, dataTransfer);
}
