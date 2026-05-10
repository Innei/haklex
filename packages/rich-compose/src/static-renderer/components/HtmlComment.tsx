import { useEffect, useRef } from 'react';

interface HtmlCommentProps {
  text: string;
}

export function HtmlComment({ text }: HtmlCommentProps) {
  const anchorRef = useRef<HTMLTemplateElement | null>(null);
  const commentRef = useRef<Comment | null>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const parent = anchor.parentNode;
    if (!parent) return;

    let comment = commentRef.current;
    if (!comment || comment.parentNode !== parent) {
      comment = document.createComment(text);
      parent.insertBefore(comment, anchor);
      commentRef.current = comment;
    } else if (comment.data !== text) {
      comment.data = text;
    }

    return () => {
      if (commentRef.current?.parentNode) {
        commentRef.current.parentNode.removeChild(commentRef.current);
      }
      commentRef.current = null;
    };
  }, [text]);

  return <template suppressHydrationWarning data-rich-comment-anchor="" ref={anchorRef} />;
}
