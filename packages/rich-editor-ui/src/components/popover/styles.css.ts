import { globalStyle, keyframes, style } from '@vanilla-extract/css'

const popoverIn = keyframes({
  from: { opacity: 0, transform: 'translateY(2px) scale(0.96)' },
  to: { opacity: 1, transform: 'translateY(0) scale(1)' },
})

export const popup = style({
  zIndex: 50,
  width: 288,
  borderRadius: '0.5rem',
  border: '1px solid rgba(228, 228, 231, 1)',
  padding: '1rem',
  backgroundColor: '#fff',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  outline: 'none',
  '@media': {
    '(prefers-color-scheme: dark)': {
      backgroundColor: '#0a0a0a',
      border: '1px solid #262626',
    },
  },
})

globalStyle(`${popup}[data-open]`, {
  animation: `${popoverIn} 150ms ease-out`,
})

globalStyle(`${popup}[data-ending-style]`, {
  opacity: 0,
  transform: 'translateY(2px) scale(0.96)',
})

export const arrow = style({
  width: 10,
  height: 10,
  transformOrigin: 'center',
})

globalStyle(`${arrow} > polygon`, {
  fill: '#fff',
  '@media': {
    '(prefers-color-scheme: dark)': {
      fill: '#0a0a0a',
    },
  },
})

globalStyle(`${arrow} > polyline`, {
  stroke: 'rgba(228, 228, 231, 1)',
  fill: 'none',
  '@media': {
    '(prefers-color-scheme: dark)': {
      stroke: '#262626',
    },
  },
})

export const title = style({
  fontSize: '0.875rem',
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
  marginTop: '0.25rem',
  '@media': {
    '(prefers-color-scheme: dark)': {
      color: '#a3a3a3',
    },
  },
})
