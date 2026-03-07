import { vars } from '@haklex/rich-style-token/styles'
import { keyframes, style } from '@vanilla-extract/css'

/** Vercel-inspired line tooltip: thin border, minimal shadow, clean typography */
const tooltipIn = keyframes({
  from: { opacity: 0, transform: 'translateY(2px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
})

const tooltipOut = keyframes({
  from: { opacity: 1, transform: 'translateY(0)' },
  to: { opacity: 0, transform: 'translateY(2px)' },
})

export const positioner = style({
  zIndex: 50,
  outline: 'none',
})

export const popup = style({
  maxWidth: 320,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.typography.fontSizeXs,
  lineHeight: 1.4,
  color: vars.color.text,
  backgroundColor: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.md,
  boxShadow: vars.boxShadow.menu,
  outline: 'none',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  pointerEvents: 'none',
  transition: 'opacity 120ms ease-out, transform 120ms ease-out',
  selectors: {
    '&[data-open]': {
      animation: `${tooltipIn} 120ms ease-out`,
    },
    '&[data-ending-style]': {
      opacity: 0,
      transform: 'translateY(2px)',
    },
    '&[data-closed]': {
      animation: `${tooltipOut} 120ms ease-in`,
    },
  },
})
