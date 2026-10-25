import {
  chromeMotion,
  chromeRadius,
  chromeText,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const semanticClassNames = {
  panel: 'rich-link-edit-panel',
  urlRow: 'rich-link-edit-url-row',
  linkIcon: 'rich-link-edit-link-icon',
  input: 'rich-link-edit-input',
  cmdHover: 'rich-link-edit-cmd-hover',
} as const;

export const panel = style({
  selectors: {
    '&&': {
      width: '360px',
      maxWidth: 'calc(100vw - 16px)',
      padding: 0,
      borderRadius: chromeRadius.lg,
    },
  },
});

export const urlRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  height: '40px',
  boxSizing: 'border-box',
  padding: '0 6px 0 12px',
  minWidth: 0,
});

export const editRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  height: '40px',
  boxSizing: 'border-box',
  padding: '0 6px',
  minWidth: 0,
});

export const linkIcon = style({
  display: 'block',
  flexShrink: 0,
  color: vars.color.textTertiary,
});

export const url = style({
  ...chromeText.control,
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  fontFamily: vars.typography.fontFamilySans,
  color: vars.color.text,
});

export const urlEmpty = style({
  color: vars.color.textTertiary,
});

export const actions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  flexShrink: 0,
});

export const extraActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  selectors: {
    '&:empty': {
      display: 'none',
    },
    '&::after': {
      content: "''",
      width: '1px',
      height: '16px',
      margin: '0 4px',
      backgroundColor: vars.color.borderSubtle,
    },
  },
});

export const input = style({
  ...chromeText.control,
  'flex': 1,
  'minWidth': 0,
  'height': '28px',
  'boxSizing': 'border-box',
  'appearance': 'none',
  'padding': '0 8px',
  'border': 'none',
  'borderRadius': chromeRadius.md,
  'backgroundColor': vars.color.bg,
  'boxShadow': vars.boxShadow.xs,
  'color': vars.color.text,
  'fontFamily': vars.typography.fontFamilySans,
  'outline': 'none',
  'transition': `box-shadow ${chromeMotion.state} ease`,
  '::placeholder': {
    color: vars.color.textTertiary,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
});

export const saveKey = style({
  marginRight: '-4px',
});

export const cmdHover = style({});

globalStyle(`${cmdHover} a`, {
  cursor: 'pointer',
  textDecorationLine: 'underline',
});
