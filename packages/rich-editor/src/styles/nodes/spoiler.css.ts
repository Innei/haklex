import { style } from '@vanilla-extract/css'

import { vars } from '../vars.css'

export const spoiler = style({
  backgroundColor: vars.color.text,
  color: 'transparent',
  borderRadius: vars.borderRadius.sm,
  paddingInline: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease, color 0.3s ease',
  userSelect: 'none',
})

export const spoilerRevealed = style({
  backgroundColor: 'transparent',
  color: 'inherit',
  userSelect: 'auto',
})
