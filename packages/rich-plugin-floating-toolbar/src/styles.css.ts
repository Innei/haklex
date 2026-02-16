import { keyframes, style } from '@vanilla-extract/css'

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'translateY(4px) scale(0.96)' },
  to: { opacity: 1, transform: 'translateY(0) scale(1)' },
})

export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  padding: '4px 6px',
  borderRadius: 12,
  border: '1px solid rgba(228, 228, 231, 0.8)',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
  animation: `${fadeIn} 150ms ease-out`,
  '@media': {
    '(prefers-color-scheme: dark)': {
      backgroundColor: 'rgba(23, 23, 23, 0.95)',
      borderColor: 'rgba(63, 63, 70, 0.8)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.15)',
    },
  },
})

export const btn = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  border: 'none',
  background: 'none',
  borderRadius: 8,
  color: 'rgb(113, 113, 122)',
  cursor: 'pointer',
  padding: 0,
  transition: 'color 0.1s, background-color 0.1s',
  ':hover': {
    color: 'rgb(9, 9, 11)',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  '@media': {
    '(prefers-color-scheme: dark)': {
      color: '#a3a3a3',
      selectors: {
        '&:hover': {
          color: '#fafafa',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
        },
      },
    },
  },
})

export const btnActive = style({
  color: 'rgb(9, 9, 11)',
  backgroundColor: 'rgba(0, 0, 0, 0.06)',
  '@media': {
    '(prefers-color-scheme: dark)': {
      color: '#fafafa',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
})

export const btnIndicator = style({
  position: 'absolute',
  bottom: 2,
  left: '50%',
  transform: 'translateX(-50%)',
  height: 2,
  width: 14,
  borderRadius: 1,
  backgroundColor: 'rgb(9, 9, 11)',
  '@media': {
    '(prefers-color-scheme: dark)': {
      backgroundColor: '#fafafa',
    },
  },
})

export const separator = style({
  width: 1,
  height: 20,
  backgroundColor: 'rgba(228, 228, 231, 0.8)',
  marginInline: 2,
  flexShrink: 0,
  '@media': {
    '(prefers-color-scheme: dark)': {
      backgroundColor: 'rgba(63, 63, 70, 0.8)',
    },
  },
})
