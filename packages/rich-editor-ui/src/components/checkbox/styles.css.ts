import { vars } from '@haklex/rich-style-token'
import { keyframes, style } from '@vanilla-extract/css'

const checkboxBounce = keyframes({
  '0%': { transform: 'scale(1)' },
  '40%': { transform: 'scale(0.85)' },
  '100%': { transform: 'scale(1)' },
})

const checkboxRipple = keyframes({
  '0%': {
    boxShadow: `0 0 0 0 color-mix(in srgb, ${vars.color.accent} 40%, transparent)`,
  },
  '100%': { boxShadow: '0 0 0 6px transparent' },
})

export const root = style({
  display: 'inline-flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  borderRadius: '0.5rem',
  padding: '0.25rem',
  textAlign: 'left',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  color: 'inherit',
  ':focus-visible': {
    outline: `2px solid ${vars.color.accent}`,
    outlineOffset: '2px',
  },
})

export const rootDisabled = style({
  cursor: 'not-allowed',
  opacity: 0.5,
})

export const box = style({
  position: 'relative',
  display: 'flex',
  width: '1.125rem',
  height: '1.125rem',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '0.3rem',
  borderWidth: '2px',
  borderStyle: 'solid',
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  boxSizing: 'border-box',
})

export const boxUnchecked = style({
  borderColor: `color-mix(in srgb, ${vars.color.textSecondary} 50%, transparent)`,
  backgroundColor: 'transparent',
})

export const boxChecked = style({
  borderColor: vars.color.accent,
  backgroundColor: vars.color.accent,
})

export const boxBouncing = style({
  animation: `${checkboxBounce} 0.4s ease-out`,
})

export const checkmark = style({
  width: '0.75rem',
  height: '0.75rem',
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
})

export const checkmarkVisible = style({
  opacity: 1,
  transform: 'scale(1)',
})

export const checkmarkHidden = style({
  opacity: 0,
  transform: 'scale(0.5)',
})

export const ripple = style({
  position: 'absolute',
  inset: 0,
  borderRadius: '0.3rem',
  pointerEvents: 'none',
})

export const rippleActive = style({
  animation: `${checkboxRipple} 0.4s ease-out`,
})

export const labelArea = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
})

export const label = style({
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1.25,
  color: vars.color.text,
  transition: 'color 0.2s',
})

export const labelDisabled = style({
  color: vars.color.textSecondary,
})

export const description = style({
  fontSize: '0.75rem',
  lineHeight: 1.25,
  color: vars.color.textSecondary,
})
