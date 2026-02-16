import { globalStyle, keyframes, style } from '@vanilla-extract/css'

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'scale(0.95)' },
  to: { opacity: 1, transform: 'scale(1)' },
})

export const trigger = style({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  height: 32,
  padding: '0 6px',
  border: 'none',
  background: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  color: 'rgb(113, 113, 122)',
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

export const triggerLabel = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
})

export const triggerLetter = style({
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1,
})

export const triggerBar = style({
  marginTop: 2,
  height: 2,
  width: 14,
  borderRadius: 1,
})

export const triggerChevron = style({
  width: 12,
  height: 12,
  transition: 'transform 0.15s',
})

export const panel = style({
  padding: 8,
  width: 'auto',
})

globalStyle(`${panel}[data-open]`, {
  animation: `${fadeIn} 120ms ease-out`,
})

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: 4,
})

export const swatch = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  border: 'none',
  background: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  padding: 0,
  transition: 'background-color 0.1s',
  ':hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  '@media': {
    '(prefers-color-scheme: dark)': {
      selectors: {
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
        },
      },
    },
  },
})

export const swatchDot = style({
  width: 16,
  height: 16,
  borderRadius: '50%',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  '@media': {
    '(prefers-color-scheme: dark)': {
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
  },
})

export const swatchCheck = style({
  position: 'absolute',
  width: 10,
  height: 10,
  color: '#fff',
})
