import { vars } from '@shiro/rich-style-token'
import { globalStyle, keyframes, style } from '@vanilla-extract/css'

const popoverIn = keyframes({
  from: { opacity: 0, transform: 'translateY(2px) scale(0.96)' },
  to: { opacity: 1, transform: 'translateY(0) scale(1)' },
})

const popoverOut = keyframes({
  from: { opacity: 1, transform: 'translateY(0) scale(1)' },
  to: { opacity: 0, transform: 'translateY(2px) scale(0.96)' },
})

export const popup = style({
  zIndex: 50,
  width: 288,
  borderRadius: '0.5rem',
  border: `1px solid ${vars.color.border}`,
  padding: '1rem',
  backgroundColor: vars.color.bg,
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  outline: 'none',
  transition: 'opacity 150ms ease-out, transform 150ms ease-out',
})

globalStyle(`${popup}[data-open]`, {
  animation: `${popoverIn} 150ms ease-out`,
})

globalStyle(`${popup}[data-ending-style]`, {
  opacity: 0,
  transform: 'translateY(2px) scale(0.96)',
})

globalStyle(`${popup}[data-closed]`, {
  animation: `${popoverOut} 150ms ease-in`,
})

export const arrow = style({
  width: 10,
  height: 10,
  transformOrigin: 'center',
})

globalStyle(`${arrow} > polygon`, {
  fill: vars.color.bg,
})

globalStyle(`${arrow} > polyline`, {
  stroke: vars.color.border,
  fill: 'none',
})

export const title = style({
  fontSize: '0.875rem',
  fontWeight: 600,
  lineHeight: 1,
  color: vars.color.text,
})

export const description = style({
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  color: vars.color.textSecondary,
  marginTop: '0.25rem',
})
