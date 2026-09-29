import 'react-image-crop/dist/ReactCrop.css';

import { ImageOff } from 'lucide-react';
import type { FC, SyntheticEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Crop, PixelCrop } from 'react-image-crop';
import { ReactCrop } from 'react-image-crop';

import { isAnnotationTool, STROKE_TOOLS, STROKE_WIDTHS, SWATCH_COLORS } from './annotation';
import type { AnnotationApi } from './AnnotationSurface';
import { AnnotationSurface } from './AnnotationSurface';
import { displayedToNatural } from './crop';
import { buildEditSummary } from './edit-summary';
import type { MosaicMode } from './mosaic';
import { clampMosaicStrength, MOSAIC_DEFAULT_STRENGTH } from './mosaic';
import { MosaicOptionsBar } from './MosaicOptionsBar';
import { OutputSizeControl, useOutputSize } from './OutputSizeControl';
import { exportResult } from './pipeline';
import { scaleToLongEdge } from './resize';
import * as css from './styles.css';
import { ToolOptionsBar } from './ToolOptionsBar';
import { ToolRail } from './ToolRail';
import { useEscapeDismissesTopDialog } from './useEscapeDismissesTopDialog';
import type { EditorTool } from './useImageEditorState';
import { useImageEditorState } from './useImageEditorState';

export interface ImageEditResult {
  file: File;
  summary: string;
}

export interface ImageEditModalProps {
  file: File;
  onCancel: () => void;
  onConfirm: (result: ImageEditResult) => void;
}

export const ImageEditModal: FC<ImageEditModalProps> = ({ file, onCancel, onConfirm }) => {
  const [objectUrl, setObjectUrl] = useState('');
  const [decodeError, setDecodeError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [strokeColor, setStrokeColor] = useState<string>(SWATCH_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState<number>(STROKE_WIDTHS[1]);
  const [history, setHistory] = useState({ canRedo: false, canUndo: false });
  const [mosaicMode, setMosaicMode] = useState<MosaicMode>('pixelate');
  const [mosaicStrength, setMosaicStrength] = useState(MOSAIC_DEFAULT_STRENGTH.pixelate);
  const [mosaicCrop, setMosaicCrop] = useState<Crop>();
  const [originalSize, setOriginalSize] = useState<{ height: number; width: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const counterRef = useRef(1);
  const annotationApiRef = useRef<AnnotationApi | null>(null);
  const editor = useImageEditorState(objectUrl);
  useEscapeDismissesTopDialog();
  const { hasPendingCrop, markerStateRef, sourceUrl } = editor;

  // Created in the effect so a StrictMode probe remount mints a fresh URL
  // after the probe cleanup revokes the previous one.
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pendingCropRect =
    editor.activeTool === 'crop' && hasPendingCrop ? editor.croppedAreaPixels : null;
  const outputBase = pendingCropRect ?? editor.naturalSize;
  const { controlProps: outputSizeProps, maxLongEdge } = useOutputSize(outputBase);

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalHeight, naturalWidth } = event.currentTarget;
    editor.setNaturalSize({ height: naturalHeight, width: naturalWidth });
    setOriginalSize((size) => size ?? { height: naturalHeight, width: naturalWidth });
  };

  const toNatural = (pixelCrop: PixelCrop) => {
    const img = imgRef.current;
    if (!img || img.width === 0 || img.height === 0) return null;
    return {
      rect: displayedToNatural(
        pixelCrop,
        img.naturalWidth / img.width,
        img.naturalHeight / img.height,
      ),
      scale: img.naturalWidth / img.width,
    };
  };

  const handleCropComplete = (pixelCrop: PixelCrop) => {
    const natural = toNatural(pixelCrop);
    if (natural) editor.setCroppedAreaPixels(natural.rect);
  };

  const handleMosaicComplete = (pixelCrop: PixelCrop) => {
    const natural = toNatural(pixelCrop);
    setMosaicCrop(undefined);
    if (!natural || pixelCrop.width < 2 || pixelCrop.height < 2) return;
    void editor
      .applyMosaicArea(natural.rect, mosaicMode, mosaicStrength * natural.scale)
      .then(() => setErrorMessage(null))
      .catch((error: unknown) => {
        console.error('[ImageEditModal] mosaic failed', error);
        setErrorMessage('Could not apply mosaic to this area');
      });
  };

  const handleMosaicModeChange = (mode: MosaicMode) => {
    setMosaicMode(mode);
    setMosaicStrength(clampMosaicStrength(mode, mosaicStrength));
  };

  const handleToolClick = (tool: EditorTool) => {
    if (tool === editor.activeTool) return;
    if (editor.activeTool === 'crop' && hasPendingCrop) {
      void editor.confirmCropAndSwitch(tool);
      return;
    }
    editor.setActiveTool(tool);
  };

  const buildSummary = (output: File) => {
    if (output === file) return '';
    const size = pendingCropRect ?? editor.naturalSize;
    return buildEditSummary({
      cropped:
        pendingCropRect !== null ||
        (originalSize !== null &&
          size !== null &&
          (size.width !== originalSize.width || size.height !== originalSize.height)),
      marks: markerStateRef.current?.markers.length ?? 0,
      mosaics: editor.mosaicCount,
      resizedTo: maxLongEdge !== null && size ? scaleToLongEdge(size, maxLongEdge) : null,
    });
  };

  const handleConfirm = async () => {
    setExporting(true);
    setErrorMessage(null);
    try {
      const output = await exportResult({
        hasRebasedBitmap: editor.rebasedBitmapUrl !== null,
        markerState: markerStateRef.current,
        maxLongEdge,
        original: file,
        pendingCropRect,
        sourceUrl,
      });
      onConfirm({ file: output, summary: buildSummary(output) });
    } catch (error: unknown) {
      console.error('[ImageEditModal] export failed', error);
      setErrorMessage('Could not export the edited image. Try again or discard edits.');
      setExporting(false);
    }
  };

  const renderOptions = () => {
    if (decodeError) return null;
    if (editor.activeTool === 'crop') {
      return (
        <button
          className={css.topBarGhostButton}
          disabled={!hasPendingCrop}
          type="button"
          onClick={editor.resetCrop}
        >
          Reset crop
        </button>
      );
    }
    if (editor.activeTool === 'mosaic') {
      return (
        <MosaicOptionsBar
          canUndo={editor.mosaicCount > 0 && !editor.mosaicBusy}
          mode={mosaicMode}
          strength={mosaicStrength}
          onModeChange={handleMosaicModeChange}
          onStrengthChange={(value) => setMosaicStrength(clampMosaicStrength(mosaicMode, value))}
          onUndo={editor.undoMosaic}
        />
      );
    }
    return (
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
    );
  };

  const renderCanvas = () => {
    if (decodeError) {
      return (
        <div className={css.errorState}>
          <ImageOff size={24} />
          <span>This image could not be displayed for editing.</span>
        </div>
      );
    }
    if (!sourceUrl) return null;
    if (isAnnotationTool(editor.activeTool)) {
      return (
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
      );
    }
    const isMosaic = editor.activeTool === 'mosaic';
    return (
      <ReactCrop
        className={css.cropSurface}
        crop={isMosaic ? mosaicCrop : editor.crop}
        disabled={isMosaic && editor.mosaicBusy}
        keepSelection={!isMosaic}
        onComplete={isMosaic ? handleMosaicComplete : handleCropComplete}
        onChange={(_, percentCrop) =>
          isMosaic ? setMosaicCrop(percentCrop) : editor.setCrop(percentCrop)
        }
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
    );
  };

  return (
    <div className={css.root}>
      <div className={css.topBar}>
        <span className={css.topBarTitle}>Edit image</span>
        <div className={css.topBarControls}>{renderOptions()}</div>
      </div>
      <div className={css.body}>
        <ToolRail
          activeTool={editor.activeTool}
          disabled={decodeError}
          onSelect={handleToolClick}
        />
        <div className={css.canvasArea}>
          {renderCanvas()}
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
        <OutputSizeControl {...outputSizeProps} />
        <div className={css.footerSpacer}>
          {errorMessage && (
            <span className={css.footerError} role="alert">
              {errorMessage}
            </span>
          )}
        </div>
        <button className={css.secondaryButton} type="button" onClick={onCancel}>
          Discard edits
        </button>
        <button
          className={css.primaryButton}
          disabled={decodeError || exporting || editor.mosaicBusy}
          type="button"
          onClick={handleConfirm}
        >
          Done
        </button>
      </div>
    </div>
  );
};
