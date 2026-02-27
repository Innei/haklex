import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $isQuoteNode } from '@lexical/rich-text'
import {
  $createNodeSelection,
  $createParagraphNode,
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
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  type LexicalNode,
  type RangeSelection,
} from 'lexical'
import { useEffect } from 'react'

import { setCodeBlockCursorIntent } from '../utils/codeBlockSelectionIntent'

function selectDecoratorNode(
  node: LexicalNode,
  cursorPlacement: 'start' | 'end' = 'start',
) {
  if (node.getType() === 'code-block') {
    setCodeBlockCursorIntent(node.getKey(), cursorPlacement)
  }
  const selection = $createNodeSelection()
  selection.add(node.getKey())
  $setSelection(selection)
}

function isAtTopLevelBoundary(
  selection: RangeSelection,
  direction: 'start' | 'end',
): boolean {
  const point = selection.anchor
  const topLevel = point.getNode().getTopLevelElementOrThrow()
  const pointNode = point.getNode()

  if (point.type === 'text') {
    if (!$isTextNode(pointNode)) return false
    const expectedOffset =
      direction === 'start' ? 0 : pointNode.getTextContentSize()
    if (point.offset !== expectedOffset) return false
  } else {
    if (!$isElementNode(pointNode)) return false
    const expectedOffset =
      direction === 'start' ? 0 : pointNode.getChildrenSize()
    if (point.offset !== expectedOffset) return false
  }

  let current: LexicalNode | null = pointNode
  while (current && current !== topLevel) {
    const sibling =
      direction === 'start'
        ? current.getPreviousSibling()
        : current.getNextSibling()
    if (sibling !== null) return false
    current = current.getParent()
  }

  return current === topLevel
}

function isSingleLineParagraph(node: LexicalNode): boolean {
  return $isParagraphNode(node) && !node.getTextContent().includes('\n')
}

export function BlockExitPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    // ArrowDown: exit QuoteNode when at last empty paragraph
    const unregisterArrowDown = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      (event) => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false
        }

        const anchorNode = selection.anchor.getNode()
        const topLevelElement = anchorNode.getTopLevelElementOrThrow()

        const shouldSelectNextDecorator =
          isAtTopLevelBoundary(selection, 'end') ||
          isSingleLineParagraph(topLevelElement)

        if (!$isQuoteNode(topLevelElement) && shouldSelectNextDecorator) {
          const next = topLevelElement.getNextSibling()
          if (next && $isDecoratorNode(next) && next.isKeyboardSelectable()) {
            event?.preventDefault()
            selectDecoratorNode(next, 'start')
            return true
          }
        }

        const element = $isElementNode(anchorNode)
          ? anchorNode
          : anchorNode.getParentOrThrow()

        // Walk up to find QuoteNode parent
        let quoteChild = element
        let quoteNode = null
        let current = element
        while (current) {
          const parent = current.getParent()
          if (!parent || $isRootNode(parent)) break
          if ($isQuoteNode(parent)) {
            quoteNode = parent
            quoteChild = current
            break
          }
          current = parent
        }

        if (!quoteNode) return false
        if (quoteChild.getNextSibling() !== null) return false
        if (!$isParagraphNode(quoteChild) || quoteChild.getTextContent() !== '')
          return false

        event?.preventDefault()
        let next = quoteNode.getNextSibling()
        if (!next) {
          next = $createParagraphNode()
          quoteNode.insertAfter(next)
        }
        next.selectStart()
        return true
      },
      COMMAND_PRIORITY_CRITICAL,
    )

    // Cmd+Enter: exit any non-paragraph top-level block (including DecoratorNodes)
    const unregisterCmdEnter = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        if (!event?.metaKey && !event?.ctrlKey) return false

        const selection = $getSelection()

        // Handle NodeSelection (selected DecoratorNode)
        if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes()
          if (nodes.length !== 1) return false
          const node = nodes[0]
          if (!$isDecoratorNode(node)) return false

          event.preventDefault()
          let next = node.getNextSibling()
          if (!next) {
            next = $createParagraphNode()
            node.insertAfter(next)
          }

          if ($isElementNode(next)) {
            next.selectStart()
          } else if ($isDecoratorNode(next)) {
            selectDecoratorNode(next, 'start')
          }
          return true
        }

        if (!$isRangeSelection(selection)) return false

        const anchorNode = selection.anchor.getNode()
        const topLevelElement = anchorNode.getTopLevelElementOrThrow()

        if ($isParagraphNode(topLevelElement)) return false

        event.preventDefault()
        let next = topLevelElement.getNextSibling()
        if (!next || !$isParagraphNode(next)) {
          next = $createParagraphNode()
          topLevelElement.insertAfter(next)
        }
        next.selectStart()
        return true
      },
      COMMAND_PRIORITY_CRITICAL,
    )

    // Backspace/Delete on selected DecoratorNode
    function handleDeleteDecorator(event: KeyboardEvent | null) {
      const selection = $getSelection()
      if (!$isNodeSelection(selection)) return false

      const nodes = selection.getNodes()
      if (nodes.length !== 1) return false
      const node = nodes[0]
      if (!$isDecoratorNode(node)) return false

      event?.preventDefault()
      const prev = node.getPreviousSibling()
      const next = node.getNextSibling()
      node.remove()

      if (prev && $isElementNode(prev)) {
        prev.selectEnd()
      } else if (prev && $isDecoratorNode(prev)) {
        selectDecoratorNode(prev, 'end')
      } else if (next && $isElementNode(next)) {
        next.selectStart()
      } else if (next && $isDecoratorNode(next)) {
        selectDecoratorNode(next, 'start')
      } else {
        const root = $getRoot()
        if (root && $isElementNode(root)) {
          const p = $createParagraphNode()
          root.append(p)
          p.selectStart()
        }
      }
      return true
    }

    const unregisterBackspace = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      handleDeleteDecorator,
      COMMAND_PRIORITY_HIGH,
    )

    const unregisterDelete = editor.registerCommand(
      KEY_DELETE_COMMAND,
      handleDeleteDecorator,
      COMMAND_PRIORITY_HIGH,
    )

    // ArrowUp on selected DecoratorNode: move to previous sibling
    const unregisterArrowUpDecorator = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      (event) => {
        const selection = $getSelection()
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const anchorNode = selection.anchor.getNode()
          const topLevelElement = anchorNode.getTopLevelElementOrThrow()

          const shouldSelectPreviousDecorator =
            isAtTopLevelBoundary(selection, 'start') ||
            isSingleLineParagraph(topLevelElement)

          if (!$isQuoteNode(topLevelElement) && shouldSelectPreviousDecorator) {
            const prev = topLevelElement.getPreviousSibling()
            if (prev && $isDecoratorNode(prev) && prev.isKeyboardSelectable()) {
              event?.preventDefault()
              selectDecoratorNode(prev, 'end')
              return true
            }
          }
        }

        if (!$isNodeSelection(selection)) return false

        const nodes = selection.getNodes()
        if (nodes.length !== 1) return false
        const node = nodes[0]
        if (!$isDecoratorNode(node)) return false

        const prev = node.getPreviousSibling()
        if (prev && $isElementNode(prev)) {
          event?.preventDefault()
          prev.selectEnd()
          return true
        }
        if (prev && $isDecoratorNode(prev)) {
          event?.preventDefault()
          selectDecoratorNode(prev, 'end')
          return true
        }
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )

    // ArrowDown on selected DecoratorNode: move to next sibling
    const unregisterArrowDownDecorator = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      (event) => {
        const selection = $getSelection()
        if (!$isNodeSelection(selection)) return false

        const nodes = selection.getNodes()
        if (nodes.length !== 1) return false
        const node = nodes[0]
        if (!$isDecoratorNode(node)) return false

        const next = node.getNextSibling()
        if (next && $isElementNode(next)) {
          event?.preventDefault()
          next.selectStart()
          return true
        }
        if (next && $isDecoratorNode(next)) {
          event?.preventDefault()
          selectDecoratorNode(next, 'start')
          return true
        }
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )

    return () => {
      unregisterArrowDown()
      unregisterCmdEnter()
      unregisterBackspace()
      unregisterDelete()
      unregisterArrowUpDecorator()
      unregisterArrowDownDecorator()
    }
  }, [editor])

  return null
}
