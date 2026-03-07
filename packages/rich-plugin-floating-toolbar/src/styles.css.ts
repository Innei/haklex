import { vars } from '@haklex/rich-style-token/styles'
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
  border: `1px solid ${vars.color.border}`,
  backgroundColor: `color-mix(in srgb, ${vars.color.bg} 95%, transparent)`,
  backdropFilter: 'blur(8px)',
  boxShadow: vars.boxShadow.topBar,
  animation: `${fadeIn} 150ms ease-out`,
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
  color: vars.color.textSecondary,
  cursor: 'pointer',
  padding: 0,
  transition: 'color 0.1s, background-color 0.1s',
  ':hover': {
    color: vars.color.text,
    backgroundColor: `color-mix(in srgb, ${vars.color.text} 4%, transparent)`,
  },
})

export const btnActive = style({
  color: vars.color.text,
  backgroundColor: `color-mix(in srgb, ${vars.color.text} 6%, transparent)`,
})

export const btnIndicator = style({
  position: 'absolute',
  bottom: 2,
  left: '50%',
  transform: 'translateX(-50%)',
  height: 2,
  width: 14,
  borderRadius: 1,
  backgroundColor: vars.color.text,
})

export const rubyEditor = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  padding: '12px 16px',
  borderRadius: 12,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: `color-mix(in srgb, ${vars.color.bg} 95%, transparent)`,
  backdropFilter: 'blur(8px)',
  boxShadow: vars.boxShadow.topBar,
  animation: `${fadeIn} 150ms ease-out`,
  minWidth: 240,
})

export const rubyPreview = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  padding: '4px 16px 8px',
})

export const rubyPreviewReading = style({
  fontSize: 12,
  color: vars.color.textSecondary,
  lineHeight: 1.2,
})

export const rubyPreviewBase = style({
  fontSize: 20,
  fontWeight: 600,
  lineHeight: 1.3,
})

export const rubyInputRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  width: '100%',
})

export const rubyInput = style({
  flex: 1,
  padding: '6px 10px',
  borderRadius: 8,
  border: `1.5px solid ${vars.color.border}`,
  backgroundColor: 'transparent',
  color: vars.color.text,
  fontSize: 14,
  outline: 'none',
  lineHeight: 1.4,
  selectors: {
    '&:focus': {
      borderColor: vars.color.text,
    },
  },
})

export const rubyActionBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  border: 'none',
  background: 'none',
  borderRadius: 6,
  color: vars.color.textSecondary,
  cursor: 'pointer',
  padding: 0,
  transition: 'color 0.1s, background-color 0.1s',
  ':hover': {
    backgroundColor: `color-mix(in srgb, ${vars.color.text} 6%, transparent)`,
  },
})

export const rubyHint = style({
  fontSize: 11,
  color: vars.color.textSecondary,
  opacity: 0.7,
})

export const separator = style({
  width: 1,
  height: 20,
  backgroundColor: vars.color.border,
  marginInline: 2,
  flexShrink: 0,
})
