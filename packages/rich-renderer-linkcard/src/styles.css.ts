import { vars } from '@haklex/rich-style-token/styles'
import { globalStyle, keyframes, style } from '@vanilla-extract/css'

export const semanticClassNames = {
  card: 'link-card',
  cardShortDesc: 'link-card--short-desc',
  cardSkeleton: 'link-card--skeleton',
  cardError: 'link-card--error',
  cardPoster: 'link-card--poster',
  cardWide: 'link-card--wide',
  cardMedia: 'link-card--media',
  cardGithub: 'link-card--github',
  cardAcademic: 'link-card--academic',
  bg: 'link-card__bg',
  image: 'link-card__image',
  imagePoster: 'link-card__image--poster',

  icon: 'link-card__icon',
  content: 'link-card__content',
  title: 'link-card__title',
  titleText: 'link-card__title-text',
  desc: 'link-card__desc',
  desc2: 'link-card__desc-2',
  editWrapper: 'rich-link-card-edit-wrapper',
  editPanel: 'rich-link-card-edit-panel',
  editUrlRow: 'rich-link-card-edit-url-row',
  editLinkIcon: 'rich-link-card-edit-link-icon',
  editInput: 'rich-link-card-edit-input',
  editActions: 'rich-link-card-edit-actions',
  editActionButton: 'rich-link-card-edit-action-btn',
  editActionButtonEnd: 'rich-link-card-edit-action-btn--end',
} as const

export const card = style({
  position: 'relative',
  display: 'flex',
  boxSizing: 'border-box',
  alignItems: 'flex-start',
  gap: '0.75rem',
  width: '32rem',
  maxWidth: '100%',
  margin: '1.25rem auto',
  padding: '1rem',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  cursor: 'pointer',
  textDecoration: 'none',
  color: 'inherit',
  textIndent: 0,
  fontFamily: vars.typography.fontFamilySans,
  border: `1px solid color-mix(in srgb, ${vars.color.border} 80%, transparent)`,
  backgroundColor: `color-mix(in srgb, ${vars.color.bgSecondary} 80%, transparent)`,
  backdropFilter: 'blur(12px) saturate(150%)',
  transition: 'background-color 0.2s',
  selectors: {
    '&:hover': {
      borderColor: vars.color.border,
      backgroundColor: vars.color.fillTertiary,
    },
  },
})

export const cardShortDesc = style({
  alignItems: 'center',
})

globalStyle(`${card} *`, { fontStyle: 'normal !important' as any })
globalStyle(`${card} span`, { borderBottom: '0 !important' as any })

export const bg = style({
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
})

export const image = style({
  position: 'relative',
  flexShrink: 0,
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '0.5rem',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundColor: vars.color.bgSecondary,
  zIndex: 1,
})

export const imagePoster = style({
  width: '6.25rem !important' as any,
  height: 'auto !important' as any,
  minHeight: '8.75rem',
  aspectRatio: '2 / 3',
  alignSelf: 'stretch',
})

export const icon = style({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '0.5rem',
  backgroundColor: vars.color.bgSecondary,
  zIndex: 1,
})

globalStyle(`${icon} img`, {
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '0.25rem',
})

globalStyle(`${icon} svg`, {
  width: '1.25rem',
  height: '1.25rem',
  color: vars.color.textSecondary,
})

export const content = style({
  flex: 1,
  minWidth: 0,
  position: 'relative',
  zIndex: 1,
})

export const title = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  lineHeight: '1.25rem',
})

export const titleText = style({
  flex: 1,
  minWidth: 0,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: vars.typography.fontSizeMd,
  fontWeight: 600,
  lineHeight: '1.25rem',
})

export const desc = style({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginTop: '0.375rem',
  fontSize: vars.typography.fontSizeMd,
  lineHeight: '1.5',
  color: vars.color.textSecondary,
  minWidth: 0,
})

export const desc2 = style({})

export const cardPoster = style({
  width: '100% !important' as any,
  height: 'auto !important' as any,
  maxWidth: '40rem',
  padding: 0,
})

globalStyle(`${cardPoster} ${image}`, {
  borderRadius: 0,
  alignSelf: 'stretch',
  height: 'auto !important' as any,
  marginLeft: '0 !important' as any,
})

globalStyle(`${cardPoster} ${image}::after`, {
  content: "''",
  position: 'absolute',
  inset: 0,
  background: `linear-gradient(to right, transparent 60%, ${vars.color.bgSecondary})`,
  pointerEvents: 'none',
})

globalStyle(`${cardPoster} ${content}`, {
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
})

export const cardWide = style({ width: '100%', maxWidth: '40rem' })
export const cardMedia = style({
  width: '100% !important' as any,
  maxWidth: 'unset !important' as any,
})
globalStyle(`${cardMedia} ${desc}`, { WebkitLineClamp: 4 })

export const cardGithub = style({
  width: '36rem',
  '@media': { '(max-width: 640px)': { width: '100%' } },
})

export const cardAcademic = style({ width: '38rem' })
globalStyle(`${cardAcademic} ${desc}`, { WebkitLineClamp: 3 })

globalStyle(`${card}[data-source='gh-repo']`, { height: '6.25rem' })
globalStyle(
  `${card}[data-source='gh-commit'], ${card}[data-source='gh-pr'], ${card}[data-source='gh-issue'], ${card}[data-source='gh-discussion']`,
  { height: '5rem' },
)
globalStyle(`${card}[data-source='leetcode']`, { height: '5.25rem' })
globalStyle(`${card}[data-source='arxiv']`, { height: '6rem' })
globalStyle(
  `${card}[data-source='netease-music-song'], ${card}[data-source='qq-music-song']`,
  { height: '5.75rem' },
)

export const cardSkeleton = style({ animationPlayState: 'paused' })

globalStyle(`${cardSkeleton} ${titleText}`, {
  width: '8rem',
  height: '1.25rem',
  borderRadius: '0.375rem',
  backgroundColor: vars.color.border,
})

globalStyle(`${cardSkeleton} ${desc}`, {
  width: '100%',
  marginTop: '0.5rem',
  height: '0.875rem',
  borderRadius: '0.375rem',
  backgroundColor: vars.color.border,
})

globalStyle(`${cardSkeleton} ${desc2}`, {
  width: '80%',
})

globalStyle(`${cardSkeleton} ${image}`, {
  backgroundColor: vars.color.border,
})

const linkCardPulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
})

globalStyle(
  `${cardSkeleton} ${titleText}, ${cardSkeleton} ${desc}, ${cardSkeleton} ${image}`,
  { animation: `${linkCardPulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite` },
)

export const cardError = style({})

globalStyle(`${cardSkeleton}${cardError}`, {
  backgroundColor:
    `color-mix(in srgb, ${vars.color.alertCaution} 12%, transparent) !important` as any,
  border: 0,
})

globalStyle(
  `${cardSkeleton}${cardError} ${titleText}, ${cardSkeleton}${cardError} ${desc}, ${cardSkeleton}${cardError} ${image}`,
  {
    backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 47%, transparent)`,
    color: 'transparent',
    animation: 'none',
  },
)

globalStyle(`${cardSkeleton}${cardError} ${content}`, {
  overflow: 'hidden',
  minWidth: 0,
})

globalStyle(`${cardSkeleton}${cardError} ${desc}`, {
  width: '80%',
})

globalStyle(`${cardSkeleton}${cardError} ${image}`, {
  backgroundImage: 'none !important' as any,
})

export const editWrapper = style({
  display: 'block',
})

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
})

export const editUrlRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: vars.color.bgSecondary,
  borderRadius: vars.borderRadius.md,
  minWidth: 0,
})

export const editLinkIcon = style({
  flexShrink: 0,
  color: vars.color.textSecondary,
})

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
  color: vars.color.text,
  fontSize: vars.typography.fontSizeSm,
  fontWeight: 500,
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: vars.borderRadius.sm,
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

export const typeCardModifier = {
  media: cardMedia,
  github: cardGithub,
  academic: cardAcademic,
  wide: cardWide,
} as const

export const semanticTypeClassNames = {
  media: semanticClassNames.cardMedia,
  github: semanticClassNames.cardGithub,
  academic: semanticClassNames.cardAcademic,
  wide: semanticClassNames.cardWide,
} as const

export const semanticClassToStyle: Record<string, string> = {
  [semanticClassNames.cardShortDesc]: cardShortDesc,
  [semanticClassNames.cardSkeleton]: cardSkeleton,
  [semanticClassNames.cardError]: cardError,
  [semanticClassNames.cardPoster]: cardPoster,
  [semanticClassNames.cardWide]: cardWide,
  [semanticClassNames.cardMedia]: cardMedia,
  [semanticClassNames.cardGithub]: cardGithub,
  [semanticClassNames.cardAcademic]: cardAcademic,
  [semanticClassNames.imagePoster]: imagePoster,
}
