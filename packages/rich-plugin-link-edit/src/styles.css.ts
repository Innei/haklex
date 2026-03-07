import { vars } from '@haklex/rich-style-token/styles'
import { globalStyle, style } from '@vanilla-extract/css'

export const semanticClassNames = {
  panel: 'rich-link-edit-panel',
  urlRow: 'rich-link-edit-url-row',
  linkIcon: 'rich-link-edit-link-icon',
  input: 'rich-link-edit-input',
  cmdHover: 'rich-link-edit-cmd-hover',
} as const

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '340px',
  padding: '12px',
  fontSize: '13px',
})

export const urlRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: vars.color.bgSecondary,
  borderRadius: vars.borderRadius.md,
  minWidth: 0,
})

export const linkIcon = style({
  flexShrink: 0,
  color: vars.color.textSecondary,
})

export const input = style({
  flex: 1,
  appearance: 'none',
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.color.text,
  fontFamily: vars.typography.fontMono,
  fontSize: '13px',
  padding: 0,
  outline: 'none',
  minWidth: 0,
  selectors: {
    '&::placeholder': {
      color: vars.color.textSecondary,
    },
  },
})

export const cmdHover = style({})

globalStyle(`${cmdHover} a`, {
  cursor: 'pointer',
  textDecorationLine: 'underline',
})
