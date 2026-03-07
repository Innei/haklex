import type { BlockAnchor, CommentAnchor } from '@haklex/rich-editor';
import { MessageSquare, Plus } from 'lucide-react';
import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { BlockInfo, Comment } from '../../pages/CommentsPage';

interface BlockCommentGutterProps {
  blockInfos: BlockInfo[];
  comments: Comment[];
  containerRef: RefObject<HTMLDivElement | null>;
  onAdd: (text: string, anchor: CommentAnchor) => void;
}

function getContentElement(container: HTMLDivElement): Element | null {
  return container.querySelector('.rich-content');
}

function findBlockAtPoint(contentEl: Element, y: number): { index: number; rect: DOMRect } | null {
  const { children } = contentEl;
  for (let i = 0; i < children.length; i++) {
    const rect = children[i].getBoundingClientRect();
    if (y >= rect.top && y <= rect.bottom) {
      return { index: i, rect };
    }
  }
  return null;
}

export function BlockCommentGutter({
  containerRef,
  blockInfos,
  comments,
  onAdd,
}: BlockCommentGutterProps) {
  const [hoveredBlock, setHoveredBlock] = useState<{
    index: number;
    top: number;
    right: number;
  } | null>(null);
  const [inputForIdx, setInputForIdx] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onMouseMove(e: MouseEvent) {
      if (inputForIdx != null) return;

      const contentEl = getContentElement(container!);
      if (!contentEl) return;

      const hit = findBlockAtPoint(contentEl, e.clientY);
      if (!hit) {
        setHoveredBlock(null);
        return;
      }

      const containerRect = container!.getBoundingClientRect();
      setHoveredBlock({
        index: hit.index,
        top: hit.rect.top - containerRect.top,
        right: containerRect.right - hit.rect.right,
      });
    }

    function onMouseLeave(e: MouseEvent) {
      if (inputForIdx != null) return;
      const related = e.relatedTarget as Node | null;
      if (related && btnRef.current?.contains(related)) return;
      setHoveredBlock(null);
    }

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    return () => {
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [containerRef, inputForIdx]);

  const commentCounts = useCallback(
    (blockId: string) => comments.filter((c) => c.anchor.blockId === blockId).length,
    [comments],
  );

  const handleAddClick = useCallback((idx: number) => {
    setInputForIdx(idx);
    setInputText('');
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const handleSubmit = useCallback(() => {
    if (inputForIdx == null || !inputText.trim()) return;

    const info = blockInfos[inputForIdx];
    if (!info) return;

    const anchor: BlockAnchor = {
      mode: 'block',
      blockId: info.blockId,
      blockType: info.type,
      blockFingerprint: info.fingerprint,
      snapshotText: info.textContent.slice(0, 300),
    };

    onAdd(inputText.trim(), anchor);
    setInputForIdx(null);
    setInputText('');
    setHoveredBlock(null);
  }, [blockInfos, inputForIdx, inputText, onAdd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        setInputForIdx(null);
        setInputText('');
      }
    },
    [handleSubmit],
  );

  const activeIdx = inputForIdx ?? hoveredBlock?.index ?? null;
  if (activeIdx == null) return null;

  const info = blockInfos[activeIdx];
  if (!info) return null;

  const count = commentCounts(info.blockId);
  const top = hoveredBlock?.top ?? 0;

  return (
    <div
      className="comment-block-btn-wrap"
      ref={btnRef}
      style={{ top }}
      onMouseLeave={() => {
        if (inputForIdx == null) setHoveredBlock(null);
      }}
    >
      {count > 0 && (
        <span className="comment-gutter-count">
          <MessageSquare size={12} />
          {count}
        </span>
      )}
      {inputForIdx === activeIdx ? (
        <div className="comment-gutter-input">
          <input
            className="comment-input comment-input-sm"
            placeholder="Comment..."
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!inputText.trim()) {
                setInputForIdx(null);
              }
            }}
          />
          <button className="btn btn-sm btn-active" onClick={handleSubmit}>
            Add
          </button>
        </div>
      ) : (
        <button
          className="comment-gutter-btn"
          title="Add comment to this block"
          onClick={() => handleAddClick(activeIdx)}
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}
