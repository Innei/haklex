import { chromeRadius, chromeText, chromeTypography, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, keyframes, style, styleVariants } from '@vanilla-extract/css';

export const semanticClassNames = {
  root: 'rr-image-root',
  frame: 'rr-image-frame',
  frameLoading: 'rr-image-loading',
  frameLoaded: 'rr-image-loaded',
  frameError: 'rr-image-error',
  image: 'rr-image-img',
  loader: 'rr-image-loader',
  errorBadge: 'rr-image-error',
  caption: 'rr-image-caption',
  editTrigger: 'rr-image-edit-trigger',
  editPlaceholder: 'rr-image-edit-placeholder',
  editToolbar: 'rr-image-edit-toolbar',
  editToolbarVisible: 'rr-image-edit-toolbar-visible',
  resizeHandle: 'rr-image-resize-handle',
  inspector: 'rr-image-inspector',
} as const;

const floatWidthFallback = '42%';

export const root = style({
  'margin': '1.25rem auto',
  'textAlign': 'center',
  'width': 'var(--rich-image-display-width, auto)',
  'maxWidth': '100%',
  'maxHeight': 'var(--rich-image-display-height, none)',
  'selectors': {
    '&[data-layout="align-left"]': {
      marginLeft: 0,
      marginRight: 'auto',
      textAlign: 'left',
    },
    '&[data-layout="align-right"]': {
      marginLeft: 'auto',
      marginRight: 0,
      textAlign: 'right',
    },
    '&[data-layout="float-left"]': {
      float: 'left',
      clear: 'both',
      width: `var(--rich-image-display-width, ${floatWidthFallback})`,
      margin: '0.125rem 1.25rem 0.875rem 0',
    },
    '&[data-layout="float-right"]': {
      float: 'right',
      clear: 'both',
      width: `var(--rich-image-display-width, ${floatWidthFallback})`,
      margin: '0.125rem 0 0.875rem 1.25rem',
    },
    '&[data-display="fixed-height"]': {
      width: 'auto',
    },
    '&[data-layout="float-left"][data-display="fixed-height"], &[data-layout="float-right"][data-display="fixed-height"]':
      {
        width: 'auto',
      },
  },
  '@media': {
    '(max-width: 640px)': {
      selectors: {
        '&[data-layout="float-left"], &[data-layout="float-right"]': {
          float: 'none',
          width: 'auto',
          margin: '1.25rem auto',
        },
      },
    },
  },
});

// In a live editor the `.rich-image-wrapper` block (from ImageNode.createDOM)
// carries float + width; the inner figure must fill it instead of
// double-applying both.
globalStyle(`.rich-image-wrapper[data-layout^="float"] ${root}`, {
  float: 'none',
  width: 'auto',
  margin: 0,
});

export const imageDragging = style({
  opacity: 0.4,
});

globalStyle('.rich-editor__content[data-rich-image-drop-side]', {
  cursor: 'move',
});

globalStyle('.rich-editor__content[data-rich-image-drop-side="left"]', {
  boxShadow: `inset 3px 0 0 color-mix(in srgb, ${vars.color.accent} 70%, transparent)`,
});

globalStyle('.rich-editor__content[data-rich-image-drop-side="right"]', {
  boxShadow: `inset -3px 0 0 color-mix(in srgb, ${vars.color.accent} 70%, transparent)`,
});

const imageLoad = keyframes({
  '0%': {
    mask: 'linear-gradient(90deg, #000 25%, #000000e6 50%, #00000000) 150% 0 / 400% no-repeat',
    opacity: 0.16,
  },
  '100%': {
    mask: 'linear-gradient(90deg, #000 25%, #000000e6 50%, #00000000) 0 / 400% no-repeat',
    opacity: 1,
  },
});

export const image = style({
  display: 'block',
  width: '100%',
  height: 'auto',
  maxWidth: '100%',
  opacity: 0,
  borderRadius: '0px !important',
});

export const imageState = styleVariants({
  loading: {},
  loaded: {},
  error: {},
});

export const imageVisible = style({
  opacity: 1,
  animation: `${imageLoad} 420ms ease`,
});

export const frame = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderRadius: vars.borderRadius.md,
  cursor: 'zoom-in',
  minHeight: '3rem',
  transition: 'transform 0.25s ease',
  selectors: {
    '&:hover': {
      transform: 'translateY(-1px)',
    },
  },
});

export const frameEditMode = style({
  cursor: 'default',
  selectors: {
    '&:hover': {
      transform: 'none',
    },
  },
});

export const frameStatic = style({
  cursor: 'default',
  selectors: {
    '&:hover': {
      transform: 'none',
    },
  },
});

globalStyle(`${root}[data-display="fixed-height"] ${image}`, {
  width: 'auto',
  height: 'auto',
  maxWidth: '100%',
  maxHeight: 'var(--rich-image-display-height)',
});

globalStyle(`${root}[data-display="fixed-height"] ${frame}`, {
  width: 'auto',
  maxWidth: '100%',
  maxHeight: 'var(--rich-image-display-height)',
});

const spin = keyframes({ to: { transform: 'rotate(360deg)' } });

export const loader = style({
  position: 'absolute',
  width: '1.65rem',
  height: '1.65rem',
  border: `2px solid color-mix(in srgb, ${vars.color.textSecondary} 45%, transparent)`,
  borderTopColor: `color-mix(in srgb, ${vars.color.text} 65%, transparent)`,
  borderRadius: '50%',
  animation: `${spin} 0.75s linear infinite`,
});

export const errorBadge = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  whiteSpace: 'nowrap',
  fontSize: vars.typography.fontSizeSm,
  fontWeight: 500,
  letterSpacing: '-0.005em',
  color: '#fff',
  background: `color-mix(in oklab, ${vars.color.alertCaution} 80%, transparent)`,
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  borderRadius: '6px',
  padding: '0.3rem 0.7rem',
});

export const caption = style({
  marginTop: '0.5rem',
  color: vars.color.textTertiary,
  fontSize: vars.typography.fontSizeMd,
  lineHeight: '1.5',
});

export const contentSemanticClassNames = {
  root: 'rich-image',
  container: 'rich-image-container',
  hidden: 'rich-image-hidden',
  visible: 'rich-image-visible',
  zoomOverlay: 'rich-image-zoom-overlay',
  zoomImage: 'rich-image-zoom-img',
} as const;

const contentRootStyles = {
  margin: `${vars.spacing.md} 0`,
  textAlign: 'center',
} as const;

const contentCaptionStyles = {
  fontSize: vars.typography.fontSizeMd,
  color: vars.color.textSecondary,
  marginTop: vars.spacing.sm,
  lineHeight: vars.typography.lineHeightTight,
} as const;

const contentContainerStyles = {
  position: 'relative',
  display: 'inline-block',
  overflow: 'hidden',
  borderRadius: vars.borderRadius.md,
  transition: 'background-color 0.3s ease',
} as const;

const contentHiddenStyles = {
  opacity: 0,
  transition: 'opacity 0.3s ease',
} as const;

const contentVisibleStyles = {
  opacity: 1,
  transition: 'opacity 0.3s ease',
} as const;

export const contentRoot = style(contentRootStyles);
export const contentContainer = style(contentContainerStyles);
export const contentHidden = style(contentHiddenStyles);
export const contentVisible = style(contentVisibleStyles);

const richImageZoomIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const contentZoomOverlayStyles = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  cursor: 'zoom-out',
  animation: `${richImageZoomIn} 0.2s ease`,
} as const;

const contentZoomImageStyles = {
  maxWidth: '90vw',
  maxHeight: '90vh',
  objectFit: 'contain',
  borderRadius: '0',
} as const;

export const contentZoomOverlay = style(contentZoomOverlayStyles);
export const contentZoomImage = style(contentZoomImageStyles);

globalStyle(`.${contentSemanticClassNames.root}`, contentRootStyles);
globalStyle(`.${contentSemanticClassNames.root} figcaption`, contentCaptionStyles);
globalStyle(`.${contentSemanticClassNames.container}`, contentContainerStyles);
globalStyle(`.${contentSemanticClassNames.hidden}`, contentHiddenStyles);
globalStyle(`.${contentSemanticClassNames.visible}`, contentVisibleStyles);
globalStyle(`.${contentSemanticClassNames.zoomOverlay}`, contentZoomOverlayStyles);
globalStyle(`.${contentSemanticClassNames.zoomImage}`, contentZoomImageStyles);

export const editTrigger = style({
  display: 'block',
  position: 'relative',
  cursor: 'default',
});

export const editPlaceholder = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '2rem',
  border: `2px dashed ${vars.color.border}`,
  borderRadius: vars.borderRadius.md,
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeMd,
  cursor: 'pointer',
  transition: 'border-color 0.2s, color 0.2s, background-color 0.2s',
  selectors: {
    '&:hover': {
      borderColor: vars.color.accent,
      color: vars.color.text,
      backgroundColor: `color-mix(in srgb, ${vars.color.accent} 8%, transparent)`,
    },
  },
});

export const editToolbar = style({
  ...chromeTypography,
  position: 'absolute',
  top: -44,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 20,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 2,
  padding: 4,
  borderRadius: chromeRadius.lg,
  border: 'none',
  backgroundColor: vars.color.bgElevated,
  boxShadow: vars.boxShadow.menu,
  whiteSpace: 'nowrap',
  opacity: 0,
  pointerEvents: 'none',
  transition: 'opacity 0.15s ease',
});

export const editToolbarVisible = style({
  opacity: 1,
  pointerEvents: 'auto',
});

export const resizeHandle = style({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 6,
  height: 36,
  maxHeight: '50%',
  borderRadius: 9999,
  background: 'rgba(255, 255, 255, 0.92)',
  border: '1px solid rgba(0, 0, 0, 0.18)',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
  cursor: 'ew-resize',
  touchAction: 'none',
  opacity: 0,
  transition: 'opacity 0.15s ease',
  zIndex: 10,
});

export const resizeHandleLeft = style({ left: 6 });
export const resizeHandleRight = style({ right: 6 });

export const resizeHandleVisible = style({
  opacity: 1,
});

const sliderThumb = {
  appearance: 'none',
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
  cursor: 'ew-resize',
} as const;

export const sizeSlider = style({
  appearance: 'none',
  flex: 1,
  minWidth: 0,
  height: 24,
  margin: 0,
  background: 'transparent',
  cursor: 'pointer',
  selectors: {
    '&::-webkit-slider-runnable-track': {
      height: 3,
      borderRadius: 9999,
      background: `linear-gradient(to right, ${vars.color.textSecondary} var(--fill), ${vars.color.fill} var(--fill))`,
    },
    '&::-webkit-slider-thumb': {
      ...sliderThumb,
      marginTop: -4.5,
    },
    '&::-moz-range-track': {
      height: 3,
      borderRadius: 9999,
      background: `linear-gradient(to right, ${vars.color.textSecondary} var(--fill), ${vars.color.fill} var(--fill))`,
    },
    '&::-moz-range-thumb': sliderThumb,
  },
});

export const inspector = style({
  zIndex: 30,
});

export const footerNote = style({
  ...chromeText.label,
  fontWeight: 400,
  color: vars.color.textTertiary,
});

export const toolbarGroup = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 2,
});

export const toolbarSeparator = style({
  alignSelf: 'stretch',
  width: 1,
  margin: '4px 2px',
  backgroundColor: vars.color.borderSubtle,
});

export const textButton = style({
  padding: '0 8px',
});

export const sizeButton = style({
  gap: 4,
  padding: '0 6px 0 8px',
  fontVariantNumeric: 'tabular-nums',
});

export const sizeChevron = style({
  width: 14,
  height: 14,
  color: vars.color.textTertiary,
});

globalStyle(`${editTrigger}[data-selected] ${frame}`, {
  boxShadow: `0 0 0 2px ${vars.color.accent}`,
});

export const inspectorField = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const inspectorLabel = style({
  ...chromeText.label,
  color: vars.color.textSecondary,
});

export const widthRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  minHeight: 28,
});

export const widthReadout = style({
  ...chromeText.control,
  width: 36,
  flexShrink: 0,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.text,
});

export const widthHint = style({
  ...chromeText.label,
  fontWeight: 400,
  color: vars.color.textTertiary,
});

export const pxField = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flex: 1,
  minWidth: 0,
});

export const pxSuffix = style({
  ...chromeText.label,
  fontWeight: 400,
  color: vars.color.textTertiary,
});
