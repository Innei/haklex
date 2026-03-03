import { vars } from '@haklex/rich-style-token'
import { globalStyle, style } from '@vanilla-extract/css'

export const toolbarContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  borderBottom: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.bg,
})

export const toolbarRow = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  flexWrap: 'wrap',
  minHeight: 36,
  maxWidth: vars.layout.maxWidth,
  margin: '0 auto',
  padding: '6px 16px',
})

export const toolbarButton = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  border: 'none',
  background: 'transparent',
  borderRadius: 6,
  color: vars.color.textSecondary,
  cursor: 'pointer',
  padding: 0,
  transition: 'color 0.15s, background-color 0.15s',
  ':hover': {
    backgroundColor: vars.color.fillQuaternary,
    color: vars.color.text,
  },
  selectors: {
    '&:active': {
      backgroundColor: vars.color.fillTertiary,
    },
    '&:disabled': {
      opacity: 0.35,
      cursor: 'default',
      backgroundColor: 'transparent',
      color: vars.color.textQuaternary,
    },
  },
})

globalStyle(`${toolbarButton} svg`, {
  width: 15,
  height: 15,
  strokeWidth: 2,
})

export const toolbarButtonActive = style({
  color: vars.color.accent,
  backgroundColor: vars.color.fillTertiary,
  ':hover': {
    color: vars.color.accent,
    backgroundColor: vars.color.fillTertiary,
  },
})

export const toolbarDropdownTrigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  height: 32,
  padding: '0 10px',
  border: 'none',
  background: 'transparent',
  borderRadius: 6,
  color: vars.color.textSecondary,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1,
  transition: 'color 0.15s, background-color 0.15s',
  ':hover': {
    backgroundColor: vars.color.fillQuaternary,
    color: vars.color.text,
  },
})

export const toolbarDropdownTriggerChevron = style({
  marginLeft: 'auto',
  display: 'inline-flex',
  flexShrink: 0,
})

export const toolbarSeparator = style({
  width: 1,
  height: 24,
  backgroundColor: vars.color.border,
  marginInline: 6,
  flexShrink: 0,
})

export const toolbarDropdownItemActive = style({
  backgroundColor: vars.color.fillTertiary,
  color: vars.color.accent,
})

export const tooltipShortcut = style({
  fontSize: 11,
  opacity: 0.7,
  marginLeft: 6,
})
