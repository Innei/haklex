import { vars } from '@haklex/rich-style-token/styles'
import { globalStyle, style } from '@vanilla-extract/css'

// ─── Root ────────────────────────────────────────────────
export const gallery = style({
  position: 'relative',
  width: '100%',
  margin: '16px 0',
})

// ─── Grid ────────────────────────────────────────────────
export const galleryGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 12,
  '@media': {
    '(max-width: 480px)': {
      gridTemplateColumns: '1fr',
    },
  },
})

// ─── Masonry ─────────────────────────────────────────────
export const galleryMasonry = style({
  columnCount: 3,
  columnGap: 12,
  '@media': {
    '(max-width: 768px)': { columnCount: 2 },
    '(max-width: 480px)': { columnCount: 1 },
  },
})

globalStyle(`${galleryMasonry} figure`, {
  breakInside: 'avoid',
  marginBottom: 12,
})

// ─── Carousel ────────────────────────────────────────────
export const galleryCarousel = style({
  position: 'relative',
})

export const galleryContainer = style({
  width: '100%',
  overflowX: 'auto',
  whiteSpace: 'nowrap',
  scrollBehavior: 'smooth',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  selectors: {
    '&::-webkit-scrollbar': { display: 'none' },
  },
})

export const galleryItem = style({
  display: 'inline-block',
  margin: 0,
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  selectors: {
    '&:hover': { transform: 'scale(1.02)' },
  },
})

globalStyle(`${galleryItem} img`, {
  display: 'block',
  borderRadius: 4,
})

// ─── Nav ─────────────────────────────────────────────────
export const galleryNav = style({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 32,
  height: 32,
  borderRadius: '50%',
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgSecondary,
  color: vars.color.textSecondary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backdropFilter: 'blur(20px) saturate(180%)',
  zIndex: 10,
})

export const galleryNavPrev = style({ left: 8 })
export const galleryNavNext = style({ right: 8 })

// ─── Indicators ──────────────────────────────────────────
export const galleryIndicators = style({
  position: 'absolute',
  bottom: 12,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: 8,
  zIndex: 10,
})

export const galleryIndicator = style({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: vars.color.textSecondary,
  opacity: 0.5,
  backdropFilter: 'blur(20px) saturate(180%)',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  selectors: {
    '&:hover': { opacity: 1 },
  },
})

export const galleryIndicatorActive = style({
  opacity: 1,
})

// ─── Edit Container ─────────────────────────────────────
export const galleryEditContainer = style({
  position: 'relative',
  width: '100%',
  margin: '16px 0',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  border: `1px solid ${vars.color.border}`,
  minHeight: 120,
})

export const galleryEditOverlay = style({
  position: 'absolute',
  inset: 0,
  zIndex: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  transition: 'background 0.2s',
  ':hover': {
    background: 'color-mix(in srgb, currentColor 6%, transparent)',
  },
})

export const galleryEditLabel = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 14px',
  borderRadius: 6,
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  color: vars.color.text,
  fontSize: vars.typography.fontSizeSm,
  fontWeight: 500,
  opacity: 0,
  transition: 'opacity 0.2s',
  selectors: {
    [`${galleryEditContainer}:hover &`]: {
      opacity: 1,
    },
  },
})

export const galleryEmptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  gap: '0.75rem',
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeMd,
  minHeight: 120,
})

// ─── Dialog (fullscreen popup) ──────────────────────────
const _galleryDialogPopup = style({})
globalStyle(`${_galleryDialogPopup}${_galleryDialogPopup}`, {
  padding: 0,
  gap: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  width: 'calc(100vw - 2rem)',
  height: 'min(720px, 85vh)',
  borderRadius: '0.5rem',
  '@media': {
    '(min-width: 640px)': {
      maxWidth: '56rem',
    },
  },
})
globalStyle(`${_galleryDialogPopup}${_galleryDialogPopup}[data-open]`, {
  animation: 'none',
})
globalStyle(`${_galleryDialogPopup}${_galleryDialogPopup}[data-closed]`, {
  animation: 'none',
})
export { _galleryDialogPopup as galleryDialogPopup }

// ─── Dialog header ──────────────────────────────────────
export const galleryDialogHeader = style({
  display: 'flex',
  alignItems: 'center',
  height: 48,
  flexShrink: 0,
  padding: '0 12px 0 16px',
  borderBottom: `1px solid ${vars.color.border}`,
  gap: 10,
})

export const galleryDialogTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: vars.typography.fontSizeMd,
  fontWeight: 600,
  color: vars.color.text,
  lineHeight: 1,
})

export const galleryHeaderActions = style({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: 2,
})

export const galleryHeaderClose = style({
  marginLeft: 8,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 6,
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
  ':hover': {
    background: 'color-mix(in srgb, currentColor 8%, transparent)',
    color: vars.color.text,
  },
})

// ─── Dialog body ────────────────────────────────────────
export const galleryDialogBody = style({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: '1rem',
})

export const galleryImageList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
})

// ─── Image card ─────────────────────────────────────────
export const galleryImageCard = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: `1px solid ${vars.color.border}`,
  background: `color-mix(in srgb, ${vars.color.text} 2%, transparent)`,
})

export const galleryImageDragHandle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  flexShrink: 0,
  color: vars.color.textSecondary,
  cursor: 'grab',
  marginTop: 4,
  borderRadius: 4,
  transition: 'background 0.15s, color 0.15s',
  ':hover': {
    background: 'color-mix(in srgb, currentColor 8%, transparent)',
    color: vars.color.text,
  },
  ':active': {
    cursor: 'grabbing',
  },
})

export const galleryImageThumb = style({
  width: 64,
  height: 64,
  borderRadius: 4,
  overflow: 'hidden',
  flexShrink: 0,
  backgroundColor: `color-mix(in srgb, ${vars.color.text} 5%, transparent)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

globalStyle(`${galleryImageThumb} img`, {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
})

export const galleryImageThumbPlaceholder = style({
  color: `color-mix(in srgb, ${vars.color.textSecondary} 40%, transparent)`,
})

export const galleryImageFields = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  minWidth: 0,
})

export const galleryImageInput = style({
  width: '100%',
  padding: '4px 8px',
  borderRadius: 4,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bg,
  color: vars.color.text,
  fontSize: vars.typography.fontSizeSm,
  outline: 'none',
  transition: 'border-color 0.15s',
  ':focus': {
    borderColor: `color-mix(in srgb, ${vars.color.text} 30%, transparent)`,
  },
  '::placeholder': {
    color: `color-mix(in srgb, ${vars.color.textSecondary} 50%, transparent)`,
  },
})

export const galleryImageActions = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flexShrink: 0,
})

export const galleryImageDeleteBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: 4,
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
  ':hover': {
    background: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
    color: vars.color.alertCaution,
  },
})

// ─── Add image button ───────────────────────────────────
export const galleryAddBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  width: '100%',
  padding: '0.625rem',
  borderRadius: '0.5rem',
  border: `1px dashed ${vars.color.border}`,
  background: 'transparent',
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeSm,
  cursor: 'pointer',
  transition: 'border-color 0.15s, color 0.15s, background 0.15s',
  ':hover': {
    borderColor: `color-mix(in srgb, ${vars.color.text} 20%, transparent)`,
    color: vars.color.text,
    background: `color-mix(in srgb, ${vars.color.text} 2%, transparent)`,
  },
})

// ─── Dialog footer ──────────────────────────────────────
export const galleryDialogFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 1rem',
  height: 44,
  borderTop: `1px solid ${vars.color.border}`,
  flexShrink: 0,
  backgroundColor: `color-mix(in srgb, ${vars.color.text} 1.5%, transparent)`,
})

export const galleryFooterInfo = style({
  fontSize: vars.typography.fontSizeXs,
  color: vars.color.textSecondary,
})

export const galleryFooterActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
})

const galleryFooterBtnBase = style({
  padding: '0.25rem 0.75rem',
  borderRadius: '0.375rem',
  fontSize: vars.typography.fontSizeXs,
  fontWeight: 500,
  cursor: 'pointer',
  height: 28,
  transition: 'background-color 0.15s, border-color 0.15s',
})

export const galleryFooterBtnCancel = style([
  galleryFooterBtnBase,
  {
    backgroundColor: 'transparent',
    color: vars.color.textSecondary,
    border: `1px solid ${vars.color.border}`,
    ':hover': {
      backgroundColor: `color-mix(in srgb, ${vars.color.text} 4%, transparent)`,
    },
  },
])

export const galleryFooterBtnSave = style([
  galleryFooterBtnBase,
  {
    backgroundColor: vars.color.text,
    color: vars.color.bg,
    border: '1px solid transparent',
    ':hover': {
      backgroundColor: `color-mix(in srgb, ${vars.color.text} 85%, transparent)`,
    },
  },
])

// ─── Dialog empty state ─────────────────────────────────
export const galleryDialogEmpty = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  gap: '1rem',
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeMd,
  padding: '2rem',
})
