import 'react-image-crop/dist/ReactCrop.css';

import {
  Circle,
  Crop,
  Hash,
  ImageOff,
  MoveUpRight,
  PaintBucket,
  Pen,
  Square,
  Type,
} from 'lucide-react';
import type { FC, SyntheticEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { PixelCrop } from 'react-image-crop';
import { ReactCrop } from 'react-image-crop';

import { isAnnotationTool, STROKE_TOOLS, STROKE_WIDTHS, SWATCH_COLORS } from './annotation';
import type { AnnotationApi } from './AnnotationSurface';
import { AnnotationSurface } from './AnnotationSurface';
import { displayedToNatural } from './crop';
import { exportResult } from './pipeline';
import * as css from './styles.css';
import { ToolOptionsBar } from './ToolOptionsBar';
import type { EditorTool } from './useImageEditorState';
import { useImageEditorState } from './useImageEditorState';

const TOOLS: { icon: FC<{ size?: number }>; id: EditorTool; label: string }[] = [
  { icon: Crop, id: 'crop', label: 'Crop' },
  { icon: MoveUpRight, id: 'arrow', label: 'Arrow' },
  { icon: Pen, id: 'pen', label: 'Pen' },
  { icon: Square, id: 'rect', label: 'Rectangle' },
  { icon: Circle, id: 'ellipse', label: 'Ellipse' },
  { icon: Type, id: 'text', label: 'Text' },
  { icon: Hash, id: 'counter', label: 'Counter' },
  { icon: PaintBucket, id: 'cover', label: 'Cover' },
];

export interface ImageEditModalProps {
  file: File;
  onCancel: () => void;
  onConfirm: (file: File) => void;
  onSkip: () => void;
}

export const ImageEditModal: FC<ImageEditModalProps> = ({ file, onCancel, onConfirm, onSkip }) => {
  const [objectUrl, setObjectUrl] = useState('');
  const [decodeError, setDecodeError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [strokeColor, setStrokeColor] = useState<string>(SWATCH_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState<number>(STROKE_WIDTHS[1]);
  const [history, setHistory] = useState({ canRedo: false, canUndo: false });
  const imgRef = useRef<HTMLImageElement>(null);
  const counterRef = useRef(1);
  const annotationApiRef = useRef<AnnotationApi | null>(null);
  const editor = useImageEditorState(objectUrl);
  const { hasPendingCrop, markerStateRef, sourceUrl } = editor;

  // Created in the effect so a StrictMode probe remount mints a fresh URL
  // after the probe cleanup revokes the previous one.
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalHeight, naturalWidth } = event.currentTarget;
    editor.setNaturalSize({ height: naturalHeight, width: naturalWidth });
  };

  const handleCropComplete = (pixelCrop: PixelCrop) => {
    const img = imgRef.current;
    if (!img || img.width === 0 || img.height === 0) return;
    editor.setCroppedAreaPixels(
      displayedToNatural(pixelCrop, img.naturalWidth / img.width, img.naturalHeight / img.height),
    );
  };

  const handleToolClick = (tool: EditorTool) => {
    if (tool === editor.activeTool) return;
    if (editor.activeTool === 'crop' && hasPendingCrop) {
      void editor.confirmCropAndSwitch(tool);
      return;
    }
    editor.setActiveTool(tool);
  };

  const handleConfirm = async () => {
    setExporting(true);
    try {
      const pendingCropRect =
        editor.activeTool === 'crop' && hasPendingCrop ? editor.croppedAreaPixels : null;
      onConfirm(
        await exportResult({
          hasRebasedBitmap: editor.rebasedBitmapUrl !== null,
          markerState: markerStateRef.current,
          original: file,
          pendingCropRect,
          sourceUrl,
        }),
      );
    } catch {
      // Export failure must not lose the user's upload intent (see spec).
      onSkip();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={css.root}>
      <div className={css.topBar}>
        <span className={css.topBarTitle}>Edit image</span>
        <div className={css.topBarControls}>
          {!decodeError &&
            (editor.activeTool === 'crop' ? (
              <button
                className={css.topBarGhostButton}
                disabled={!hasPendingCrop}
                type="button"
                onClick={editor.resetCrop}
              >
                Reset crop
              </button>
            ) : (
              <ToolOptionsBar
                canRedo={history.canRedo}
                canUndo={history.canUndo}
                showStrokeWidth={STROKE_TOOLS.has(editor.activeTool)}
                strokeColor={strokeColor}
                strokeWidth={strokeWidth}
                onRedo={() => annotationApiRef.current?.redo()}
                onStrokeColorChange={setStrokeColor}
                onStrokeWidthChange={setStrokeWidth}
                onUndo={() => annotationApiRef.current?.undo()}
              />
            ))}
        </div>
      </div>
      <div className={css.body}>
        <div className={css.toolRail}>
          {TOOLS.map((tool, index) => (
            <span className={css.toolGroup} key={tool.id}>
              <button
                aria-label={tool.label}
                aria-pressed={editor.activeTool === tool.id}
                disabled={decodeError}
                title={tool.label}
                type="button"
                className={
                  editor.activeTool === tool.id
                    ? `${css.toolButton} ${css.toolButtonActive}`
                    : css.toolButton
                }
                onClick={() => handleToolClick(tool.id)}
              >
                <tool.icon size={18} />
              </button>
              {index === 0 && <div className={css.toolDivider} />}
            </span>
          ))}
        </div>
        <div className={css.canvasArea}>
          {decodeError ? (
            <div className={css.errorState}>
              <ImageOff size={24} />
              <span>This image could not be displayed for editing.</span>
            </div>
          ) : (
            sourceUrl &&
            (isAnnotationTool(editor.activeTool) ? (
              <AnnotationSurface
                apiRef={annotationApiRef}
                counterRef={counterRef}
                sourceUrl={sourceUrl}
                stateRef={markerStateRef}
                strokeColor={strokeColor}
                strokeWidth={strokeWidth}
                tool={editor.activeTool}
                onDecodeError={() => setDecodeError(true)}
                onHistoryChange={(canUndo, canRedo) => setHistory({ canRedo, canUndo })}
              />
            ) : (
              <ReactCrop
                keepSelection
                className={css.cropSurface}
                crop={editor.crop}
                onChange={(_, percentCrop) => editor.setCrop(percentCrop)}
                onComplete={handleCropComplete}
              >
                <img
                  alt={file.name}
                  className={css.cropImage}
                  ref={imgRef}
                  src={sourceUrl}
                  onError={() => setDecodeError(true)}
                  onLoad={handleImageLoad}
                />
              </ReactCrop>
            ))
          )}
          {/* Always rendered: marker.js Linkware license requires visible attribution. */}
          <a
            className={css.attribution}
            href="https://markerjs.com"
            rel="noreferrer"
            target="_blank"
          >
            marker.js
          </a>
        </div>
      </div>
      <div className={css.footer}>
        <button className={css.ghostButton} type="button" onClick={onSkip}>
          Upload without editing
        </button>
        <div className={css.footerSpacer} />
        <button className={css.secondaryButton} type="button" onClick={onCancel}>
          Cancel
        </button>
        <button
          className={css.primaryButton}
          disabled={decodeError || exporting}
          type="button"
          onClick={handleConfirm}
        >
          Upload
        </button>
      </div>
    </div>
  );
};
