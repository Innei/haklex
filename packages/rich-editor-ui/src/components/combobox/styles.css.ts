import {
  chromeHeight,
  chromeMotion,
  chromeRadius,
  chromeText,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

import { applyItemSvgStyles, itemBase, popupBase } from '../../styles/menu.css';

export const input = style({
  ...chromeText.control,
  'height': chromeHeight.md,
  'boxSizing': 'border-box',
  'padding': '0 10px',
  'fontFamily': vars.typography.fontFamilySans,
  'color': vars.color.text,
  'background': vars.color.bg,
  'border': 'none',
  'borderRadius': chromeRadius.md,
  'boxShadow': vars.boxShadow.xs,
  'outline': 'none',
  'transition': `box-shadow ${chromeMotion.state} ease`,
  '::placeholder': {
    color: vars.color.textTertiary,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
  'selectors': {
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const popup = style({
  ...popupBase,
  width: 'max-content',
  minWidth: 'max(8rem, var(--anchor-width))',
  maxWidth: 'min(20rem, calc(100vw - 0.75rem))',
  maxHeight: 'min(var(--available-height), 16rem)',
});

export const item = style(itemBase);

applyItemSvgStyles(item);

export const empty = style({
  ...chromeText.control,
  padding: '8px 12px',
  color: vars.color.textTertiary,
  textAlign: 'center',
  selectors: {
    '&:empty': {
      display: 'none',
    },
  },
});
