import { vars } from '@haklex/rich-style-token/styles'
import { keyframes, style } from '@vanilla-extract/css'

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
  color: vars.color.textSecondary,
  transition: 'color 0.1s, background-color 0.1s',
  ':hover': {
    color: vars.color.text,
    backgroundColor: `color-mix(in srgb, ${vars.color.text} 4%, transparent)`,
  },
})

export const triggerLabel = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
})

export const triggerLetter = style({
  fontSize: vars.typography.fontSizeXs,
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
  selectors: {
    '&[data-open]': {
      animation: `${fadeIn} 120ms ease-out`,
    },
  },
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
    backgroundColor: `color-mix(in srgb, ${vars.color.text} 4%, transparent)`,
  },
})

export const swatchDot = style({
  width: 16,
  height: 16,
  borderRadius: '50%',
  border: `1px solid color-mix(in srgb, ${vars.color.text} 10%, transparent)`,
})

export const swatchCheck = style({
  position: 'absolute',
  width: 10,
  height: 10,
  color: vars.color.bg,
})
