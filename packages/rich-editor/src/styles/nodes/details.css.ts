import { style } from '@vanilla-extract/css'

import { vars } from '../vars.css'

export const details = style({
  margin: `${vars.spacing.md} 0`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
})

export const detailsSummary = style({
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  cursor: 'pointer',
  fontWeight: 600,
  backgroundColor: vars.color.bgSecondary,
  userSelect: 'none',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.border,
    },
  },
})

export const detailsContent = style({
  padding: vars.spacing.md,
})
