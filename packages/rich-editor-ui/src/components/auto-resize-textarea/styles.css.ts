import {
  chromeMotion,
  chromeRadius,
  chromeText,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const textarea = style({
  ...chromeText.item,
  'display': 'block',
  'width': '100%',
  'minHeight': '28px',
  'boxSizing': 'border-box',
  'resize': 'none',
  'overflow': 'hidden',
  'border': 'none',
  'borderRadius': chromeRadius.md,
  'padding': '4px 10px',
  'outline': 'none',
  'background': vars.color.bg,
  'boxShadow': vars.boxShadow.xs,
  'color': vars.color.text,
  'fontFamily': vars.typography.fontFamilySans,
  'transition': `box-shadow ${chromeMotion.state} ease, background-color ${chromeMotion.state} ease`,
  '::placeholder': {
    color: vars.color.textTertiary,
  },
  ':hover': {
    background: vars.color.bgSecondary,
  },
  ':focus-visible': {
    background: vars.color.bg,
    boxShadow: focusRing,
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  'selectors': {
    '&[aria-invalid="true"]': {
      boxShadow: `0 0 0 1px ${vars.color.alertCaution}`,
    },
    '&[aria-invalid="true"]:focus-visible': {
      boxShadow: `0 0 0 1px ${vars.color.alertCaution}, 0 0 0 3px color-mix(in srgb, ${vars.color.alertCaution} 16%, transparent)`,
    },
  },
});

export const overflowing = style({
  overflowY: 'auto',
});
