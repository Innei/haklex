import { globalStyle, style } from '@vanilla-extract/css'

export const popup = style({
  minWidth: '8rem',
  borderRadius: '0.5rem',
  padding: '0.25rem',
  backgroundColor: '#fff',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  outline: 'none',
  border: '1px solid rgba(228, 228, 231, 1)',
  zIndex: 50,
  maxHeight: 'var(--available-height)',
  overflowY: 'auto',
  transformOrigin: 'var(--transform-origin)',
  transition: 'opacity 100ms, transform 100ms',
  '@media': {
    '(prefers-color-scheme: dark)': {
      backgroundColor: 'rgb(9, 9, 11)',
      border: '1px solid rgba(39, 39, 42, 1)',
    },
  },
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
  color: 'rgb(9, 9, 11)',
  '@media': {
    '(prefers-color-scheme: dark)': {
      color: 'rgb(250, 250, 250)',
    },
  },
  selectors: {
    '&[data-highlighted]': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    '&[data-disabled]': {
      opacity: 0.5,
      pointerEvents: 'none',
    },
  },
})

globalStyle(`${item}[data-highlighted]`, {
  '@media': {
    '(prefers-color-scheme: dark)': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
  backgroundColor: 'rgba(228, 228, 231, 1)',
  margin: '0.25rem -0.25rem',
  '@media': {
    '(prefers-color-scheme: dark)': {
      backgroundColor: 'rgba(39, 39, 42, 1)',
    },
  },
})

export const label = style({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: 'rgb(113, 113, 122)',
  padding: '0.25rem 0.375rem',
  '@media': {
    '(prefers-color-scheme: dark)': {
      color: 'rgb(161, 161, 170)',
    },
  },
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
