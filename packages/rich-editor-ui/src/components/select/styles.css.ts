import {
  chromeHeight,
  chromeMotion,
  chromeRadius,
  chromeText,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

import {
  applyItemSvgStyles,
  itemBase,
  label,
  popupBase,
  separator as sharedSeparator,
} from '../../styles/menu.css';

export const triggerButton = style({
  ...chromeText.control,
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'space-between',
  'gap': '6px',
  'height': chromeHeight.md,
  'boxSizing': 'border-box',
  'padding': '0 6px 0 10px',
  'fontFamily': vars.typography.fontFamilySans,
  'border': 'none',
  'borderRadius': chromeRadius.md,
  'background': 'transparent',
  'color': vars.color.text,
  'cursor': 'pointer',
  'outline': 'none',
  'whiteSpace': 'nowrap',
  'boxShadow': vars.boxShadow.xs,
  'transition': `background-color ${chromeMotion.state} ease, box-shadow ${chromeMotion.state} ease`,
  ':hover': {
    background: vars.color.fillSecondary,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
  'selectors': {
    '&[data-popup-open]': {
      background: vars.color.fill,
    },
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const triggerIcon = style({
  width: '16px',
  height: '16px',
  color: vars.color.textTertiary,
  flexShrink: 0,
  pointerEvents: 'none',
});

export const positioner = style({
  outline: 'none',
  zIndex: 50,
  isolation: 'isolate',
});

export const popup = style({
  ...popupBase,
  color: vars.color.text,
  width: 'min(var(--anchor-width), calc(100vw - 0.75rem))',
  maxWidth: 'calc(100vw - 0.75rem)',
});

export const group = style({});

export const item = style({
  ...itemBase,
  paddingRight: '32px',
});

applyItemSvgStyles(item);

export const itemIndicator = style({
  position: 'absolute',
  right: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  pointerEvents: 'none',
  color: vars.color.text,
});

globalStyle(`${itemIndicator} svg`, {
  width: '16px',
  height: '16px',
});

export const groupLabel = label;

export const separator = sharedSeparator;

export const scrollButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '4px 0',
  cursor: 'default',
  color: vars.color.textTertiary,
  background: vars.color.bgElevated,
  zIndex: 10,
});

globalStyle(`${scrollButton} svg`, {
  width: '16px',
  height: '16px',
});
