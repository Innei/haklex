import { chromeTypography, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const toolbarContainer = style({
  display: 'flex',
  flexDirection: 'column',
  ...chromeTypography,
  gap: 4,
  border: 'none',
  borderRadius: vars.borderRadius.lg,
  backgroundColor: vars.color.bg,
  boxShadow: vars.boxShadow.topBar,
  position: 'sticky',
  top: 0,
  zIndex: 50,
  margin: '12px auto 0',
  maxWidth: vars.layout.maxWidth,
});

export const toolbarRow = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  flexWrap: 'wrap',
  minHeight: 36,
  padding: '6px 12px',
});

export const toolbarButton = style({
  'position': 'relative',
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 32,
  'height': 32,
  'border': 'none',
  'background': 'transparent',
  'borderRadius': vars.borderRadius.md,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'padding': 0,
  'transition': 'color 120ms ease-out, background-color 120ms ease-out',
  ':hover': {
    backgroundColor: vars.color.fillSecondary,
    color: vars.color.text,
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
      opacity: 0.35,
      cursor: 'default',
      backgroundColor: 'transparent',
      color: vars.color.textQuaternary,
    },
  },
});

globalStyle(`${toolbarButton} svg`, {
  width: 15,
  height: 15,
  strokeWidth: 2,
});

export const toolbarButtonActive = style({
  'color': vars.color.text,
  'backgroundColor': vars.color.fill,
  ':hover': {
    color: vars.color.text,
    backgroundColor: vars.color.fill,
  },
});

export const toolbarDropdownTrigger = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'gap': 4,
  'height': 32,
  'padding': '0 10px',
  'border': 'none',
  'background': 'transparent',
  'borderRadius': vars.borderRadius.md,
  'color': vars.color.text,
  'cursor': 'pointer',
  'fontFamily': 'inherit',
  'fontSize': 13,
  'fontWeight': 500,
  'lineHeight': 1,
  'transition': 'color 120ms ease-out, background-color 120ms ease-out',
  ':hover': {
    backgroundColor: vars.color.fillSecondary,
    color: vars.color.text,
  },
});

export const toolbarDropdownTriggerChevron = style({
  marginLeft: 'auto',
  display: 'inline-flex',
  flexShrink: 0,
});

export const toolbarSeparator = style({
  width: 1,
  height: 18,
  backgroundColor: vars.color.border,
  marginInline: 6,
  flexShrink: 0,
});

export const toolbarDropdownItemActive = style({
  backgroundColor: vars.color.fill,
  color: vars.color.text,
});

export const tooltipShortcut = style({
  fontSize: 11,
  opacity: 0.7,
  marginLeft: 6,
});
