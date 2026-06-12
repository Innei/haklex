import { vars } from '@haklex/rich-style-token/styles';
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
  editToolbarButton: 'rr-image-edit-toolbar-button',
  editToolbarButtonDanger: 'rr-image-edit-toolbar-danger',
  editPanel: 'rr-image-edit-panel',
  editField: 'rr-image-edit-field',
  editFieldIcon: 'rr-image-edit-field-icon',
  editInput: 'rr-image-edit-input',
  replaceUploadArea: 'rr-image-replace-upload-area',
  replacePreview: 'rr-image-replace-preview',
  panelHint: 'rr-image-panel-hint',
  resizeHandle: 'rr-image-resize-handle',
} as const;

export const root = style({
  'margin': '1.25rem auto',
  'textAlign': 'center',
  'width': 'var(--rich-image-display-width, auto)',
  'maxWidth': '100%',
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
      width: 'var(--rich-image-display-width, 50%)',
      margin: '0.25rem 1.5rem 1rem 0',
    },
    '&[data-layout="float-right"]': {
      float: 'right',
      width: 'var(--rich-image-display-width, 50%)',
      margin: '0.25rem 0 1rem 1.5rem',
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
  background: 'rgba(255, 59, 48, 0.65)',
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
  position: 'absolute',
  top: '-2.5rem',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 20,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px',
  borderRadius: '10px',
  border: `1px solid ${vars.color.border}`,
  background: `color-mix(in srgb, ${vars.color.bg} 96%, transparent)`,
  boxShadow: vars.boxShadow.topBar,
  opacity: 0,
  pointerEvents: 'none',
  transition: 'opacity 0.15s ease',
});

export const editToolbarVisible = style({
  opacity: 1,
  pointerEvents: 'auto',
});

export const editToolbarButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
  borderRadius: '8px',
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'background-color 0.15s ease, color 0.15s ease',
  selectors: {
    '&:hover': {
      color: vars.color.text,
      backgroundColor: vars.color.fillSecondary,
    },
  },
});

export const editToolbarButtonDanger = style({
  selectors: {
    '&:hover': {
      color: vars.color.alertCaution,
      backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 12%, transparent)`,
    },
  },
});

export const editPanel = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '360px',
  padding: '12px',
  fontSize: vars.typography.fontSizeBase,
  fontFamily: vars.typography.fontFamily,
  zIndex: 30,
});

export const editField = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 10px',
  backgroundColor: vars.color.bgSecondary,
  borderRadius: '6px',
  minWidth: 0,
});

export const editFieldIcon = style({
  flexShrink: 0,
  color: vars.color.textSecondary,
});

export const editInput = style({
  flex: 1,
  appearance: 'none',
  border: 'none',
  backgroundColor: 'transparent',
  color: 'inherit',
  fontSize: vars.typography.fontSizeSm,
  padding: 0,
  outline: 'none',
  minWidth: 0,
  selectors: {
    '&::placeholder': {
      color: vars.color.textSecondary,
    },
  },
});

export const replaceUploadArea = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  minHeight: 138,
  borderRadius: vars.borderRadius.md,
  border: `1.5px dashed ${vars.color.border}`,
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  selectors: {
    '&:hover': {
      borderColor: `color-mix(in srgb, ${vars.color.accent} 45%, transparent)`,
      color: vars.color.text,
      backgroundColor: `color-mix(in srgb, ${vars.color.accent} 7%, transparent)`,
    },
  },
});

export const replacePreview = style({
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
  border: `1px solid ${vars.color.border}`,
  backgroundColor: `color-mix(in srgb, ${vars.color.text} 2%, transparent)`,
});

globalStyle(`${replacePreview} img`, {
  width: '100%',
  maxHeight: 188,
  objectFit: 'cover',
  display: 'block',
});

export const panelHint = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeXs,
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

export const controlPanel = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px',
  fontFamily: vars.typography.fontFamily,
  zIndex: 30,
});

// The popover base popup fixes width at 288px; doubled selector outranks it
// without depending on cross-package CSS order.
globalStyle(`${controlPanel}${controlPanel}`, {
  width: 'fit-content',
});

export const sizeSliderWrap = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: 132,
  height: 24,
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
  width: '100%',
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

export const sizeSliderTick = style({
  position: 'absolute',
  top: '50%',
  width: 3,
  height: 3,
  borderRadius: '50%',
  backgroundColor: vars.color.bg,
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
});

export const sizeValue = style({
  minWidth: 34,
  textAlign: 'right',
  fontSize: vars.typography.fontSizeXs,
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.textSecondary,
});

export const sizeOption = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 26,
  padding: '0 8px',
  borderRadius: '6px',
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeXs,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background-color 0.15s ease, color 0.15s ease',
  selectors: {
    '&:hover': {
      color: vars.color.text,
      backgroundColor: vars.color.fillSecondary,
    },
  },
});

export const editToolbarButtonActive = style({
  color: vars.color.text,
  backgroundColor: vars.color.fillSecondary,
});
