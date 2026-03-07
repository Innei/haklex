import { vars } from '@haklex/rich-style-token'
import { style } from '@vanilla-extract/css'

import {
  applyItemSvgStyles,
  itemBase,
  label as sharedLabel,
  popupBase,
  separator as sharedSeparator,
} from '../../styles/menu.css'

export const popup = style({
  ...popupBase,
  maxWidth: 'min(20rem, calc(100vw - 0.75rem))',
})

export const positioner = style({
  outline: 'none',
  zIndex: 50,
  isolation: 'isolate',
  selectors: {
    '&[data-side="bottom"]': {
      transform: 'translateY(2px)',
    },
    '&[data-side="top"]': {
      transform: 'translateY(-2px)',
    },
    '&[data-side="left"]': {
      transform: 'translateX(-2px)',
    },
    '&[data-side="right"]': {
      transform: 'translateX(2px)',
    },
  },
})

export const item = style(itemBase)

applyItemSvgStyles(item)

export const separator = sharedSeparator
export const label = sharedLabel

const itemWithIndicator = style({
  paddingRight: '2rem',
})

export const checkboxItem = itemWithIndicator
export const radioItem = itemWithIndicator

export const checkboxIndicator = style({
  position: 'absolute',
  right: '0.5rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1rem',
  height: '1rem',
  flexShrink: 0,
  pointerEvents: 'none',
  color: vars.color.textSecondary,
})

export const radioIndicator = style({
  position: 'absolute',
  right: '0.5rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1rem',
  height: '1rem',
  flexShrink: 0,
  pointerEvents: 'none',
  color: vars.color.textSecondary,
})
