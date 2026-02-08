import { style } from '@vanilla-extract/css'

import { vars } from './vars.css'

export const editorContainer = style({
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.lg,
  overflow: 'hidden',
  backgroundColor: vars.color.bg,
  position: 'relative',
})

export const editorContent = style({
  minHeight: '150px',
  padding: vars.spacing.md,
  outline: 'none',
  cursor: 'text',
  position: 'relative',
})

export const editorPlaceholder = style({
  position: 'absolute',
  top: vars.spacing.md,
  left: vars.spacing.md,
  color: vars.color.textSecondary,
  pointerEvents: 'none',
  userSelect: 'none',
  opacity: 0.6,
  fontSize: vars.typography.fontSizeBase,
  fontFamily: vars.typography.fontFamily,
  lineHeight: vars.typography.lineHeight,
})

export const editorActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  borderTop: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.bgSecondary,
})
