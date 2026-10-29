import { useVideoUpload } from '@haklex/rich-editor/plugins';
import type { VideoRendererProps } from '@haklex/rich-editor/renderers';
import { useRendererMode } from '@haklex/rich-editor/static';
import {
  ActionButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Field,
  Kbd,
  Popover,
  PopoverBody,
  PopoverFooter,
  PopoverHeader,
  PopoverPanel,
  PopoverTrigger,
  TextInput,
  toast,
  updateToast,
  useLiveEdit,
} from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNearestNodeFromDOMNode, HISTORY_MERGE_TAG, UNDO_COMMAND } from 'lexical';
import { Ellipsis, ExternalLink, Trash2, Upload, Video } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import * as styles from './styles.css';
import { VideoRenderer } from './VideoRenderer';

const UNSAFE_VIDEO_URL_RE = /^(?:javascript\s*:|vbscript\s*:|data\s*:(?!video\/))/i;
const UNSAFE_POSTER_URL_RE = /^(?:javascript\s*:|vbscript\s*:|data\s*:(?!image\/))/i;

interface VideoMeta {
  poster: string;
  src: string;
}

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
  const id = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const srcInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoUpload = useVideoUpload();

  const [open, setOpen] = useState(!src);
  const [editSrc, setEditSrc] = useState(src);
  const [editPoster, setEditPoster] = useState(poster || '');
  const [uploading, setUploading] = useState(false);

  const values = useMemo<VideoMeta>(() => ({ src, poster: poster || '' }), [src, poster]);

  const writeNode = useCallback(
    (patch: Partial<VideoMeta>, merge: boolean) => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      editor.update(
        () => {
          const node = $getNearestNodeFromDOMNode(wrapper);
          if (!node) return;
          const writable = node.getWritable() as unknown as Record<string, unknown>;
          if (patch.src !== undefined) writable.__src = patch.src;
          if (patch.poster !== undefined) writable.__poster = patch.poster || undefined;
        },
        merge ? { tag: HISTORY_MERGE_TAG } : undefined,
      );
    },
    [editor],
  );

  const { apply, revert } = useLiveEdit(values, open, writeNode);

  useEffect(() => {
    if (!open) return;
    setEditSrc(src);
    setEditPoster(poster || '');
  }, [open]);

  useEffect(() => {
    if (!src) setOpen(true);
  }, [src]);

  const handleDelete = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    editor.update(() => {
      $getNearestNodeFromDOMNode(wrapper)?.remove();
    });
    setOpen(false);
    toast({
      title: 'Video deleted',
      action: {
        label: 'Undo',
        onClick: () => editor.dispatchCommand(UNDO_COMMAND, undefined),
      },
    });
  }, [editor]);

  const handleOpen = useCallback(() => {
    if (src) window.open(src, '_blank', 'noopener,noreferrer');
  }, [src]);

  const handleUploadFile = useCallback(
    async (file: File | null) => {
      if (!file || !videoUpload) return;
      if (!file.type.startsWith('video/')) return;

      setUploading(true);
      const toastId = toast({ title: `Uploading ${file.name}…`, tone: 'loading' });

      try {
        const result = await videoUpload(file, {
          onProgress: (percent) =>
            updateToast(toastId, { title: `Uploading ${file.name} · ${Math.round(percent)}%` }),
        });
        setEditSrc(result.src);
        apply({ src: result.src });
        updateToast(toastId, { title: 'Video uploaded', tone: 'success', duration: 2400 });
      } catch (err: unknown) {
        console.error('[VideoEditRenderer]', err);
        updateToast(toastId, {
          title: 'Upload failed',
          tone: 'error',
          duration: 4000,
          action: { label: 'Retry', onClick: () => void handleUploadFile(file) },
        });
      } finally {
        setUploading(false);
      }
    },
    [apply, videoUpload],
  );

  if (!editable) {
    return <VideoRenderer height={height} poster={poster} src={src} width={width} />;
  }

  const aspectRatio =
    width && height && width > 0 && height > 0 ? `${width} / ${height}` : '16 / 9';
  const srcInvalid = editSrc.trim() !== '' && UNSAFE_VIDEO_URL_RE.test(editSrc.trim());
  const posterInvalid = editPoster.trim() !== '' && UNSAFE_POSTER_URL_RE.test(editPoster.trim());

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger render={<ActionButton icon aria-label="More actions" size="md" />}>
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={!src} onClick={handleOpen}>
          <ExternalLink />
          Open original
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen, details) => {
        if (!nextOpen && details?.reason === 'escape-key') revert();
        setOpen(nextOpen);
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
        flush
        className={`${styles.editPanel} ${styles.semanticClassNames.editPanel}`}
        initialFocus={srcInputRef}
        side="bottom"
        size="md"
      >
        <PopoverHeader actions={menu} icon={<Video />} title="Video" />
        <PopoverBody>
          <Field
            error={srcInvalid ? 'Enter a video URL' : undefined}
            id={`${id}-src`}
            label="Source"
          >
            <div className={styles.fieldRow}>
              <TextInput
                id={`${id}-src`}
                invalid={srcInvalid}
                placeholder="https://"
                ref={srcInputRef}
                type="url"
                value={editSrc}
                onChange={(e) => {
                  setEditSrc(e.target.value);
                  const next = e.target.value.trim();
                  if (next && !UNSAFE_VIDEO_URL_RE.test(next)) apply({ src: next });
                }}
              />
              {videoUpload && (
                <>
                  <input
                    accept="video/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    type="file"
                    onChange={(e) => {
                      void handleUploadFile(e.currentTarget.files?.[0] ?? null);
                      e.currentTarget.value = '';
                    }}
                  />
                  <ActionButton
                    disabled={uploading}
                    size="md"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload />
                    Upload
                  </ActionButton>
                </>
              )}
            </div>
          </Field>
          <Field
            error={posterInvalid ? 'Enter an image URL' : undefined}
            hint="Optional · image URL"
            id={`${id}-poster`}
            label="Poster"
          >
            <TextInput
              id={`${id}-poster`}
              invalid={posterInvalid}
              type="url"
              value={editPoster}
              onChange={(e) => {
                setEditPoster(e.target.value);
                const next = e.target.value.trim();
                if (!UNSAFE_POSTER_URL_RE.test(next)) apply({ poster: next });
              }}
            />
          </Field>
        </PopoverBody>
        <PopoverFooter hint="Changes apply as you type">
          <Kbd keys="Esc" size="sm" tone="muted" />
          <span className={styles.footerNote}>revert</span>
        </PopoverFooter>
      </PopoverPanel>
    </Popover>
  );
}
