import type { VideoRendererProps } from '@haklex/rich-editor/renderers';
import { useRendererMode } from '@haklex/rich-editor/static';
import {
  ActionBar,
  ActionButton,
  Popover,
  PopoverPanel,
  PopoverTrigger,
} from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNearestNodeFromDOMNode, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { ExternalLink, ImageIcon, Trash2, Video } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getEditorHistoryShortcut } from './history-shortcuts';
import * as styles from './styles.css';
import { VideoRenderer } from './VideoRenderer';

const UNSAFE_VIDEO_URL_RE = /^(?:javascript\s*:|vbscript\s*:|data\s*:(?!video\/))/i;

export function VideoEditRenderer(props: VideoRendererProps) {
  const mode = useRendererMode();

  if (mode !== 'editor') {
    return <VideoRenderer {...props} />;
  }

  return <VideoEditRendererInner {...props} />;
}

function VideoEditRendererInner({ src, poster, width, height }: VideoRendererProps) {
  const [editor] = useLexicalComposerContext();
  const editable = editor.isEditable();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const srcInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(!src);
  const [editSrc, setEditSrc] = useState(src);
  const [editPoster, setEditPoster] = useState(poster || '');

  useEffect(() => {
    setEditSrc(src);
    setEditPoster(poster || '');
  }, [src, poster]);

  useEffect(() => {
    if (!src) setOpen(true);
  }, [src]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => srcInputRef.current?.focus());
    }
  }, [open]);

  const commitChanges = useCallback(() => {
    const trimmedSrc = editSrc.trim();
    if (!trimmedSrc) return;
    if (UNSAFE_VIDEO_URL_RE.test(trimmedSrc)) return;
    if (!wrapperRef.current) return;

    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(wrapperRef.current!);
      if (!node) return;
      const writable = node.getWritable() as unknown as Record<string, unknown>;
      writable.__src = trimmedSrc;
      writable.__poster = editPoster.trim() || undefined;
    });
    setOpen(false);
  }, [editor, editSrc, editPoster]);

  const handleDelete = useCallback(() => {
    if (!wrapperRef.current) return;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(wrapperRef.current!);
      if (node) node.remove();
    });
    setOpen(false);
  }, [editor]);

  const handleOpen = useCallback(() => {
    if (src) window.open(src, '_blank', 'noopener,noreferrer');
  }, [src]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitChanges();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditSrc(src);
        setEditPoster(poster || '');
        setOpen(false);
      }
    },
    [commitChanges, src, poster],
  );

  const handlePanelKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const shortcut = getEditorHistoryShortcut(e, {
        isDirty: editSrc !== src || editPoster !== (poster || ''),
      });
      if (!shortcut) return;

      e.preventDefault();
      e.stopPropagation();
      editor.dispatchCommand(shortcut === 'undo' ? UNDO_COMMAND : REDO_COMMAND, undefined);
    },
    [editPoster, editSrc, editor, poster, src],
  );

  if (!editable) {
    return <VideoRenderer height={height} poster={poster} src={src} width={width} />;
  }

  const aspectRatio =
    width && height && width > 0 && height > 0 ? `${width} / ${height}` : '16 / 9';

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setEditSrc(src);
          setEditPoster(poster || '');
        }
      }}
    >
      <PopoverTrigger
        nativeButton={false}
        render={
          <div
            className={`${styles.editTrigger} ${styles.semanticClassNames.editTrigger}`}
            ref={wrapperRef}
          />
        }
      >
        {src ? (
          <figure className={`${styles.root} ${styles.semanticClassNames.root}`}>
            <div
              className={`${styles.editPreview} ${styles.semanticClassNames.editPreview}`}
              style={{
                aspectRatio,
                backgroundImage: poster ? `url(${poster})` : undefined,
              }}
            >
              <video
                className={`${styles.editVideo} ${styles.semanticClassNames.editVideo}`}
                poster={poster}
                preload="metadata"
                src={src}
              />
              <span className={`${styles.editOverlay} ${styles.semanticClassNames.editOverlay}`}>
                <Video size={32} />
              </span>
            </div>
          </figure>
        ) : (
          <div className={`${styles.editPlaceholder} ${styles.semanticClassNames.editPlaceholder}`}>
            <Video size={24} />
            <span>Click to add video</span>
          </div>
        )}
      </PopoverTrigger>
      <PopoverPanel
        className={`${styles.editPanel} ${styles.semanticClassNames.editPanel}`}
        side="bottom"
        sideOffset={8}
        onKeyDown={handlePanelKeyDown}
      >
        <div className={`${styles.editField} ${styles.semanticClassNames.editField}`}>
          <Video
            className={`${styles.editFieldIcon} ${styles.semanticClassNames.editFieldIcon}`}
            size={14}
          />
          <input
            className={`${styles.editInput} ${styles.semanticClassNames.editInput}`}
            placeholder="Video URL"
            ref={srcInputRef}
            type="url"
            value={editSrc}
            onChange={(e) => setEditSrc(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className={`${styles.editField} ${styles.semanticClassNames.editField}`}>
          <ImageIcon
            className={`${styles.editFieldIcon} ${styles.semanticClassNames.editFieldIcon}`}
            size={14}
          />
          <input
            className={`${styles.editInput} ${styles.semanticClassNames.editInput}`}
            placeholder="Poster URL (optional)"
            type="url"
            value={editPoster}
            onBlur={commitChanges}
            onChange={(e) => setEditPoster(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <ActionBar>
          <ActionButton onClick={handleOpen}>
            <ExternalLink size={14} />
            Open
          </ActionButton>
          <ActionButton danger onClick={handleDelete}>
            <Trash2 size={14} />
            Remove
          </ActionButton>
        </ActionBar>
      </PopoverPanel>
    </Popover>
  );
}
