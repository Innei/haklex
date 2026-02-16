import { globalStyle, keyframes, style } from '@vanilla-extract/css'

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

const fadeOut = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
})

const contentIn = keyframes({
  from: { opacity: 0, transform: 'translate(-50%, -50%) scale(0.95)' },
  to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
})

const contentOut = keyframes({
  from: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
  to: { opacity: 0, transform: 'translate(-50%, -50%) scale(0.95)' },
})

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
})

globalStyle(`${backdrop}[data-open]`, {
  animation: `${fadeIn} 150ms ease-out`,
})

globalStyle(`${backdrop}[data-closed]`, {
  animation: `${fadeOut} 100ms ease-in`,
})

export const popup = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 50,
  display: 'grid',
  width: '100%',
  maxWidth: 'calc(100% - 2rem)',
  gap: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid rgba(228, 228, 231, 1)',
  padding: '1.5rem',
  backgroundColor: '#fff',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  outline: 'none',
  '@media': {
    '(min-width: 640px)': {
      maxWidth: '32rem',
    },
    '(prefers-color-scheme: dark)': {
      backgroundColor: '#171717',
      borderColor: '#262626',
    },
  },
})

globalStyle(`${popup}[data-open]`, {
  animation: `${contentIn} 150ms ease-out`,
})

globalStyle(`${popup}[data-closed]`, {
  animation: `${contentOut} 100ms ease-in`,
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
  borderRadius: '0.125rem',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  opacity: 0.7,
  color: 'inherit',
  transition: 'opacity 0.15s ease',
  ':hover': {
    opacity: 1,
  },
  ':focus': {
    outline: 'none',
    boxShadow: '0 0 0 2px #fff, 0 0 0 4px rgba(161, 161, 170, 0.5)',
  },
  selectors: {
    '&:disabled': {
      pointerEvents: 'none',
    },
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
  gap: '0.5rem',
  textAlign: 'center',
  '@media': {
    '(min-width: 640px)': {
      textAlign: 'left',
    },
  },
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
  color: 'rgb(9, 9, 11)',
  '@media': {
    '(prefers-color-scheme: dark)': {
      color: '#fafafa',
    },
  },
})

export const description = style({
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  color: 'rgb(113, 113, 122)',
  '@media': {
    '(prefers-color-scheme: dark)': {
      color: '#a3a3a3',
    },
  },
})
