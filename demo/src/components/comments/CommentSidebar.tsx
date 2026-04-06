import { Trash2 } from 'lucide-react';

import type { Comment } from '../../types/comments';

interface CommentSidebarProps {
  activeId: string | null;
  comments: Comment[];
  onDelete: (id: string) => void;
  onHover: (id: string | null) => void;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function CommentSidebar({ comments, activeId, onHover, onDelete }: CommentSidebarProps) {
  if (comments.length === 0) {
    return (
      <div className="comment-sidebar-empty">
        <p>No comments yet</p>
        <p className="comment-sidebar-hint">Select text or hover a paragraph to add comments</p>
      </div>
    );
  }

  return (
    <div className="comment-sidebar-list">
      {comments.map((comment) => (
        <div
          className={`comment-card ${comment.id === activeId ? 'comment-card-active' : ''}`}
          key={comment.id}
          onMouseEnter={() => onHover(comment.id)}
          onMouseLeave={() => onHover(null)}
        >
          <div className="comment-card-header">
            <span
              className={`comment-badge ${comment.anchor.mode === 'range' ? 'comment-badge-range' : 'comment-badge-block'}`}
            >
              {comment.anchor.mode === 'range' ? 'Range' : 'Block'}
            </span>
            <span className="comment-card-time">{formatRelativeTime(comment.createdAt)}</span>
            <button
              className="comment-delete-btn"
              title="Delete comment"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 size={12} />
            </button>
          </div>
          {comment.anchor.mode === 'range' && (
            <div className="comment-quote">&ldquo;{comment.anchor.quote}&rdquo;</div>
          )}
          <div className="comment-card-text">{comment.text}</div>
        </div>
      ))}
    </div>
  );
}
