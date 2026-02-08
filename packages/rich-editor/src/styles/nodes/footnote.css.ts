import { style } from '@vanilla-extract/css'

import { vars } from '../vars.css'

export const footnoteRef = style({
  color: vars.color.accent,
  fontSize: '0.75em',
  textDecoration: 'none',
  verticalAlign: 'super',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
})
