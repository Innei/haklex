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
  removeTopLevelNodesAndRestoreSelection,
} from '../src/blockSelectionUtils';

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
});
