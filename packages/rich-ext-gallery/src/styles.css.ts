import { chromeRadius, chromeText, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

// ─── Root ────────────────────────────────────────────────
export const gallery = style({
  position: 'relative',
  width: '100%',
  margin: '16px 0',
});

// ─── Grid ────────────────────────────────────────────────
export const galleryGrid = style({
  'display': 'grid',
  'gridTemplateColumns': 'repeat(auto-fill, minmax(200px, 1fr))',
  'gap': 12,
  '@media': {
    '(max-width: 480px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

// ─── Masonry ─────────────────────────────────────────────
export const galleryMasonry = style({
  'columnCount': 3,
  'columnGap': 12,
  '@media': {
    '(max-width: 768px)': { columnCount: 2 },
    '(max-width: 480px)': { columnCount: 1 },
  },
});

globalStyle(`${galleryMasonry} figure`, {
  breakInside: 'avoid',
  marginBottom: 12,
});

// ─── Carousel ────────────────────────────────────────────
export const galleryCarousel = style({
  position: 'relative',
});

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
});

export const galleryItem = style({
  display: 'inline-block',
  margin: 0,
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  selectors: {
    '&:hover': { transform: 'scale(1.02)' },
  },
});

globalStyle(`${galleryItem} img`, {
  display: 'block',
  borderRadius: 4,
});

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
});

export const galleryNavPrev = style({ left: 8 });
export const galleryNavNext = style({ right: 8 });

// ─── Indicators ──────────────────────────────────────────
export const galleryIndicators = style({
  position: 'absolute',
  bottom: 12,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: 8,
  zIndex: 10,
});

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
});

export const galleryIndicatorActive = style({
  opacity: 1,
});

// ─── Edit Container ─────────────────────────────────────
export const galleryEditContainer = style({
  position: 'relative',
  width: '100%',
  margin: '16px 0',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  border: `1px solid ${vars.color.border}`,
  minHeight: 120,
});

export const galleryEditOverlay = style({
  'position': 'absolute',
  'inset': 0,
  'zIndex': 5,
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'cursor': 'pointer',
  'background': 'transparent',
  'border': 'none',
  'transition': 'background 0.2s',
  ':hover': {
    background: 'color-mix(in srgb, currentColor 6%, transparent)',
  },
});

export const galleryEditLabel = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 14px',
  borderRadius: 6,
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  color: vars.color.text,
  fontFamily: vars.typography.fontFamilySans,
  ...chromeText.control,
  fontWeight: 500,
  opacity: 0,
  transition: 'opacity 0.2s',
  selectors: {
    [`${galleryEditContainer}:hover &`]: {
      opacity: 1,
    },
  },
});

export const galleryEmptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  gap: '0.75rem',
  color: vars.color.textSecondary,
  fontFamily: vars.typography.fontFamilySans,
  ...chromeText.item,
  minHeight: 120,
});

export const galleryDialogPopup = style({});
globalStyle(`${galleryDialogPopup}${galleryDialogPopup}`, {
  display: 'flex',
  flexDirection: 'column',
  height: 'min(720px, 85vh)',
  overflow: 'hidden',
});

export const galleryDialogSubHeader = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '8px 16px',
  padding: '8px 16px',
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
  flexShrink: 0,
});

export const galleryDialogSubHeaderGroup = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

export const galleryDialogSubHeaderLabel = style({
  ...chromeText.label,
  color: vars.color.textSecondary,
  flexShrink: 0,
});

export const galleryMaxHeightInput = style({
  width: 96,
});

export const galleryDialogBody = style({
  display: 'flex',
  flexDirection: 'column',
});

export const galleryDropZone = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: 16,
  borderRadius: chromeRadius.md,
  selectors: {
    '&[data-drop-active]': {
      outline: `2px dashed ${vars.color.accent}`,
      outlineOffset: -8,
    },
  },
});

export const galleryImageList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const galleryImageCard = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: 12,
  borderRadius: chromeRadius.md,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgSecondary,
});

export const galleryDragOverlay = style({
  opacity: 0.9,
});

export const galleryDragOverlayText = style({
  ...chromeText.control,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const galleryImageDragHandle = style({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 24,
  'height': 24,
  'flexShrink': 0,
  'color': vars.color.textSecondary,
  'cursor': 'grab',
  'marginTop': 4,
  'borderRadius': chromeRadius.sm,
  ':hover': {
    background: vars.color.fillSecondary,
    color: vars.color.text,
  },
  ':active': {
    cursor: 'grabbing',
  },
});

export const galleryImageThumb = style({
  width: 64,
  height: 64,
  borderRadius: chromeRadius.sm,
  overflow: 'hidden',
  flexShrink: 0,
  backgroundColor: vars.color.fillSecondary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

globalStyle(`${galleryImageThumb} img`, {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const galleryImageThumbPlaceholder = style({
  color: vars.color.textTertiary,
});

export const galleryImageFields = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  minWidth: 0,
});

export const galleryAddActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 8,
});

export const galleryDialogEmpty = style({
  ...chromeText.item,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  gap: 16,
  color: vars.color.textSecondary,
  padding: 32,
});
