import { vars } from '@shiro/rich-style-token'
import { style, styleVariants } from '@vanilla-extract/css'

export const container = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '0.5rem',
  backgroundColor: vars.color.bgSecondary,
  padding: '0.25rem',
})

export const containerFullWidth = style({
  width: '100%',
})

export const sizeVariants = styleVariants({
  sm: {
    height: '2rem',
    fontSize: '0.75rem',
  },
  md: {
    height: '2.5rem',
    fontSize: '0.875rem',
  },
})

export const indicator = style({
  position: 'absolute',
  top: '0.25rem',
  bottom: '0.25rem',
  borderRadius: '0.375rem',
  backgroundColor: vars.color.bg,
  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
  transition: 'all 300ms cubic-bezier(0.25, 1, 0.5, 1)',
  pointerEvents: 'none',
})

export const indicatorHidden = style({
  opacity: 0,
})

export const item = style({
  position: 'relative',
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  borderRadius: '0.375rem',
  fontWeight: 500,
  outline: 'none',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  transition: 'color 200ms',
  color: vars.color.textSecondary,

  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.color.accent}`,
      outlineOffset: '1px',
    },
  },
})

export const itemActive = style({
  color: vars.color.text,
})

export const itemDisabled = style({
  pointerEvents: 'none',
  opacity: 0.4,
})

export const itemFullWidth = style({
  flex: 1,
})

export const itemPaddingVariants = styleVariants({
  sm: {
    padding: '0 0.75rem',
  },
  md: {
    padding: '0 1rem',
  },
})
