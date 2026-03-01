import type { RefObject } from 'react'
import { useEffect } from 'react'

import type { BlockInfo, Comment } from '../../pages/CommentsPage'

interface CommentHighlighterProps {
  containerRef: RefObject<HTMLDivElement | null>
  blockInfos: BlockInfo[]
  comments: Comment[]
  activeId: string | null
}

function getContentElement(container: HTMLDivElement): Element | null {
  return container.querySelector('.rich-content')
}

function findDomTextNode(
  container: Element,
  targetOffset: number,
): { node: Text; offset: number } | null {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let consumed = 0
  let textNode: Text | null
  while ((textNode = walker.nextNode() as Text | null)) {
    const len = textNode.textContent?.length ?? 0
    if (consumed + len >= targetOffset) {
      return { node: textNode, offset: targetOffset - consumed }
    }
    consumed += len
  }
  return null
}

export function CommentHighlighter({
  containerRef,
  blockInfos,
  comments,
  activeId,
}: CommentHighlighterProps) {
  useEffect(() => {
    if (typeof CSS === 'undefined' || !('highlights' in CSS)) return

    const { highlights } = CSS as any as { highlights: Map<string, Highlight> }

    function updateHighlights() {
      const normalRanges: Range[] = []
      const activeRanges: Range[] = []

      const rangeComments = comments.filter((c) => c.anchor.mode === 'range')
      if (rangeComments.length === 0) {
        highlights.delete('comment-highlight')
        highlights.delete('comment-highlight-active')
        return
      }

      const container = containerRef.current
      if (!container) return
      const contentEl = getContentElement(container)
      if (!contentEl) return

      for (const comment of rangeComments) {
        const { anchor } = comment
        if (anchor.mode !== 'range') continue

        const blockIdx = blockInfos.findIndex(
          (b) => b.blockId === anchor.blockId,
        )
        if (blockIdx === -1 || blockIdx >= contentEl.children.length) continue

        const blockEl = contentEl.children[blockIdx]
        const start = findDomTextNode(blockEl, anchor.startOffset)
        const end = findDomTextNode(blockEl, anchor.endOffset)
        if (!start || !end) continue

        try {
          const range = new Range()
          range.setStart(start.node, start.offset)
          range.setEnd(end.node, end.offset)
          if (comment.id === activeId) {
            activeRanges.push(range)
          } else {
            normalRanges.push(range)
          }
        } catch {
          // offset out of bounds after layout change
        }
      }

      if (normalRanges.length > 0) {
        highlights.set('comment-highlight', new Highlight(...normalRanges))
      } else {
        highlights.delete('comment-highlight')
      }

      if (activeRanges.length > 0) {
        highlights.set(
          'comment-highlight-active',
          new Highlight(...activeRanges),
        )
      } else {
        highlights.delete('comment-highlight-active')
      }
    }

    updateHighlights()

    return () => {
      highlights.delete('comment-highlight')
      highlights.delete('comment-highlight-active')
    }
  }, [containerRef, blockInfos, comments, activeId])

  return null
}
