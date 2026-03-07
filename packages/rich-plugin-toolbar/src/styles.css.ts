import { vars } from '@haklex/rich-style-token/styles'
import { globalStyle, style } from '@vanilla-extract/css'

export const toolbarContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 12,
  backgroundColor: `color-mix(in srgb, ${vars.color.bg} 90%, transparent)`,
  backdropFilter: 'blur(8px)',
  boxShadow: vars.boxShadow.topBar,
  fontFamily: vars.typography.fontFamilySans,
  position: 'sticky',
  top: 0,
  zIndex: 2,
  margin: '12px auto 0',
  maxWidth: vars.layout.maxWidth,
})

export const toolbarRow = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  flexWrap: 'wrap',
  minHeight: 36,
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
    '&[data-popup-open]': {
      backgroundColor: vars.color.fillTertiary,
      color: vars.color.text,
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
  color: vars.color.text,
  backgroundColor: vars.color.fillTertiary,
  ':hover': {
    color: vars.color.text,
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
  color: vars.color.text,
})

export const tooltipShortcut = style({
  fontSize: 11,
  opacity: 0.7,
  marginLeft: 6,
})
