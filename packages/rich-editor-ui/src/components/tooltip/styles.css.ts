import { vars } from '@shiro/rich-style-token'
import { globalStyle, keyframes, style } from '@vanilla-extract/css'

/** Vercel-inspired line tooltip: thin border, minimal shadow, clean typography */
const tooltipIn = keyframes({
  from: { opacity: 0, transform: 'translateY(2px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
})

const tooltipOut = keyframes({
  from: { opacity: 1, transform: 'translateY(0)' },
  to: { opacity: 0, transform: 'translateY(2px)' },
})

export const popup = style({
  zIndex: 50,
  maxWidth: 320,
  padding: '6px 10px',
  fontSize: vars.typography.fontSizeSmall,
  lineHeight: 1.4,
  color: vars.color.text,
  backgroundColor: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.md,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  outline: 'none',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  pointerEvents: 'none',
  transition: 'opacity 120ms ease-out, transform 120ms ease-out',
})

globalStyle(`${popup}[data-open]`, {
  animation: `${tooltipIn} 120ms ease-out`,
})

globalStyle(`${popup}[data-ending-style]`, {
  opacity: 0,
  transform: 'translateY(2px)',
})

globalStyle(`${popup}[data-closed]`, {
  animation: `${tooltipOut} 120ms ease-in`,
})
