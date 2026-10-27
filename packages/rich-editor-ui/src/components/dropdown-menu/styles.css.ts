import { style } from '@vanilla-extract/css';

import {
  applyItemSvgStyles,
  destructive as sharedDestructive,
  itemBase,
  label as sharedLabel,
  popupBase,
  separator as sharedSeparator,
  shortcut as sharedShortcut,
} from '../../styles/menu.css';

export const popup = style({
  ...popupBase,
  maxWidth: 'min(20rem, calc(100vw - 0.75rem))',
});

export const positioner = style({
  outline: 'none',
  zIndex: 50,
  isolation: 'isolate',
});

export const item = style(itemBase);

applyItemSvgStyles(item);

export const separator = sharedSeparator;
export const label = sharedLabel;
export const shortcut = sharedShortcut;
export const destructive = sharedDestructive;

const itemWithIndicator = style({
  paddingRight: '32px',
});

export const checkboxItem = itemWithIndicator;
export const radioItem = itemWithIndicator;

const indicator = style({
  position: 'absolute',
  right: '8px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  flexShrink: 0,
  pointerEvents: 'none',
  color: 'inherit',
});

export const checkboxIndicator = indicator;
export const radioIndicator = indicator;
