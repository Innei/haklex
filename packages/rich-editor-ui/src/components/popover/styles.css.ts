import { globalStyle, style } from '@vanilla-extract/css'

export const popup = style({
  width: 288,
  borderRadius: '0.5rem',
  border: '1px solid rgba(228, 228, 231, 1)',
  padding: '1rem',
  backgroundColor: '#fff',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  outline: 'none',
  '@media': {
    '(prefers-color-scheme: dark)': {
      backgroundColor: 'rgb(9, 9, 11)',
      border: '1px solid rgba(39, 39, 42, 1)',
    },
  },
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
      fill: 'rgb(9, 9, 11)',
    },
  },
})

globalStyle(`${arrow} > polyline`, {
  stroke: 'rgba(228, 228, 231, 1)',
  fill: 'none',
  '@media': {
    '(prefers-color-scheme: dark)': {
      stroke: 'rgba(39, 39, 42, 1)',
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
      color: 'rgb(250, 250, 250)',
    },
  },
})

export const description = style({
  fontSize: '0.8125rem',
  color: 'rgb(113, 113, 122)',
  '@media': {
    '(prefers-color-scheme: dark)': {
      color: 'rgb(161, 161, 170)',
    },
  },
})
