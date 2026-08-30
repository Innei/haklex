import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isQuoteNode } from '@lexical/rich-text';
import {
  $addUpdateTag,
  $createNodeSelection,
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isDecoratorNode,
  $isElementNode,
  $isNodeSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isRootNode,
  $isTextNode,
  $setSelection,
  BLUR_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  HISTORY_MERGE_TAG,
  IS_CODE,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_SPACE_COMMAND,
  type LexicalEditor,
  type LexicalNode,
  type RangeSelection,
  SELECTION_CHANGE_COMMAND,
  SKIP_COLLAB_TAG,
  TextNode,
} from 'lexical';
import { useEffect } from 'react';

import { setCodeBlockCursorIntent } from '../utils/codeBlockSelectionIntent';

// Chrome needs a real text character here or the caret can snap back into the preceding <code>.
const INLINE_CODE_EXIT_CARET = '\u200B';

function selectDecoratorNode(node: LexicalNode, cursorPlacement: 'start' | 'end' = 'start') {
  if (node.getType() === 'code-block') {
    setCodeBlockCursorIntent(node.getKey(), cursorPlacement);
  }
  const selection = $createNodeSelection();
  selection.add(node.getKey());
  $setSelection(selection);
}

function isAtTopLevelBoundary(selection: RangeSelection, direction: 'start' | 'end'): boolean {
  const point = selection.anchor;
  const topLevel = point.getNode().getTopLevelElementOrThrow();
  const pointNode = point.getNode();

  if (point.type === 'text') {
    if (!$isTextNode(pointNode)) return false;
    const expectedOffset = direction === 'start' ? 0 : pointNode.getTextContentSize();
    if (point.offset !== expectedOffset) return false;
  } else {
    if (!$isElementNode(pointNode)) return false;
    const expectedOffset = direction === 'start' ? 0 : pointNode.getChildrenSize();
    if (point.offset !== expectedOffset) return false;
  }

  let current: LexicalNode | null = pointNode;
  while (current && current !== topLevel) {
    const sibling = direction === 'start' ? current.getPreviousSibling() : current.getNextSibling();
    if (sibling !== null) return false;
    current = current.getParent();
  }

  return current === topLevel;
}

function isSingleLineParagraph(node: LexicalNode): boolean {
  return $isParagraphNode(node) && !node.getTextContent().includes('\n');
}

function isDeeplyEmptyElement(node: LexicalNode): boolean {
  if (!$isElementNode(node)) {
    return false;
  }

  if (node.getChildrenSize() === 0) {
    return true;
  }

  for (const child of node.getChildren()) {
    if ($isTextNode(child)) {
      if (child.getTextContent().trim().length > 0) {
        return false;
      }
      continue;
    }

    if (!$isElementNode(child) || !isDeeplyEmptyElement(child)) {
      return false;
    }
  }

  return true;
}

function isSelectionInsideTopLevel(selection: RangeSelection, topLevelKey: string): boolean {
  return (
    selection.anchor.getNode().getTopLevelElementOrThrow().getKey() === topLevelKey &&
    selection.focus.getNode().getTopLevelElementOrThrow().getKey() === topLevelKey
  );
}

function exitInlineCodeAtLineEnd(selection: RangeSelection) {
  if (!selection.isCollapsed() || selection.anchor.type !== 'text') {
    return null;
  }

  const anchorNode = selection.anchor.getNode();
  if (!$isTextNode(anchorNode) || !anchorNode.hasFormat('code')) {
    return null;
  }

  if (selection.anchor.offset !== anchorNode.getTextContentSize()) {
    return null;
  }

  if (!isAtTopLevelBoundary(selection, 'end')) {
    return null;
  }

  selection.setFormat(anchorNode.getFormat() & ~IS_CODE);
  selection.setStyle(anchorNode.getStyle());

  return anchorNode;
}

export function BlockExitPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return registerBlockExitCommands(editor);
  }, [editor]);

  return null;
}

export function registerBlockExitCommands(editor: LexicalEditor) {
  let virtualParagraphKey: null | string = null;
  let inlineCodeExitCaretKey: null | string = null;
  let inlineCodeExitCaretStyle = '';

  const clearVirtualParagraph = () => {
    virtualParagraphKey = null;
  };

  const getVirtualParagraph = () => {
    if (!virtualParagraphKey) {
      return null;
    }

    const node = $getNodeByKey(virtualParagraphKey);
    return $isParagraphNode(node) ? node : null;
  };

  const $releaseInlineCodeExitCaret = () => {
    const caretKey = inlineCodeExitCaretKey;
    if (!caretKey) return;

    inlineCodeExitCaretKey = null;
    const originalStyle = inlineCodeExitCaretStyle;
    inlineCodeExitCaretStyle = '';
    $addUpdateTag(HISTORY_MERGE_TAG);
    $addUpdateTag(SKIP_COLLAB_TAG);

    const caretNode = $getNodeByKey(caretKey);
    if (!$isTextNode(caretNode)) return;

    const text = caretNode.getTextContent().replaceAll(INLINE_CODE_EXIT_CARET, '');
    if (text === '') {
      caretNode.remove();
      return;
    }

    caretNode.setTextContent(text).setStyle(originalStyle);
    if (caretNode.isUnmergeable()) caretNode.toggleUnmergeable();
  };

  const insertVirtualParagraph = (
    target: LexicalNode,
    position: 'after' | 'before',
    cursorPlacement: 'start' | 'end' = 'start',
  ) => {
    const paragraph = $createParagraphNode();

    if (position === 'before') {
      target.insertBefore(paragraph);
    } else {
      target.insertAfter(paragraph);
    }

    virtualParagraphKey = paragraph.getKey();

    if (cursorPlacement === 'end') {
      paragraph.selectEnd();
    } else {
      paragraph.selectStart();
    }

    return true;
  };

  const unregisterVirtualParagraphCleanup = editor.registerUpdateListener(({ editorState }) => {
    if (!virtualParagraphKey) {
      return;
    }

    let shouldKeepTracking = false;
    let shouldRemove = false;

    editorState.read(() => {
      const paragraph = getVirtualParagraph();
      if (!paragraph) {
        return;
      }

      const selection = $getSelection();
      if (
        $isRangeSelection(selection) &&
        isSelectionInsideTopLevel(selection, paragraph.getKey())
      ) {
        shouldKeepTracking = true;
        return;
      }

      shouldRemove = isDeeplyEmptyElement(paragraph);
    });

    if (shouldKeepTracking) {
      return;
    }

    editor.update(() => {
      const paragraph = getVirtualParagraph();
      if (paragraph && shouldRemove && isDeeplyEmptyElement(paragraph)) {
        paragraph.remove();
      }
      clearVirtualParagraph();
    });
  });

  const unregisterInlineCodeExitCaretCleanup = editor.registerCommand(
    SELECTION_CHANGE_COMMAND,
    () => {
      const caretKey = inlineCodeExitCaretKey;
      if (!caretKey) return false;

      const caretNode = $getNodeByKey(caretKey);
      const selection = $getSelection();
      const isActive =
        $isTextNode(caretNode) &&
        (caretNode.isComposing() ||
          ($isRangeSelection(selection) &&
            selection.isCollapsed() &&
            selection.anchor.key === caretKey));

      if (!isActive) $releaseInlineCodeExitCaret();
      return false;
    },
    COMMAND_PRIORITY_HIGH,
  );

  const unregisterInlineCodeExitCaretTransform = editor.registerNodeTransform(TextNode, () => {
    const caretKey = inlineCodeExitCaretKey;
    if (!caretKey) return;

    const caretNode = $getNodeByKey(caretKey);
    const selection = $getSelection();
    if ($isTextNode(caretNode) && caretNode.isComposing()) return;

    if (
      !$isTextNode(caretNode) ||
      caretNode.getTextContent() !== INLINE_CODE_EXIT_CARET ||
      !$isRangeSelection(selection) ||
      selection.anchor.key !== caretKey
    ) {
      $releaseInlineCodeExitCaret();
    }
  });

  const unregisterInlineCodeExitCaretBlur = editor.registerCommand(
    BLUR_COMMAND,
    () => {
      $releaseInlineCodeExitCaret();
      return false;
    },
    COMMAND_PRIORITY_HIGH,
  );

  const unregisterArrowRight = editor.registerCommand(
    KEY_ARROW_RIGHT_COMMAND,
    (event) => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return false;
      const codeNode = exitInlineCodeAtLineEnd(selection);
      if (!codeNode) return false;

      inlineCodeExitCaretStyle = codeNode.getStyle();
      const caretNode = $createTextNode(INLINE_CODE_EXIT_CARET)
        .setFormat(codeNode.getFormat() & ~IS_CODE)
        .setStyle([inlineCodeExitCaretStyle, 'margin-left: 4px'].filter(Boolean).join('; '))
        .toggleUnmergeable();
      codeNode.insertAfter(caretNode);
      caretNode.selectEnd();
      inlineCodeExitCaretKey = caretNode.getKey();
      $addUpdateTag(HISTORY_MERGE_TAG);
      $addUpdateTag(SKIP_COLLAB_TAG);

      event?.preventDefault();
      return true;
    },
    COMMAND_PRIORITY_CRITICAL,
  );

  const unregisterInlineCodeSpace = editor.registerCommand(
    KEY_SPACE_COMMAND,
    () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) exitInlineCodeAtLineEnd(selection);
      return false;
    },
    COMMAND_PRIORITY_CRITICAL,
  );

  // ArrowDown: exit QuoteNode when at last empty paragraph
  const unregisterArrowDown = editor.registerCommand(
    KEY_ARROW_DOWN_COMMAND,
    (event) => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return false;
      }

      const anchorNode = selection.anchor.getNode();
      const topLevelElement = anchorNode.getTopLevelElementOrThrow();

      const shouldSelectNextDecorator =
        isAtTopLevelBoundary(selection, 'end') || isSingleLineParagraph(topLevelElement);

      if (!$isQuoteNode(topLevelElement) && shouldSelectNextDecorator) {
        const next = topLevelElement.getNextSibling();
        if (next && $isDecoratorNode(next) && next.isKeyboardSelectable()) {
          event?.preventDefault();
          selectDecoratorNode(next, 'start');
          return true;
        }
      }

      const element = $isElementNode(anchorNode) ? anchorNode : anchorNode.getParentOrThrow();

      // Walk up to find QuoteNode parent
      let quoteChild = element;
      let quoteNode = null;
      let current = element;
      while (current) {
        const parent = current.getParent();
        if (!parent || $isRootNode(parent)) break;
        if ($isQuoteNode(parent)) {
          quoteNode = parent;
          quoteChild = current;
          break;
        }
        current = parent;
      }

      if (
        quoteNode &&
        quoteChild.getNextSibling() === null &&
        $isParagraphNode(quoteChild) &&
        quoteChild.getTextContent() === ''
      ) {
        event?.preventDefault();
        let next = quoteNode.getNextSibling();
        if (!next) {
          next = $createParagraphNode();
          quoteNode.insertAfter(next);
        }
        next.selectStart();
        return true;
      }

      if (
        !event?.shiftKey &&
        topLevelElement.getNextSibling() === null &&
        isAtTopLevelBoundary(selection, 'end') &&
        topLevelElement.getKey() !== virtualParagraphKey &&
        !isDeeplyEmptyElement(topLevelElement)
      ) {
        event?.preventDefault();
        return insertVirtualParagraph(topLevelElement, 'after');
      }

      return false;
    },
    COMMAND_PRIORITY_CRITICAL,
  );

  // Enter on a selected DecoratorNode inserts a paragraph after it;
  // Cmd+Enter jumps to (or creates) the next block, and also exits
  // any non-paragraph top-level block from a RangeSelection
  const unregisterEnter = editor.registerCommand(
    KEY_ENTER_COMMAND,
    (event) => {
      const selection = $getSelection();

      if ($isNodeSelection(selection) && !event?.shiftKey) {
        const nodes = selection.getNodes();
        if (nodes.length !== 1) return false;
        const node = nodes[0];
        if (!$isDecoratorNode(node)) return false;

        event?.preventDefault();

        if (event?.metaKey || event?.ctrlKey) {
          let next = node.getNextSibling();
          if (!next) {
            next = $createParagraphNode();
            node.insertAfter(next);
          }

          if ($isElementNode(next)) {
            next.selectStart();
          } else if ($isDecoratorNode(next)) {
            selectDecoratorNode(next, 'start');
          }
          return true;
        }

        const paragraph = $createParagraphNode();
        node.insertAfter(paragraph);
        paragraph.selectStart();
        return true;
      }

      if (!event?.metaKey && !event?.ctrlKey) return false;
      if (!$isRangeSelection(selection)) return false;

      const anchorNode = selection.anchor.getNode();
      const topLevelElement = anchorNode.getTopLevelElementOrThrow();

      if ($isParagraphNode(topLevelElement)) return false;

      event.preventDefault();
      let next = topLevelElement.getNextSibling();
      if (!next || !$isParagraphNode(next)) {
        next = $createParagraphNode();
        topLevelElement.insertAfter(next);
      }
      next.selectStart();
      return true;
    },
    COMMAND_PRIORITY_CRITICAL,
  );

  // Backspace/Delete on selected DecoratorNode
  function handleDeleteDecorator(event: KeyboardEvent | null) {
    const selection = $getSelection();
    if (!$isNodeSelection(selection)) return false;

    const nodes = selection.getNodes();
    if (nodes.length !== 1) return false;
    const node = nodes[0];
    if (!$isDecoratorNode(node)) return false;

    event?.preventDefault();
    const prev = node.getPreviousSibling();
    const next = node.getNextSibling();
    node.remove();

    if (prev && $isElementNode(prev)) {
      prev.selectEnd();
    } else if (prev && $isDecoratorNode(prev)) {
      selectDecoratorNode(prev, 'end');
    } else if (next && $isElementNode(next)) {
      next.selectStart();
    } else if (next && $isDecoratorNode(next)) {
      selectDecoratorNode(next, 'start');
    } else {
      const root = $getRoot();
      if (root && $isElementNode(root)) {
        const p = $createParagraphNode();
        root.append(p);
        p.selectStart();
      }
    }
    return true;
  }

  const unregisterBackspace = editor.registerCommand(
    KEY_BACKSPACE_COMMAND,
    handleDeleteDecorator,
    COMMAND_PRIORITY_HIGH,
  );

  const unregisterDelete = editor.registerCommand(
    KEY_DELETE_COMMAND,
    handleDeleteDecorator,
    COMMAND_PRIORITY_HIGH,
  );

  // ArrowUp on selected DecoratorNode: move to previous sibling
  const unregisterArrowUpDecorator = editor.registerCommand(
    KEY_ARROW_UP_COMMAND,
    (event) => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && selection.isCollapsed()) {
        const anchorNode = selection.anchor.getNode();
        const topLevelElement = anchorNode.getTopLevelElementOrThrow();

        const shouldSelectPreviousDecorator =
          isAtTopLevelBoundary(selection, 'start') || isSingleLineParagraph(topLevelElement);

        if (!$isQuoteNode(topLevelElement) && shouldSelectPreviousDecorator) {
          const prev = topLevelElement.getPreviousSibling();
          if (prev && $isDecoratorNode(prev) && prev.isKeyboardSelectable()) {
            event?.preventDefault();
            selectDecoratorNode(prev, 'end');
            return true;
          }
        }

        if (
          !event?.shiftKey &&
          topLevelElement.getPreviousSibling() === null &&
          isAtTopLevelBoundary(selection, 'start') &&
          topLevelElement.getKey() !== virtualParagraphKey &&
          !isDeeplyEmptyElement(topLevelElement)
        ) {
          event?.preventDefault();
          return insertVirtualParagraph(topLevelElement, 'before');
        }
      }

      if (!$isNodeSelection(selection)) return false;

      const nodes = selection.getNodes();
      if (nodes.length !== 1) return false;
      const node = nodes[0];
      if (!$isDecoratorNode(node)) return false;

      const prev = node.getPreviousSibling();
      if (prev && $isElementNode(prev)) {
        event?.preventDefault();
        prev.selectEnd();
        return true;
      }
      if (prev && $isDecoratorNode(prev)) {
        event?.preventDefault();
        selectDecoratorNode(prev, 'end');
        return true;
      }
      if (
        !event?.shiftKey &&
        node.getTopLevelElementOrThrow().getPreviousSibling() === null &&
        node.getKey() !== virtualParagraphKey
      ) {
        event?.preventDefault();
        return insertVirtualParagraph(node, 'before', 'end');
      }
      return false;
    },
    COMMAND_PRIORITY_CRITICAL,
  );

  // ArrowDown on selected DecoratorNode: move to next sibling
  const unregisterArrowDownDecorator = editor.registerCommand(
    KEY_ARROW_DOWN_COMMAND,
    (event) => {
      const selection = $getSelection();
      if (!$isNodeSelection(selection)) return false;

      const nodes = selection.getNodes();
      if (nodes.length !== 1) return false;
      const node = nodes[0];
      if (!$isDecoratorNode(node)) return false;

      const next = node.getNextSibling();
      if (next && $isElementNode(next)) {
        event?.preventDefault();
        next.selectStart();
        return true;
      }
      if (next && $isDecoratorNode(next)) {
        event?.preventDefault();
        selectDecoratorNode(next, 'start');
        return true;
      }
      if (
        !event?.shiftKey &&
        node.getTopLevelElementOrThrow().getNextSibling() === null &&
        node.getKey() !== virtualParagraphKey
      ) {
        event?.preventDefault();
        return insertVirtualParagraph(node, 'after');
      }
      return false;
    },
    COMMAND_PRIORITY_CRITICAL,
  );

  return () => {
    unregisterVirtualParagraphCleanup();
    unregisterInlineCodeExitCaretCleanup();
    unregisterInlineCodeExitCaretTransform();
    unregisterInlineCodeExitCaretBlur();
    editor.update($releaseInlineCodeExitCaret);
    unregisterArrowRight();
    unregisterInlineCodeSpace();
    unregisterArrowDown();
    unregisterEnter();
    unregisterBackspace();
    unregisterDelete();
    unregisterArrowUpDecorator();
    unregisterArrowDownDecorator();
    clearVirtualParagraph();
  };
}
