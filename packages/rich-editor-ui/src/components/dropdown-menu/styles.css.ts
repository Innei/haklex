import { vars } from '@shiro/rich-style-token'
import { globalStyle, style } from '@vanilla-extract/css'

export const popup = style({
  minWidth: '8rem',
  borderRadius: '0.5rem',
  padding: '0.25rem',
  backgroundColor: vars.color.bg,
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  outline: 'none',
  border: `1px solid ${vars.color.border}`,
  zIndex: 50,
  maxHeight: 'var(--available-height)',
  overflowY: 'auto',
  transformOrigin: 'var(--transform-origin)',
  transition: 'opacity 100ms, transform 100ms',
  selectors: {
    '&[data-open]': {
      opacity: 1,
      transform: 'scale(1)',
    },
    '&[data-closed]': {
      opacity: 0,
      transform: 'scale(0.95)',
    },
  },
})

export const item = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  borderRadius: '0.375rem',
  padding: '0.25rem 0.375rem',
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  outline: 'none',
  userSelect: 'none',
  cursor: 'default',
  color: vars.color.text,
  selectors: {
    '&[data-highlighted]': {
      backgroundColor: `color-mix(in srgb, ${vars.color.text} 4%, transparent)`,
    },
    '&[data-disabled]': {
      opacity: 0.5,
      pointerEvents: 'none',
    },
  },
})

globalStyle(`${item} svg`, {
  pointerEvents: 'none',
  flexShrink: 0,
  width: '16px',
  height: '16px',
})

export const separator = style({
  height: '1px',
  backgroundColor: vars.color.border,
  margin: '0.25rem -0.25rem',
})

export const label = style({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: vars.color.textSecondary,
  padding: '0.25rem 0.375rem',
})

export const checkboxIndicator = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  flexShrink: 0,
})

export const radioIndicator = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  flexShrink: 0,
})
