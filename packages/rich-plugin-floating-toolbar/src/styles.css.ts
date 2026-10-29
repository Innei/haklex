import {
  chromeMotion,
  chromeRadius,
  chromeTypography,
  chromeWidth,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, keyframes, style } from '@vanilla-extract/css';

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'scale(0.97)' },
  to: { opacity: 1, transform: 'scale(1)' },
});

export const toolbar = style({
  'display': 'flex',
  'alignItems': 'center',
  ...chromeTypography,
  'gap': 2,
  'padding': 4,
  'boxSizing': 'border-box',
  'borderRadius': chromeRadius.lg,
  'backgroundColor': vars.color.bgElevated,
  'boxShadow': vars.boxShadow.menu,
  'animation': `${fadeIn} ${chromeMotion.popupIn}`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animationName: 'none',
    },
  },
});

export const toolbarLink = style({
  width: chromeWidth.md,
  paddingLeft: 10,
  gap: 6,
});

export const toolbarRuby = style({
  width: chromeWidth.sm,
  paddingLeft: 10,
  gap: 6,
});

export const btn = style({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 28,
  'height': 28,
  'flexShrink': 0,
  'border': 'none',
  'background': 'none',
  'borderRadius': chromeRadius.md,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'padding': 0,
  'outline': 'none',
  'transition': `color ${chromeMotion.state} ease, background-color ${chromeMotion.state} ease`,
  ':hover': {
    color: vars.color.text,
    backgroundColor: vars.color.fillSecondary,
  },
  ':active': {
    backgroundColor: vars.color.fill,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
  'selectors': {
    '&[aria-pressed="true"], &[data-popup-open]': {
      color: vars.color.text,
      backgroundColor: vars.color.fill,
    },
  },
});

export const colorTrigger = style({
  selectors: {
    '&&': {
      height: 28,
    },
  },
});

export const separator = style({
  width: 1,
  height: 16,
  backgroundColor: vars.color.borderSubtle,
  marginInline: 4,
  flexShrink: 0,
});

export const inputRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flex: 1,
  minWidth: 0,
});

export const inputIcon = style({
  display: 'flex',
  flexShrink: 0,
  color: vars.color.textTertiary,
});

export const inlineInput = style({
  selectors: {
    '&&': {
      flex: 1,
      minWidth: 0,
      padding: 0,
      background: 'transparent',
      boxShadow: 'none',
    },
    '&&:focus-visible': {
      boxShadow: 'none',
    },
  },
});

globalStyle(`${inputRow} kbd`, {
  marginRight: -2,
});
