import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, keyframes, style } from '@vanilla-extract/css';

export const semanticClassNames = {
  card: 'link-card',
  cardShortDesc: 'link-card--short-desc',
  cardSkeleton: 'link-card--skeleton',
  cardError: 'link-card--error',
  cardCompact: 'link-card--compact',
  cardExpanded: 'link-card--expanded',
  cardWide: 'link-card--wide',
  cardPoster: 'link-card--poster',
  bg: 'link-card__bg',
  image: 'link-card__image',
  icon: 'link-card__icon',
  content: 'link-card__content',
  title: 'link-card__title',
  titleText: 'link-card__title-text',
  desc: 'link-card__desc',
  desc2: 'link-card__desc-2',
  errorContent: 'link-card__error-content',
  errorUrl: 'link-card__error-url',
  errorHint: 'link-card__error-hint',
  editWrapper: 'rich-link-card-edit-wrapper',
  editPanel: 'rich-link-card-edit-panel',
  editUrlRow: 'rich-link-card-edit-url-row',
  editLinkIcon: 'rich-link-card-edit-link-icon',
  editInput: 'rich-link-card-edit-input',
} as const;

const hoverBorder = `color-mix(in srgb, ${vars.color.border}, ${vars.color.text} 25%)`;

export const card = style({
  position: 'relative',
  display: 'flex',
  boxSizing: 'border-box',
  alignItems: 'flex-start',
  gap: '0.75rem',
  width: '32rem',
  maxWidth: '100%',
  margin: '1.25rem auto',
  padding: '0.875rem 1rem',
  borderRadius: '0.625rem',
  overflow: 'hidden',
  cursor: 'pointer',
  textDecoration: 'none',
  color: 'inherit',
  textIndent: 0,
  fontFamily: vars.typography.fontFamilySans,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: `color-mix(in srgb, ${vars.color.bgSecondary} 60%, transparent)`,
  backdropFilter: 'blur(12px) saturate(150%)',
  transition: 'border-color 0.15s, background-color 0.15s',
  selectors: {
    '&:hover': {
      borderColor: hoverBorder,
      backgroundColor: vars.color.fillTertiary,
      textDecoration: 'none',
    },
    '&:focus, &:focus-visible, &:active': { textDecoration: 'none' },
  },
});

export const cardShortDesc = style({ alignItems: 'center' });

globalStyle(`${card} *`, { fontStyle: 'normal !important' as any });
globalStyle(`${card} span`, { borderBottom: '0 !important' as any });
globalStyle(`${card}, ${card}:hover, ${card}:focus, ${card}:focus-visible, ${card}:active`, {
  textDecoration: 'none !important' as any,
});

export const bg = style({
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
});

export const image = style({
  position: 'relative',
  flexShrink: 0,
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '0.5rem',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundColor: vars.color.bgTertiary,
  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
  zIndex: 1,
});

export const icon = style({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '0.5rem',
  backgroundColor: vars.color.bgTertiary,
  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
  zIndex: 1,
});

globalStyle(`${icon} img`, {
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '0.25rem',
});

globalStyle(`${icon} svg`, {
  width: '1.25rem',
  height: '1.25rem',
  color: vars.color.textTertiary,
});

export const content = style({
  flex: 1,
  minWidth: 0,
  position: 'relative',
  zIndex: 1,
});

export const title = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  lineHeight: '1.25rem',
});

export const titleText = style({
  flex: 1,
  minWidth: 0,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  lineClamp: 1,
  WebkitLineClamp: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: vars.typography.fontSizeMd,
  fontWeight: 500,
  lineHeight: '1.25rem',
});

export const desc = style({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginTop: '0.375rem',
  fontSize: vars.typography.fontSizeMd,
  lineHeight: '1.5',
  color: vars.color.textTertiary,
  minWidth: 0,
});

export const desc2 = style({});

/* ───── shape: compact (default, matches base) ───── */
export const shapeCompact = style({});

/* ───── shape: expanded ───── */
export const shapeExpanded = style({ width: '36rem' });
globalStyle(`${shapeExpanded} ${desc}`, { WebkitLineClamp: 3 });

/* ───── shape: wide ───── */
export const shapeWide = style({
  width: '100%',
  maxWidth: '42rem',
});
globalStyle(`${shapeWide} ${desc}`, { WebkitLineClamp: 4 });

/* ───── shape: poster ───── */
export const shapePoster = style({
  width: '100%',
  maxWidth: '40rem',
  padding: 0,
  gap: 0,
  alignItems: 'stretch',
});

globalStyle(`${shapePoster} ${image}`, {
  width: '6.75rem !important' as any,
  height: 'auto !important' as any,
  aspectRatio: '2 / 3',
  borderRadius: 0,
  alignSelf: 'stretch',
  boxShadow: 'none',
});

globalStyle(`${shapePoster} ${content}`, {
  padding: '1rem 1.125rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

globalStyle(`${shapePoster} ${desc}`, { WebkitLineClamp: 3 });

/* ───── skeleton ───── */
export const cardSkeleton = style({});

const linkCardPulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

globalStyle(`${cardSkeleton} ${titleText}`, {
  width: '8rem',
  height: '1rem',
  borderRadius: '0.25rem',
  backgroundColor: vars.color.bgTertiary,
});

globalStyle(`${cardSkeleton} ${desc}`, {
  width: '100%',
  marginTop: '0.5rem',
  height: '0.75rem',
  borderRadius: '0.25rem',
  backgroundColor: vars.color.bgTertiary,
});

globalStyle(`${cardSkeleton} ${desc2}`, { width: '75%' });

globalStyle(`${cardSkeleton} ${image}`, {
  backgroundColor: vars.color.bgTertiary,
  backgroundImage: 'none !important' as any,
});

globalStyle(`${cardSkeleton} ${titleText}, ${cardSkeleton} ${desc}, ${cardSkeleton} ${image}`, {
  animation: `${linkCardPulse} 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
});

/* ───── error (degraded link, dashed border) ───── */
export const cardError = style({
  width: '32rem',
  maxWidth: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  margin: '1.25rem auto',
  padding: '0.75rem 0.875rem',
  borderRadius: '0.625rem',
  border: `1px dashed ${vars.color.border}`,
  backgroundColor: vars.color.bg,
  color: vars.color.textTertiary,
  textDecoration: 'none',
  fontFamily: vars.typography.fontFamilySans,
  cursor: 'pointer',
  transition: 'border-color 0.15s, background-color 0.15s',
  selectors: {
    '&:hover': {
      borderColor: hoverBorder,
      backgroundColor: vars.color.fillQuaternary,
      textDecoration: 'none',
    },
    '&:focus, &:focus-visible, &:active': { textDecoration: 'none' },
  },
});

export const errorIcon = style({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  borderRadius: '0.5rem',
  backgroundColor: vars.color.bgSecondary,
});

globalStyle(`${errorIcon} svg`, {
  width: '0.875rem',
  height: '0.875rem',
  color: vars.color.textQuaternary,
});

export const errorContent = style({
  flex: 1,
  minWidth: 0,
});

export const errorUrl = style({
  display: 'block',
  fontSize: vars.typography.fontSizeMd,
  fontWeight: 500,
  color: vars.color.textSecondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const errorHint = style({
  display: 'block',
  marginTop: '0.125rem',
  fontSize: vars.typography.fontSizeXs,
  color: vars.color.textQuaternary,
});

/* ───── edit decorator (unchanged) ───── */
export const editWrapper = style({
  display: 'block',
});

export const editPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '340px',
  padding: '12px',
  fontSize: vars.typography.fontSizeSm,
  backgroundColor: vars.color.bg,
  borderColor: vars.color.border,
  color: vars.color.text,
});

export const editUrlRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: vars.color.bgSecondary,
  borderRadius: vars.borderRadius.md,
  minWidth: 0,
});

export const editLinkIcon = style({
  flexShrink: 0,
  color: vars.color.textSecondary,
});

export const editInput = style({
  flex: 1,
  appearance: 'none',
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.color.text,
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeSm,
  padding: 0,
  outline: 'none',
  minWidth: 0,
});

/* ───── shape lookup ───── */
export const shapeClass = {
  compact: shapeCompact,
  expanded: shapeExpanded,
  wide: shapeWide,
  poster: shapePoster,
} as const;

export const semanticShapeClass = {
  compact: semanticClassNames.cardCompact,
  expanded: semanticClassNames.cardExpanded,
  wide: semanticClassNames.cardWide,
  poster: semanticClassNames.cardPoster,
} as const;
