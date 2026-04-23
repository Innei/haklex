// @vitest-environment happy-dom

import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  createEditor,
} from 'lexical';
import { describe, expect, it } from 'vitest';

import {
  buildBlockClipboardData,
  getDataTransferFromPasteEvent,
  hasInsertableClipboardData,
  hasPasteableClipboardData,
  insertDataTransferForBlockSelectionPaste,
  isDataTransferOnlyPasteEvent,
  readNativeClipboardDataTransfer,
  removeTopLevelNodesAndCreatePasteTarget,
  removeTopLevelNodesAndRestoreSelection,
} from '../src/blockSelectionUtils';

function createMockDataTransfer(initialData: Record<string, string> = {}): DataTransfer {
  const data = new Map(Object.entries(initialData));
  return {
    files: [],
    get types() {
      return [...data.keys()];
    },
    getData(type: string) {
      return data.get(type) ?? '';
    },
    setData(type: string, value: string) {
      data.set(type, value);
    },
  } as unknown as DataTransfer;
}

async function flushEditor() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('blockSelectionUtils', () => {
  it('serializes selected top-level blocks with their child content', async () => {
    const editor = createEditor({
      namespace: 'BlockSelectionClipboardTest',
      onError: (error) => {
        throw error;
      },
    });
    const rootElement = document.createElement('div');
    document.body.append(rootElement);
    editor.setRootElement(rootElement);

    let clipboardData: Record<string, string> | null = null;

    editor.update(() => {
      const root = $getRoot();
      const firstParagraph = $createParagraphNode();
      firstParagraph.append($createTextNode('Alpha'));
      const secondParagraph = $createParagraphNode();
      secondParagraph.append($createTextNode('Beta'));
      root.append(firstParagraph, secondParagraph);
    });

    await flushEditor();

    editor.getEditorState().read(() => {
      const nodes = $getRoot().getChildren();
      clipboardData = buildBlockClipboardData(editor, nodes);
    });

    expect(clipboardData).not.toBeNull();
    expect(clipboardData?.['text/html']).toContain('Alpha');
    expect(clipboardData?.['text/html']).toContain('Beta');
    expect(clipboardData?.['text/plain']).toBe('Alpha\n\nBeta');

    const lexicalPayload = JSON.parse(clipboardData!['application/x-lexical-editor']) as {
      namespace: string;
      nodes: Array<{ children?: Array<{ text?: string }> }>;
    };

    expect(lexicalPayload.namespace).toBe('BlockSelectionClipboardTest');
    expect(lexicalPayload.nodes).toHaveLength(2);
    expect(lexicalPayload.nodes[0].children?.[0]?.text).toBe('Alpha');
    expect(lexicalPayload.nodes[1].children?.[0]?.text).toBe('Beta');

    rootElement.remove();
  });

  it('preserves a non-empty root after deleting all selected blocks', async () => {
    const editor = createEditor({
      namespace: 'BlockSelectionDeleteTest',
      onError: (error) => {
        throw error;
      },
    });

    editor.update(() => {
      const root = $getRoot();
      const firstParagraph = $createParagraphNode();
      firstParagraph.append($createTextNode('Alpha'));
      const secondParagraph = $createParagraphNode();
      secondParagraph.append($createTextNode('Beta'));
      root.append(firstParagraph, secondParagraph);

      removeTopLevelNodesAndRestoreSelection([firstParagraph, secondParagraph]);
    });

    await flushEditor();

    editor.getEditorState().read(() => {
      const root = $getRoot();
      const selection = $getSelection();
      const onlyChild = root.getFirstChild();

      expect(root.getChildrenSize()).toBe(1);
      expect($isParagraphNode(onlyChild)).toBe(true);
      expect(onlyChild?.getTextContent()).toBe('');
      expect($isRangeSelection(selection)).toBe(true);

      if ($isParagraphNode(onlyChild) && $isRangeSelection(selection)) {
        expect(selection.anchor.getNode().getTopLevelElementOrThrow().getKey()).toBe(
          onlyChild.getKey(),
        );
      }
    });
  });

  it('creates an insertion target at the selected block position for plain text paste', async () => {
    const editor = createEditor({
      namespace: 'BlockSelectionPlainTextPasteTest',
      onError: (error) => {
        throw error;
      },
    });

    editor.update(() => {
      const root = $getRoot();
      const firstParagraph = $createParagraphNode();
      firstParagraph.append($createTextNode('Alpha'));
      const selectedParagraph = $createParagraphNode();
      selectedParagraph.append($createTextNode('Beta'));
      const lastParagraph = $createParagraphNode();
      lastParagraph.append($createTextNode('Gamma'));
      root.append(firstParagraph, selectedParagraph, lastParagraph);

      removeTopLevelNodesAndCreatePasteTarget([selectedParagraph]);
      expect(
        insertDataTransferForBlockSelectionPaste(
          editor,
          createMockDataTransfer({ 'text/plain': 'Pasted' }),
        ),
      ).toBe(true);
    });

    await flushEditor();

    editor.getEditorState().read(() => {
      expect(
        $getRoot()
          .getChildren()
          .map((node) => node.getTextContent()),
      ).toEqual(['Alpha', 'Pasted', 'Gamma']);
    });
  });

  it('lets downstream block insertion replace selected blocks without leaving a placeholder', async () => {
    const editor = createEditor({
      namespace: 'BlockSelectionBlockPasteTest',
      onError: (error) => {
        throw error;
      },
    });

    editor.update(() => {
      const root = $getRoot();
      const firstParagraph = $createParagraphNode();
      firstParagraph.append($createTextNode('Alpha'));
      const selectedParagraph = $createParagraphNode();
      selectedParagraph.append($createTextNode('Beta'));
      const lastParagraph = $createParagraphNode();
      lastParagraph.append($createTextNode('Gamma'));
      root.append(firstParagraph, selectedParagraph, lastParagraph);

      removeTopLevelNodesAndCreatePasteTarget([selectedParagraph]);

      const insertedFirstParagraph = $createParagraphNode();
      insertedFirstParagraph.append($createTextNode('Inserted A'));
      const insertedSecondParagraph = $createParagraphNode();
      insertedSecondParagraph.append($createTextNode('Inserted B'));

      const selection = $getSelection();
      expect($isRangeSelection(selection)).toBe(true);
      if ($isRangeSelection(selection)) {
        selection.insertNodes([insertedFirstParagraph, insertedSecondParagraph]);
      }
    });

    await flushEditor();

    editor.getEditorState().read(() => {
      expect(
        $getRoot()
          .getChildren()
          .map((node) => node.getTextContent()),
      ).toEqual(['Alpha', 'Inserted A', 'Inserted B', 'Gamma']);
    });
  });

  it('recognizes paste payloads carried by beforeinput InputEvent.dataTransfer', () => {
    const dataTransfer = createMockDataTransfer({ 'text/plain': 'Replacement' });

    expect(getDataTransferFromPasteEvent({ dataTransfer } as InputEvent)).toBe(dataTransfer);
    expect(isDataTransferOnlyPasteEvent({ dataTransfer } as InputEvent)).toBe(true);
    expect(hasInsertableClipboardData(dataTransfer)).toBe(true);
    expect(hasPasteableClipboardData(dataTransfer)).toBe(true);
  });

  it('reads plain text from the native Clipboard API for keyboard paste fallback', async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        readText: async () => 'Native clipboard text',
      },
    });

    try {
      const dataTransfer = await readNativeClipboardDataTransfer();
      expect(dataTransfer?.getData('text/plain')).toBe('Native clipboard text');
    } finally {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: originalClipboard,
      });
    }
  });
});
