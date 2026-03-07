import { vars } from '@haklex/rich-style-token'
import { style } from '@vanilla-extract/css'

import { applyItemSvgStyles, itemBase, popupBase } from '../../styles/menu.css'

export const popup = style({
  ...popupBase,
  maxHeight: 'min(var(--available-height), 16rem)',
})

export const item = style(itemBase)

applyItemSvgStyles(item)

export const empty = style({
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.textSecondary,
  textAlign: 'center',
})
