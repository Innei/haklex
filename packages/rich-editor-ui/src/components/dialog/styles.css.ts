import { vars } from '@haklex/rich-style-token/styles'
import { globalStyle, keyframes, style } from '@vanilla-extract/css'

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

const fadeOut = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
})

const contentIn = keyframes({
  from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.95)' },
  to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
})

const contentOut = keyframes({
  from: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
  to: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.95)' },
})

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  selectors: {
    '&[data-open]': {
      animation: `${fadeIn} 250ms ease-out`,
    },
    '&[data-closed]': {
      animation: `${fadeOut} 200ms ease-in`,
    },
  },
})

export const popup = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 50,
  display: 'grid',
  width: '100%',
  maxWidth: 'calc(100% - 2rem)',
  gap: '1rem',
  borderRadius: '0.75rem',
  border: `1px solid ${vars.color.border}`,
  padding: '1.5rem',
  fontFamily: vars.typography.fontFamilySans,

  lineHeight: '1.43',
  color: vars.color.text,
  backgroundColor: vars.color.bg,
  boxShadow: vars.boxShadow.modal,
  outline: 'none',
  selectors: {
    '&[data-open]': {
      animation: `${contentIn} 150ms ease-out`,
    },
    '&[data-closed]': {
      animation: `${contentOut} 100ms ease-in`,
    },
  },
  '@media': {
    '(min-width: 640px)': {
      maxWidth: '28rem',
    },
  },
})

export const closeButton = style({
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  borderRadius: '0.25rem',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  opacity: 0.7,
  color: vars.color.textSecondary,
  transition: 'opacity 0.2s ease, color 0.2s ease',
  ':hover': {
    opacity: 1,
    color: vars.color.text,
  },
  ':focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 2px ${vars.color.bg}, 0 0 0 4px ${vars.color.textSecondary}`,
  },
  selectors: {
    '&:disabled': {
      pointerEvents: 'none',
      opacity: 0.5,
    },
  },
})

globalStyle(`${closeButton} svg`, {
  width: 16,
  height: 16,
  pointerEvents: 'none',
  flexShrink: 0,
})

export const header = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
  textAlign: 'center',
  '@media': {
    '(min-width: 640px)': {
      textAlign: 'left',
    },
  },
})

export const footer = style({
  display: 'flex',
  flexDirection: 'column-reverse',
  gap: '0.5rem',
  paddingTop: '0.25rem',
  '@media': {
    '(min-width: 640px)': {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  },
})

export const title = style({
  fontFamily: vars.typography.fontFamily,
  fontSize: '1.125em',
  fontWeight: 600,
  lineHeight: '1.33',
  letterSpacing: '-0.015em',
  color: vars.color.text,
})

export const description = style({
  fontFamily: vars.typography.fontFamily,
  fontSize: vars.typography.fontSizeMd,
  lineHeight: '1.43',
  color: vars.color.textSecondary,
})

// -- Bottom Sheet --

const slideUp = keyframes({
  from: { transform: 'translateY(100%)' },
  to: { transform: 'translateY(0)' },
})

const slideDown = keyframes({
  from: { transform: 'translateY(0)' },
  to: { transform: 'translateY(100%)' },
})

export const sheetBackdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  transition: 'opacity 200ms ease',
})

export const sheetContainer = style({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '85vh',
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  backgroundColor: vars.color.bg,
  color: vars.color.text,
  fontFamily: vars.typography.fontFamilySans,
  boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.15)',
  willChange: 'transform',
  selectors: {
    '&[data-open]': {
      animation: `${slideUp} 300ms cubic-bezier(0.32, 0.72, 0, 1)`,
    },
    '&[data-closed]': {
      animation: `${slideDown} 200ms ease-in`,
    },
  },
})

export const sheetDragHandle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 0 4px',
  cursor: 'grab',
  flexShrink: 0,
  touchAction: 'none',
  ':active': {
    cursor: 'grabbing',
  },
})

export const sheetDragPill = style({
  width: 36,
  height: 4,
  borderRadius: 2,
  backgroundColor: vars.color.textTertiary,
  opacity: 0.5,
})

export const sheetContent = style({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '0 1.5rem 1.5rem',
  WebkitOverflowScrolling: 'touch',
})

export const sheetHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
  textAlign: 'center',
  padding: '0 1.5rem 0.5rem',
})
