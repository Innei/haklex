import { style } from '@vanilla-extract/css'

import { vars } from '../vars.css'

export const videoContainer = style({
  position: 'relative',
  maxWidth: '100%',
  margin: `${vars.spacing.md} auto`,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
})

export const video = style({
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  borderRadius: vars.borderRadius.md,
})
