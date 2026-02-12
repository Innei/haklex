import { globalStyle, style } from '@vanilla-extract/css'

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
})

export const popup = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  zIndex: 50,
  display: 'grid',
  width: '100%',
  maxWidth: 'calc(100% - 2rem)',
  gap: '1rem',
  borderRadius: '0.75rem',
  border: '1px solid rgba(228, 228, 231, 1)',
  padding: '1.5rem',
  backgroundColor: '#fff',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  '@media': {
    '(min-width: 640px)': {
      maxWidth: '32rem',
    },
    '(prefers-color-scheme: dark)': {
      backgroundColor: 'rgb(9, 9, 11)',
      border: '1px solid rgba(39, 39, 42, 1)',
    },
  },
})

export const closeButton = style({
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  borderRadius: 4,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  opacity: 0.7,
  color: 'inherit',
  transition: 'opacity 0.15s',
  ':hover': {
    opacity: 1,
  },
  ':focus': {
    outline: '2px solid rgba(161, 161, 170, 0.5)',
    outlineOffset: 2,
  },
})

globalStyle(`${closeButton} svg`, {
  width: 16,
  height: 16,
  pointerEvents: 'none',
  flexShrink: 0,
})

export const header = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
})

export const footer = style({
  display: 'flex',
  flexDirection: 'column-reverse',
  gap: '0.5rem',
  '@media': {
    '(min-width: 640px)': {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  },
})

export const title = style({
  fontSize: '1.125rem',
  fontWeight: 600,
  lineHeight: 1,
  letterSpacing: '-0.01em',
  color: 'rgb(9, 9, 11)',
  '@media': {
    '(prefers-color-scheme: dark)': {
      color: 'rgb(250, 250, 250)',
    },
  },
})

export const description = style({
  fontSize: '0.875rem',
  color: 'rgb(113, 113, 122)',
  '@media': {
    '(prefers-color-scheme: dark)': {
      color: 'rgb(161, 161, 170)',
    },
  },
})
