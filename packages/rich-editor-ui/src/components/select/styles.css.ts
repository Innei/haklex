import { vars } from '@haklex/rich-style-token/styles'
import { globalStyle, keyframes, style } from '@vanilla-extract/css'

// --- Animations ---

const fadeInZoom = keyframes({
  from: { opacity: 0, transform: 'scale(0.95)' },
  to: { opacity: 1, transform: 'scale(1)' },
})

const fadeOutZoom = keyframes({
  from: { opacity: 1, transform: 'scale(1)' },
  to: { opacity: 0, transform: 'scale(0.95)' },
})

// --- Trigger ---

export const triggerButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'space-between',
  'gap': '6px',
  'height': '36px',
  'padding': '8px 8px 8px 10px',
  'fontSize': vars.typography.fontSizeSmall,
  'lineHeight': 1.35,
  'fontFamily': vars.typography.fontFamilySans,
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': vars.borderRadius.md,
  'background': 'transparent',
  'color': vars.color.text,
  'cursor': 'pointer',
  'outline': 'none',
  'whiteSpace': 'nowrap',
  'boxShadow': `0 1px 2px rgba(0, 0, 0, 0.05)`,
  'transition': 'color 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
  ':hover': {
    background: vars.color.fillQuaternary,
  },
  ':focus-visible': {
    borderColor: vars.color.accent,
    boxShadow: `0 0 0 3px ${vars.color.accentLight}`,
  },
  'selectors': {
    '&[data-popup-open]': {
      background: vars.color.fillQuaternary,
    },
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
})

export const triggerIcon = style({
  width: '16px',
  height: '16px',
  color: vars.color.textTertiary,
  flexShrink: 0,
  pointerEvents: 'none',
})

// --- Positioner ---

export const positioner = style({
  outline: 'none',
  zIndex: 50,
  isolation: 'isolate',
})

// --- Popup / Content ---

export const popup = style({
  background: vars.color.bg,
  color: vars.color.text,
  fontFamily: vars.typography.fontFamilySans,
  fontSize: vars.typography.fontSizeSmall,
  borderRadius: vars.borderRadius.md,
  boxShadow: `0 0 0 1px color-mix(in srgb, ${vars.color.text} 10%, transparent), ${vars.boxShadow.menu}`,
  width: 'min(var(--anchor-width), calc(100vw - 0.75rem))',
  maxWidth: 'calc(100vw - 0.75rem)',
  maxHeight: 'var(--available-height)',
  overflowX: 'hidden',
  overflowY: 'auto',
  outline: 'none',
  transformOrigin: 'var(--transform-origin)',
  transition: 'opacity 100ms ease-out, transform 100ms ease-out',
  selectors: {
    '&[data-open]': {
      animation: `${fadeInZoom} 100ms ease-out`,
    },
    '&[data-starting-style]': {
      opacity: 0,
      transform: 'scale(0.95)',
    },
    '&[data-ending-style]': {
      opacity: 0,
      transform: 'scale(0.95)',
    },
    '&[data-closed]': {
      animation: `${fadeOutZoom} 100ms ease-in`,
      overflow: 'hidden',
    },
  },
})

// --- Group ---

export const group = style({
  padding: '4px',
  selectors: {
    '& + &': {
      borderTop: `1px solid ${vars.color.hrBorder}`,
    },
  },
})

// --- Item ---

export const item = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 32px 6px 8px',
  borderRadius: vars.borderRadius.sm,
  fontSize: vars.typography.fontSizeSmall,
  lineHeight: 1.35,
  outline: 'none',
  userSelect: 'none',
  cursor: 'default',
  color: vars.color.text,
  position: 'relative',
  transition: 'background-color 100ms ease, color 100ms ease',
  selectors: {
    '&[data-highlighted]': {
      backgroundColor: vars.color.fillSecondary,
      color: vars.color.text,
    },
    '&[data-disabled]': {
      opacity: 0.5,
      pointerEvents: 'none',
    },
  },
})

globalStyle(`${item} svg`, {
  pointerEvents: 'none',
  flexShrink: 0,
  width: '16px',
  height: '16px',
})

// --- Item Indicator (check mark) ---

export const itemIndicator = style({
  position: 'absolute',
  right: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  pointerEvents: 'none',
  color: vars.color.textSecondary,
})

globalStyle(`${item}[data-highlighted] ${itemIndicator}`, {
  color: vars.color.text,
})

// --- Group Label ---

export const groupLabel = style({
  padding: '6px 8px',
  fontSize: vars.typography.fontSizeXs,
  fontWeight: 500,
  lineHeight: 1.4,
  color: vars.color.textTertiary,
})

// --- Separator ---

export const separator = style({
  height: '1px',
  backgroundColor: vars.color.hrBorder,
  margin: '4px -4px',
})

// --- Scroll buttons ---

export const scrollButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '4px 0',
  cursor: 'default',
  color: vars.color.textTertiary,
  background: vars.color.bg,
  zIndex: 10,
})

globalStyle(`${scrollButton} svg`, {
  width: '16px',
  height: '16px',
})
