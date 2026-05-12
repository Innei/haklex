import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  createEditor,
} from 'lexical';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/styles/details.css', () => ({
  detailsClassNames: {
    details: 'rich-details',
    summary: 'rich-details-summary',
    chevron: 'rich-details-chevron',
    summaryText: 'rich-details-summary-text',
    content: 'rich-details-content',
  },
  detailsStyles: {
    details: '',
    summary: '',
    chevron: '',
    summaryText: '',
    content: '',
  },
}));

const { $createDetailsNode, $isDetailsNode, DetailsNode } =
  await import('../src/nodes/DetailsNode');

function createTestEditor() {
  const editor = createEditor({
    namespace: 'DetailsPasteTest',
    nodes: [DetailsNode],
    onError: (error) => {
      throw error;
    },
  });
  return editor;
}

async function flushEditor() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('DetailsNode paste safety', () => {
  it('slash menu insertion seeds an inner paragraph and places cursor inside', async () => {
    const editor = createTestEditor();

    const slashItem = DetailsNode.slashMenuItems[0];
    editor.update(
      () => {
        slashItem.onSelect(editor, '');
      },
      { discrete: true },
    );
    await flushEditor();

    editor.getEditorState().read(() => {
      const root = $getRoot();
      const details = root.getFirstChild();
      expect($isDetailsNode(details)).toBe(true);
      if (!$isDetailsNode(details)) return;
      expect(details.getChildrenSize()).toBe(1);
      const inner = details.getFirstChild();
      expect($isParagraphNode(inner)).toBe(true);

      const selection = $getSelection();
      expect($isRangeSelection(selection)).toBe(true);
      if (!$isRangeSelection(selection)) return;

      const anchorNode = selection.anchor.getNode();
      const topBlock = anchorNode.getTopLevelElement();
      expect(topBlock && $isDetailsNode(topBlock)).toBe(true);
    });
  });

  it('rich-text paste inserts blocks INSIDE DetailsNode (regression)', async () => {
    const editor = createTestEditor();

    const slashItem = DetailsNode.slashMenuItems[0];
    editor.update(
      () => {
        slashItem.onSelect(editor, '');
      },
      { discrete: true },
    );
    await flushEditor();

    editor.update(
      () => {
        const selection = $getSelection();
        expect($isRangeSelection(selection)).toBe(true);
        if (!$isRangeSelection(selection)) return;

        const a = $createParagraphNode();
        a.append($createTextNode('pasted A'));
        const b = $createParagraphNode();
        b.append($createTextNode('pasted B'));

        selection.insertNodes([a, b]);
      },
      { discrete: true },
    );
    await flushEditor();

    editor.getEditorState().read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBe(1);
      const details = root.getFirstChild();
      expect($isDetailsNode(details)).toBe(true);
      const text = details!.getTextContent();
      expect(text).toContain('pasted A');
      expect(text).toContain('pasted B');
    });
  });

  it('rich-text paste keeps content inside when DetailsNode already has typed content', async () => {
    const editor = createTestEditor();

    editor.update(
      () => {
        const root = $getRoot();
        const details = $createDetailsNode('Summary');
        const innerPara = $createParagraphNode();
        innerPara.append($createTextNode('inside details'));
        details.append(innerPara);
        root.append(details);
        innerPara.selectEnd();
      },
      { discrete: true },
    );
    await flushEditor();

    editor.update(
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        const a = $createParagraphNode();
        a.append($createTextNode('pasted A'));
        const b = $createParagraphNode();
        b.append($createTextNode('pasted B'));
        selection.insertNodes([a, b]);
      },
      { discrete: true },
    );
    await flushEditor();

    editor.getEditorState().read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBe(1);
      const details = root.getFirstChild();
      expect($isDetailsNode(details)).toBe(true);
      const text = details!.getTextContent();
      expect(text).toContain('inside details');
      expect(text).toContain('pasted A');
      expect(text).toContain('pasted B');
    });
  });
});
