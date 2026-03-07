import { vars } from '@haklex/rich-style-token'
import type { StyleRule } from '@vanilla-extract/css'
import { globalStyle, keyframes, style } from '@vanilla-extract/css'

const popupIn = keyframes({
  from: { opacity: 0, transform: 'scale(0.95)' },
  to: { opacity: 1, transform: 'scale(1)' },
})

const popupOut = keyframes({
  from: { opacity: 1, transform: 'scale(1)' },
  to: { opacity: 0, transform: 'scale(0.95)' },
})

export const popupBase: StyleRule = {
  minWidth: '8rem',
  borderRadius: vars.borderRadius.lg,
  padding: vars.spacing.xs,
  backgroundColor: vars.color.bg,
  boxShadow: `0 0 0 1px color-mix(in srgb, ${vars.color.text} 10%, transparent), ${vars.boxShadow.menu}`,
  outline: 'none',
  color: vars.color.text,
  fontFamily: vars.typography.fontFamilySans,
  fontSize: vars.typography.fontSizeSmall,
  zIndex: 50,
  maxHeight: 'var(--available-height)',
  overflowX: 'hidden',
  overflowY: 'auto',
  transformOrigin: 'var(--transform-origin)',
  transition: 'opacity 100ms ease-out, transform 100ms ease-out',
  selectors: {
    '&[data-open]': {
      animation: `${popupIn} 100ms ease-out`,
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
      animation: `${popupOut} 100ms ease-in`,
      overflow: 'hidden',
    },
  },
}

export const itemBase: StyleRule = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  borderRadius: vars.borderRadius.md,
  padding: `${vars.spacing.xs} ${vars.spacing.md} ${vars.spacing.xs} ${vars.spacing.sm}`,
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
}

export function applyItemSvgStyles(itemClass: string) {
  globalStyle(`${itemClass} svg`, {
    pointerEvents: 'none',
    flexShrink: 0,
    width: '1rem',
    height: '1rem',
    color: vars.color.textSecondary,
    transition: 'color 100ms ease',
  })

  globalStyle(`${itemClass}[data-highlighted] svg`, {
    color: vars.color.text,
  })
}

export const separator = style({
  height: '1px',
  backgroundColor: vars.color.hrBorder,
  margin: '0.25rem -0.25rem',
})

export const label = style({
  fontSize: vars.typography.fontSizeXs,
  fontWeight: 500,
  lineHeight: 1.4,
  color: vars.color.textTertiary,
  padding: '0.25rem 0.375rem',
})
