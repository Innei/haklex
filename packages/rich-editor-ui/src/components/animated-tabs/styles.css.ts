import {
  chromeMotion,
  chromeText,
  chromeTypography,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const root = style({
  ...chromeTypography,
  position: 'relative',
});

export const tablist = style({
  display: 'flex',
});

export const tab = style({
  ...chromeText.control,
  position: 'relative',
  height: '36px',
  boxSizing: 'border-box',
  padding: '0 12px',
  fontFamily: vars.typography.fontFamilySans,
  fontWeight: 500,
  transition: `color ${chromeMotion.state} ease`,
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  color: vars.color.textSecondary,
  outline: 'none',
  selectors: {
    '&:hover': {
      color: vars.color.text,
    },
    '&:focus-visible': {
      borderRadius: '6px',
      boxShadow: focusRing,
    },
  },
});

export const tabActive = style({
  color: vars.color.text,
});

export const border = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '1px',
  backgroundColor: vars.color.borderSubtle,
});

export const indicator = style({
  'position': 'absolute',
  'bottom': 0,
  'height': '2px',
  'backgroundColor': vars.color.text,
  'transition': `left ${chromeMotion.layout}, width ${chromeMotion.layout}`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});
