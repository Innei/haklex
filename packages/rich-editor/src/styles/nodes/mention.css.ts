import { style } from '@vanilla-extract/css'

import { vars } from '../vars.css'

export const mention = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: vars.color.accent,
  fontWeight: 500,
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
  selectors: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
})

export const mentionIcon = style({
  width: '1em',
  height: '1em',
  flexShrink: 0,
})
