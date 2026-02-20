import { vars } from '@haklex/rich-style-token'
import { style } from '@vanilla-extract/css'

export const root = style({
  position: 'relative',
})

export const tablist = style({
  display: 'flex',
})

export const tab = style({
  position: 'relative',
  padding: '0.625rem 1rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'color 200ms',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  color: vars.color.textSecondary,
  outline: 'none',
  selectors: {
    '&:hover': {
      color: 'color-mix(in srgb, currentColor 80%, transparent)',
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.accent}`,
      outlineOffset: '2px',
    },
  },
})

export const tabActive = style({
  color: vars.color.text,
})

export const border = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '1px',
  backgroundColor: vars.color.border,
})

export const indicator = style({
  position: 'absolute',
  bottom: 0,
  height: '2px',
  backgroundColor: vars.color.text,
  transition: 'left 300ms ease-in-out, width 300ms ease-in-out',
})
