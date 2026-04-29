import type { CommentAnchor } from '@haklex/rich-editor';
import { MentionPlatformProvider, ShiroRenderer } from '@haklex/rich-kit-shiro';
import type { SerializedEditorState } from 'lexical';
import { nanoid } from 'nanoid';
import { use, useCallback, useMemo, useRef, useState } from 'react';

import { BlockCommentGutter } from '../components/comments/BlockCommentGutter';
import { CommentHighlighter } from '../components/comments/CommentHighlightPlugin';
import { CommentSidebar } from '../components/comments/CommentSidebar';
import { SelectionCommentPopup } from '../components/comments/SelectionCommentPopup';
import { VariantPicker } from '../components/VariantPicker';
import { useTheme } from '../context/ThemeContext';
import { VariantContext } from '../context/VariantContext';
import { initialContent } from '../fixtures/initial-content';
import type { BlockInfo, Comment } from '../types/comments';

function extractTextContent(node: any): string {
  if (node.text) return node.text as string;
  if (node.children) {
    return (node.children as any[]).map(extractTextContent).join('');
  }
  return '';
}

function computeFingerprint(text: string): string {
  const input = text.slice(0, 200) + String(text.length);
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + (input.codePointAt(i) ?? 0)) | 0;
  }
  return (hash >>> 0).toString(16);
}

function extractBlockInfos(state: SerializedEditorState): BlockInfo[] {
  return (state.root.children as any[]).map((child, index) => {
    const textContent = extractTextContent(child);
    return {
      index,
      blockId: (child as any).__state?.blockId || nanoid(8),
      type: child.type,
      textContent,
      fingerprint: computeFingerprint(textContent),
    };
  });
}

export function CommentsPage() {
  const variant = use(VariantContext);
  const theme = useTheme();
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const blockInfos = useMemo(() => extractBlockInfos(initialContent), []);

  const handleAddComment = useCallback((text: string, anchor: CommentAnchor) => {
    const comment: Comment = {
      id: crypto.randomUUID(),
      text,
      anchor,
      createdAt: Date.now(),
    };
    setComments((prev) => [...prev, comment]);
  }, []);

  const handleDeleteComment = useCallback((id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    setActiveCommentId((prev) => (prev === id ? null : prev));
  }, []);

  return (
    <MentionPlatformProvider platforms={{}}>
      <div className="toolbar" style={{ marginBlockEnd: 12 }}>
        <VariantPicker />
        <div className="toolbar-group">
          <span className="toolbar-label">Info</span>
          <span className="badge">{comments.length} comments</span>
        </div>
      </div>

      <div className="comments-layout">
        <div className="comments-editor" ref={containerRef}>
          <ShiroRenderer theme={theme} value={initialContent} variant={variant} />
          <SelectionCommentPopup
            blockInfos={blockInfos}
            containerRef={containerRef}
            onAdd={handleAddComment}
          />
          <BlockCommentGutter
            blockInfos={blockInfos}
            comments={comments}
            containerRef={containerRef}
            onAdd={handleAddComment}
          />
          <CommentHighlighter
            activeId={activeCommentId}
            blockInfos={blockInfos}
            comments={comments}
            containerRef={containerRef}
          />
        </div>

        <div className="comments-sidebar">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-left">
                <h3 className="panel-title">Comments</h3>
                {comments.length > 0 && <span className="badge">{comments.length}</span>}
              </div>
            </div>
            <div className="panel-body">
              <CommentSidebar
                activeId={activeCommentId}
                comments={comments}
                onDelete={handleDeleteComment}
                onHover={setActiveCommentId}
              />
            </div>
          </div>
        </div>
      </div>
    </MentionPlatformProvider>
  );
}
