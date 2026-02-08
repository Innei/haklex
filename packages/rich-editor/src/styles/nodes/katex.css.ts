import { style } from '@vanilla-extract/css'

import { vars } from '../vars.css'

export const katexInline = style({
  display: 'inline',
  padding: '0 2px',
  verticalAlign: 'middle',
})

export const katexBlock = style({
  display: 'block',
  textAlign: 'center',
  padding: `${vars.spacing.md} 0`,
  overflowX: 'auto',
  margin: `${vars.spacing.md} 0`,
})
