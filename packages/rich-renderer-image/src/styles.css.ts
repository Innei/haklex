import { vars } from '@haklex/rich-style-token/styles'
import {
  globalStyle,
  keyframes,
  style,
  styleVariants,
} from '@vanilla-extract/css'

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
  editActions: 'rr-image-edit-actions',
  editActionButton: 'rr-image-edit-action-btn',
  editActionButtonEnd: 'rr-image-edit-action-btn--end',
  replaceUploadArea: 'rr-image-replace-upload-area',
  replacePreview: 'rr-image-replace-preview',
  panelHint: 'rr-image-panel-hint',
} as const

export const root = style({
  margin: '1.25rem 0',
  textAlign: 'center',
})

const imageLoad = keyframes({
  '0%': {
    mask: 'linear-gradient(90deg, #000 25%, #000000e6 50%, #00000000) 150% 0 / 400% no-repeat',
    opacity: 0.16,
  },
  '100%': {
    mask: 'linear-gradient(90deg, #000 25%, #000000e6 50%, #00000000) 0 / 400% no-repeat',
    opacity: 1,
  },
})

export const image = style({
  display: 'block',
  width: '100%',
  height: 'auto',
  maxWidth: '100%',
  opacity: 0,
  borderRadius: '0px !important',
})

export const imageState = styleVariants({
  loading: {},
  loaded: {},
  error: {},
})

export const imageVisible = style({
  opacity: 1,
  animation: `${imageLoad} 420ms ease`,
})

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
})

export const frameEditMode = style({
  cursor: 'default',
  selectors: {
    '&:hover': {
      transform: 'none',
    },
  },
})

const spin = keyframes({ to: { transform: 'rotate(360deg)' } })

export const loader = style({
  position: 'absolute',
  width: '1.65rem',
  height: '1.65rem',
  border: `2px solid color-mix(in srgb, ${vars.color.textSecondary} 45%, transparent)`,
  borderTopColor: `color-mix(in srgb, ${vars.color.text} 65%, transparent)`,
  borderRadius: '50%',
  animation: `${spin} 0.75s linear infinite`,
})

export const errorBadge = style({
  fontSize: vars.typography.fontSizeSm,
  color: vars.color.alertCaution,
  background: `color-mix(in srgb, ${vars.color.bg} 86%, transparent)`,
  borderRadius: '999px',
  padding: '0.15rem 0.6rem',
})

export const caption = style({
  marginTop: '0.5rem',
  color: vars.color.textTertiary,
  fontSize: vars.typography.fontSizeMd,
  lineHeight: '1.5',
})

export const contentSemanticClassNames = {
  root: 'rich-image',
  container: 'rich-image-container',
  hidden: 'rich-image-hidden',
  visible: 'rich-image-visible',
  zoomOverlay: 'rich-image-zoom-overlay',
  zoomImage: 'rich-image-zoom-img',
} as const

const contentRootStyles = {
  margin: `${vars.spacing.md} 0`,
  textAlign: 'center',
} as const

const contentCaptionStyles = {
  fontSize: vars.typography.fontSizeMd,
  color: vars.color.textSecondary,
  marginTop: vars.spacing.sm,
  lineHeight: vars.typography.lineHeightTight,
} as const

const contentContainerStyles = {
  position: 'relative',
  display: 'inline-block',
  overflow: 'hidden',
  borderRadius: vars.borderRadius.md,
  transition: 'background-color 0.3s ease',
} as const

const contentHiddenStyles = {
  opacity: 0,
  transition: 'opacity 0.3s ease',
} as const

const contentVisibleStyles = {
  opacity: 1,
  transition: 'opacity 0.3s ease',
} as const

export const contentRoot = style(contentRootStyles)
export const contentContainer = style(contentContainerStyles)
export const contentHidden = style(contentHiddenStyles)
export const contentVisible = style(contentVisibleStyles)

const richImageZoomIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

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
} as const

const contentZoomImageStyles = {
  maxWidth: '90vw',
  maxHeight: '90vh',
  objectFit: 'contain',
  borderRadius: '0',
} as const

export const contentZoomOverlay = style(contentZoomOverlayStyles)
export const contentZoomImage = style(contentZoomImageStyles)

globalStyle(`.${contentSemanticClassNames.root}`, contentRootStyles)
globalStyle(
  `.${contentSemanticClassNames.root} figcaption`,
  contentCaptionStyles,
)
globalStyle(`.${contentSemanticClassNames.container}`, contentContainerStyles)
globalStyle(`.${contentSemanticClassNames.hidden}`, contentHiddenStyles)
globalStyle(`.${contentSemanticClassNames.visible}`, contentVisibleStyles)
globalStyle(
  `.${contentSemanticClassNames.zoomOverlay}`,
  contentZoomOverlayStyles,
)
globalStyle(`.${contentSemanticClassNames.zoomImage}`, contentZoomImageStyles)

export const editTrigger = style({
  display: 'block',
  position: 'relative',
  cursor: 'default',
})

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
})

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
})

export const editToolbarVisible = style({
  opacity: 1,
  pointerEvents: 'auto',
})

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
})

export const editToolbarButtonDanger = style({
  selectors: {
    '&:hover': {
      color: vars.color.alertCaution,
      backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 12%, transparent)`,
    },
  },
})

export const editPanel = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '360px',
  padding: '12px',
  fontSize: vars.typography.fontSizeSm,
  fontFamily: vars.typography.fontFamily,
  zIndex: 30,
})

export const editField = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 10px',
  backgroundColor: vars.color.bgSecondary,
  borderRadius: '6px',
  minWidth: 0,
})

export const editFieldIcon = style({
  flexShrink: 0,
  color: vars.color.textSecondary,
})

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
})

export const editActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
})

export const editActionButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: 'inherit',
  fontSize: vars.typography.fontSizeSm,
  fontWeight: 500,
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: '4px',
  transition: 'color 0.15s ease, background-color 0.15s ease',
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.fillSecondary,
    },
  },
})

export const editActionButtonEnd = style({
  marginLeft: 'auto',
})

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
})

export const replacePreview = style({
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
  border: `1px solid ${vars.color.border}`,
  backgroundColor: `color-mix(in srgb, ${vars.color.text} 2%, transparent)`,
})

globalStyle(`${replacePreview} img`, {
  width: '100%',
  maxHeight: 188,
  objectFit: 'cover',
  display: 'block',
})

export const panelHint = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeXs,
})
