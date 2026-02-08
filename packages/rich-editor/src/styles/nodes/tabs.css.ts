import { style } from '@vanilla-extract/css'

import { vars } from '../vars.css'

export const tabs = style({
  margin: `${vars.spacing.md} 0`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
})

export const tabsHeader = style({
  display: 'flex',
  backgroundColor: vars.color.bgSecondary,
  borderBottom: `1px solid ${vars.color.border}`,
  overflow: 'auto',
})

export const tabsTab = style({
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.textSecondary,
  whiteSpace: 'nowrap',
  borderBottom: '2px solid transparent',
  transition: 'color 0.2s ease, border-color 0.2s ease',
  selectors: {
    '&:hover': {
      color: vars.color.text,
    },
  },
})

export const tabsTabActive = style({
  color: vars.color.accent,
  borderBottomColor: vars.color.accent,
  fontWeight: 600,
})

export const tabsContent = style({
  padding: vars.spacing.md,
})
