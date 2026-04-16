import {
  type CommentAnchor,
  getTextOffsetFromDOMPoint,
  type RangeAnchor,
} from '@haklex/rich-editor';
import { MessageSquarePlus } from 'lucide-react';
import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { BlockInfo } from '../../types/comments';

interface SelectionCommentPopupProps {
  blockInfos: BlockInfo[];
  containerRef: RefObject<HTMLDivElement | null>;
  onAdd: (text: string, anchor: CommentAnchor) => void;
}

function getContentElement(container: HTMLDivElement): Element | null {
  return container.querySelector('.rich-content');
}

function findBlockIndex(contentEl: Element, node: Node): number {
  const children = Array.from(contentEl.children);
  for (let i = 0; i < children.length; i++) {
    if (children[i].contains(node)) return i;
  }
  return -1;
}

function buildRangeAnchorFromSelection(
  sel: Selection,
  contentEl: Element,
  blockInfos: BlockInfo[],
): RangeAnchor | null {
  if (sel.rangeCount === 0 || sel.isCollapsed) return null;

  const { anchorNode, focusNode } = sel;
  if (!anchorNode || !focusNode) return null;

  const anchorIdx = findBlockIndex(contentEl, anchorNode);
  const focusIdx = findBlockIndex(contentEl, focusNode);
  if (anchorIdx < 0 || focusIdx < 0 || anchorIdx !== focusIdx) return null;

  const info = blockInfos[anchorIdx];
  if (!info) return null;

  const blockEl = contentEl.children[anchorIdx];
  let startOffset = getTextOffsetFromDOMPoint(blockEl, anchorNode, sel.anchorOffset);
  let endOffset = getTextOffsetFromDOMPoint(blockEl, focusNode, sel.focusOffset);
  if (startOffset > endOffset) {
    [startOffset, endOffset] = [endOffset, startOffset];
  }

  const { textContent } = info;
  const quote = textContent.slice(startOffset, endOffset);
  if (!quote) return null;

  return {
    mode: 'range',
    blockId: info.blockId,
    blockType: info.type,
    blockFingerprint: info.fingerprint,
    snapshotText: textContent.slice(0, 300),
    quote,
    prefix: textContent.slice(Math.max(0, startOffset - 50), startOffset),
    suffix: textContent.slice(endOffset, endOffset + 50),
    startOffset,
    endOffset,
  };
}

export function SelectionCommentPopup({
  containerRef,
  blockInfos,
  onAdd,
}: SelectionCommentPopupProps) {
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const capturedAnchorRef = useRef<RangeAnchor | null>(null);

  useEffect(() => {
    function onSelectionChange() {
      if (showInput) return;

      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setPosition(null);
        return;
      }

      const container = containerRef.current;
      if (!container) return;
      const contentEl = getContentElement(container);
      if (!contentEl) return;

      const { anchorNode } = sel;
      if (!anchorNode || !contentEl.contains(anchorNode)) {
        setPosition(null);
        return;
      }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0) {
        setPosition(null);
        return;
      }

      setPosition({
        top: rect.top - 40,
        left: rect.left + rect.width / 2,
      });
    }

    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [containerRef, showInput]);

  const handleClick = useCallback(() => {
    const sel = window.getSelection();
    const container = containerRef.current;
    if (!sel || !container) return;
    const contentEl = getContentElement(container);
    if (!contentEl) return;

    const anchor = buildRangeAnchorFromSelection(sel, contentEl, blockInfos);
    if (!anchor) return;

    capturedAnchorRef.current = anchor;
    setShowInput(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [containerRef, blockInfos]);

  const handleSubmit = useCallback(() => {
    const text = inputText.trim();
    if (!text || !capturedAnchorRef.current) return;

    onAdd(text, capturedAnchorRef.current);
    capturedAnchorRef.current = null;
    setInputText('');
    setShowInput(false);
    setPosition(null);
  }, [inputText, onAdd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        setShowInput(false);
        setInputText('');
      }
    },
    [handleSubmit],
  );

  const handleCancel = useCallback(() => {
    setShowInput(false);
    setInputText('');
    capturedAnchorRef.current = null;
  }, []);

  if (!position) return null;

  return createPortal(
    <div className="comment-selection-popup" style={{ top: position.top, left: position.left }}>
      {showInput ? (
        <div className="comment-inline-input">
          <input
            className="comment-input"
            placeholder="Add a comment..."
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn btn-sm btn-active" onClick={handleSubmit}>
            Add
          </button>
          <button className="btn btn-sm" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      ) : (
        <button
          className="comment-add-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            handleClick();
          }}
        >
          <MessageSquarePlus size={14} />
          Comment
        </button>
      )}
    </div>,
    document.body,
  );
}
