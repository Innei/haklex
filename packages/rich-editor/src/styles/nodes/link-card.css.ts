import { globalStyle, style } from '@vanilla-extract/css'

import { vars } from '../vars.css'

export const linkCard = style({
  display: 'flex',
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
  textDecoration: 'none',
  color: 'inherit',
  margin: `${vars.spacing.md} 0`,
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  selectors: {
    '&:hover': {
      borderColor: vars.color.accent,
      boxShadow: `0 2px 8px rgba(0, 0, 0, 0.08)`,
    },
  },
})

export const linkCardImage = style({
  width: '120px',
  flexShrink: 0,
  overflow: 'hidden',
})

globalStyle(`${linkCardImage} img`, {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
})

export const linkCardContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  padding: vars.spacing.md,
  overflow: 'hidden',
  flex: 1,
})

export const linkCardTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  fontWeight: 600,
  fontSize: vars.typography.fontSizeBase,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const linkCardDescription = style({
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.textSecondary,
  lineHeight: vars.typography.lineHeightTight,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
})

export const linkCardUrl = style({
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.textSecondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  opacity: 0.7,
})
