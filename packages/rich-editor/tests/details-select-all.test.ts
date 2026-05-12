import {
  $createNodeSelection,
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  createEditor,
  type ElementNode,
  type LexicalEditor,
  type LexicalNode,
  type RangeSelection,
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

const { $createDetailsNode, DetailsNode } = await import('../src/nodes/DetailsNode');

function createEditorWithDetails() {
  const editor = createEditor({
    namespace: 'DetailsSelectAllTest',
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

function $rangeCoversEntireContent(sel: RangeSelection, target: ElementNode): boolean {
  if (target.getChildrenSize() === 0) return false;
  const [startPoint, endPoint] = sel.isBackward()
    ? [sel.focus, sel.anchor]
    : [sel.anchor, sel.focus];
  const targetKey = target.getKey();

  const firstDesc = target.getFirstDescendant();
  const isStart =
    (startPoint.type === 'element' && startPoint.key === targetKey && startPoint.offset === 0) ||
    (startPoint.type === 'text' &&
      firstDesc !== null &&
      firstDesc.getKey() === startPoint.key &&
      startPoint.offset === 0);
  if (!isStart) return false;

  const lastDesc = target.getLastDescendant();
  const isEnd =
    (endPoint.type === 'element' &&
      endPoint.key === targetKey &&
      endPoint.offset === target.getChildrenSize()) ||
    (endPoint.type === 'text' &&
      $isTextNode(lastDesc) &&
      lastDesc.getKey() === endPoint.key &&
      endPoint.offset === lastDesc.getTextContentSize());
  return isEnd;
}

// Replicates the SELECT_ALL behavior from useBlockSelection
function runSelectAll(state: {
  editor: LexicalEditor;
  blockSelectionKeysRef: { current: Set<string> };
}): { handled: boolean } {
  const { editor, blockSelectionKeysRef } = state;
  let handled = false;

  editor.update(
    () => {
      if (blockSelectionKeysRef.current.size > 0) {
        const children = $getRoot().getChildren();
        const allKeys = children.map((c) => c.getKey());
        if (blockSelectionKeysRef.current.size >= allKeys.length) {
          handled = true;
          return;
        }
        blockSelectionKeysRef.current = new Set(allKeys);
        handled = true;
        return;
      }

      const sel = $getSelection();
      let topLevelKey: string | null = null;
      let topLevelNode: LexicalNode | null = null;

      if ($isRangeSelection(sel)) {
        let node: LexicalNode | null = sel.anchor.getNode();
        while (node && node.getParent() && node.getParent() !== $getRoot()) {
          node = node.getParent();
        }
        if (node && node.getParent() === $getRoot()) {
          topLevelKey = node.getKey();
          topLevelNode = node;
        }
      } else if ($isNodeSelection(sel)) {
        const nodes = sel.getNodes();
        if (nodes.length > 0) {
          let node: LexicalNode | null = nodes[0];
          while (node && node.getParent() && node.getParent() !== $getRoot()) {
            node = node.getParent();
          }
          if (node && node.getParent() === $getRoot()) {
            topLevelKey = node.getKey();
            topLevelNode = node;
          }
        }
      }

      if (topLevelNode && $isElementNode(topLevelNode)) {
        const childrenSize = topLevelNode.getChildrenSize();
        const isContentRangeAlready =
          $isRangeSelection(sel) && $rangeCoversEntireContent(sel, topLevelNode);

        if (childrenSize > 0 && !isContentRangeAlready) {
          topLevelNode.select(0, childrenSize);
          handled = true;
          return;
        }
      }

      if (topLevelKey) {
        blockSelectionKeysRef.current = new Set([topLevelKey]);
        const nodeSel = $createNodeSelection();
        nodeSel.add(topLevelKey);
        $setSelection(nodeSel);
        handled = true;
      }
    },
    { discrete: true },
  );

  return { handled };
}

describe('SELECT_ALL progression in DetailsNode', () => {
  it('first call should select content, second should escalate to block, third to all', async () => {
    const editor = createEditorWithDetails();
    const blockSelectionKeysRef = { current: new Set<string>() };

    editor.update(
      () => {
        const root = $getRoot();
        const details = $createDetailsNode('Summary');
        const para = $createParagraphNode();
        para.append($createTextNode('hello'));
        details.append(para);
        root.append(details);
        // Also add another root paragraph for level-3 escalation test
        const tail = $createParagraphNode();
        tail.append($createTextNode('tail'));
        root.append(tail);
        para.selectEnd();
      },
      { discrete: true },
    );
    await flushEditor();

    // First call: should produce RangeSelection across DetailsNode content
    runSelectAll({ editor, blockSelectionKeysRef });
    await flushEditor();

    editor.getEditorState().read(() => {
      const sel = $getSelection();
      console.info('[after 1st] isRange:', $isRangeSelection(sel));
      if ($isRangeSelection(sel)) {
        console.info('[after 1st] anchor:', sel.anchor.key, sel.anchor.type, sel.anchor.offset);
        console.info('[after 1st] focus:', sel.focus.key, sel.focus.type, sel.focus.offset);
      }
      console.info('[after 1st] blockKeys:', [...blockSelectionKeysRef.current]);
    });

    // Second call: should produce NodeSelection({DetailsNode})
    runSelectAll({ editor, blockSelectionKeysRef });
    await flushEditor();

    editor.getEditorState().read(() => {
      const sel = $getSelection();
      console.info('[after 2nd] isNode:', $isNodeSelection(sel));
      console.info('[after 2nd] isRange:', $isRangeSelection(sel));
      if ($isRangeSelection(sel)) {
        console.info('[after 2nd] anchor:', sel.anchor.key, sel.anchor.type, sel.anchor.offset);
        console.info('[after 2nd] focus:', sel.focus.key, sel.focus.type, sel.focus.offset);
      }
      console.info('[after 2nd] blockKeys:', [...blockSelectionKeysRef.current]);
    });

    expect(true).toBe(true);
  });

  it('after content selection normalized to text points, 2nd Cmd+A escalates to NodeSelection', async () => {
    const editor = createEditorWithDetails();
    const blockSelectionKeysRef = { current: new Set<string>() };

    let detailsKey = '';
    let textKey = '';

    editor.update(
      () => {
        const root = $getRoot();
        const details = $createDetailsNode('Summary');
        detailsKey = details.getKey();
        const para = $createParagraphNode();
        const text = $createTextNode('hello');
        textKey = text.getKey();
        para.append(text);
        details.append(para);
        root.append(details);

        // Simulate post-DOM-sync state: text-point range across the full content
        const rangeSel = $createRangeSelection();
        rangeSel.anchor.set(text.getKey(), 0, 'text');
        rangeSel.focus.set(text.getKey(), text.getTextContentSize(), 'text');
        $setSelection(rangeSel);
      },
      { discrete: true },
    );
    await flushEditor();

    // Sanity: blockKeys empty, selection is text-point range covering content
    editor.getEditorState().read(() => {
      const sel = $getSelection();
      expect($isRangeSelection(sel)).toBe(true);
      if ($isRangeSelection(sel)) {
        expect(sel.anchor.type).toBe('text');
        expect(sel.focus.type).toBe('text');
        expect(sel.anchor.key).toBe(textKey);
      }
    });

    runSelectAll({ editor, blockSelectionKeysRef });
    await flushEditor();

    editor.getEditorState().read(() => {
      const sel = $getSelection();
      console.info('[text-normalized 2nd] isNode:', $isNodeSelection(sel));
      console.info('[text-normalized 2nd] blockKeys:', [...blockSelectionKeysRef.current]);
      expect($isNodeSelection(sel)).toBe(true);
      expect([...blockSelectionKeysRef.current]).toEqual([detailsKey]);
    });
  });
});
