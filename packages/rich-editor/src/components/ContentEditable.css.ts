import { vars } from '@haklex/rich-style-token'
import { style } from '@vanilla-extract/css'

export const contentWrapper = style({
  position: 'relative',
  maxWidth: vars.layout.maxWidth,
  margin: '0 auto',
  flex: 1,
  minHeight: 0,
  width: '100%',
  overflowY: 'auto',
})

export const content = style({
  outline: 'none',
  minHeight: '100px',
  width: '100%',
  padding: `var(--ce-padding-top, 12px) ${vars.spacing.md} 12px ${vars.spacing.md}`,
})

export const placeholder = style({
  position: 'absolute',
  top: 'var(--ce-padding-top, 12px)',
  left: vars.spacing.md,
  color: vars.color.textSecondary,
  pointerEvents: 'none',
  userSelect: 'none',
})
