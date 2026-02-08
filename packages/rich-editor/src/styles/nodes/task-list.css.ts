import { style } from '@vanilla-extract/css'

import { vars } from '../vars.css'

export const taskListItem = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.spacing.sm,
  listStyleType: 'none',
  margin: `${vars.spacing.xs} 0`,
})

export const taskCheckbox = style({
  marginTop: '0.3em',
  width: '16px',
  height: '16px',
  flexShrink: 0,
  accentColor: vars.color.accent,
  cursor: 'default',
})

export const taskChecked = style({
  textDecoration: 'line-through',
  color: vars.color.textSecondary,
})
