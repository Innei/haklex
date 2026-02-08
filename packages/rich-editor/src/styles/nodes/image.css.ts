import { style } from '@vanilla-extract/css'

import { vars } from '../vars.css'

export const imageContainer = style({
  position: 'relative',
  maxWidth: '100%',
  margin: `${vars.spacing.md} auto`,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
})

export const image = style({
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  borderRadius: vars.borderRadius.md,
})

export const imageCaption = style({
  textAlign: 'center',
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.textSecondary,
  marginTop: vars.spacing.sm,
  lineHeight: vars.typography.lineHeightTight,
})
