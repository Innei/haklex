import {
  chromeMotion,
  chromeRadius,
  chromeText,
  chromeTypography,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

const stateTransition = `color ${chromeMotion.state} ease, background-color ${chromeMotion.state} ease`;

export const toolbarContainer = style({
  ...chromeTypography,
  position: 'sticky',
  top: 0,
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  boxSizing: 'border-box',
  backgroundColor: vars.color.bg,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
});

export const toolbarRow = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 2,
  flexWrap: 'nowrap',
  height: 40,
  boxSizing: 'border-box',
  padding: '0 8px',
  minWidth: 0,
  overflow: 'hidden',
});

export const toolbarButton = style({
  'position': 'relative',
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'flexShrink': 0,
  'width': 28,
  'height': 28,
  'border': 'none',
  'background': 'transparent',
  'borderRadius': chromeRadius.md,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'padding': 0,
  'outline': 'none',
  'transition': stateTransition,
  ':hover': {
    backgroundColor: vars.color.fillSecondary,
    color: vars.color.text,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
  'selectors': {
    '&:active': {
      backgroundColor: vars.color.fill,
    },
    '&[data-popup-open]': {
      backgroundColor: vars.color.fill,
      color: vars.color.text,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'default',
      backgroundColor: 'transparent',
      color: vars.color.textSecondary,
    },
  },
});

globalStyle(`${toolbarButton} svg`, {
  width: 16,
  height: 16,
  strokeWidth: 2,
});

export const toolbarButtonActive = style({
  selectors: {
    '&&': {
      color: vars.color.text,
      backgroundColor: vars.color.fill,
    },
  },
});

export const toolbarDropdownTrigger = style({
  ...chromeText.control,
  'display': 'inline-flex',
  'alignItems': 'center',
  'flexShrink': 0,
  'gap': 4,
  'height': 28,
  'boxSizing': 'border-box',
  'padding': '0 6px 0 8px',
  'border': 'none',
  'background': 'transparent',
  'borderRadius': chromeRadius.md,
  'color': vars.color.text,
  'cursor': 'pointer',
  'fontFamily': vars.typography.fontFamilySans,
  'fontWeight': 500,
  'whiteSpace': 'nowrap',
  'outline': 'none',
  'transition': stateTransition,
  ':hover': {
    backgroundColor: vars.color.fillSecondary,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
  'selectors': {
    '&[data-popup-open]': {
      backgroundColor: vars.color.fill,
    },
  },
});

export const toolbarDropdownTriggerChevron = style({
  marginLeft: 'auto',
  display: 'inline-flex',
  flexShrink: 0,
  color: vars.color.textTertiary,
});

export const toolbarSeparator = style({
  width: 1,
  height: 16,
  backgroundColor: vars.color.borderSubtle,
  marginInline: 6,
  flexShrink: 0,
});

export const insertSearch = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  padding: 8,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
});

export const insertSearchIcon = style({
  position: 'absolute',
  left: 16,
  color: vars.color.textTertiary,
  pointerEvents: 'none',
});

export const insertSearchInput = style({
  selectors: {
    '&&': { paddingLeft: 28 },
  },
});
