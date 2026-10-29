import {
  chromeHeight,
  chromeMotion,
  chromeRadius,
  chromeText,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const input = style({
  ...chromeText.control,
  'height': chromeHeight.md,
  'width': '100%',
  'minWidth': 0,
  'boxSizing': 'border-box',
  'margin': 0,
  'padding': '0 8px',
  'border': 'none',
  'borderRadius': chromeRadius.md,
  'outline': 'none',
  'backgroundColor': vars.color.bg,
  'boxShadow': vars.boxShadow.xs,
  'color': vars.color.text,
  'fontFamily': vars.typography.fontFamilySans,
  'transition': `box-shadow ${chromeMotion.state} ease`,
  '::placeholder': {
    color: vars.color.textTertiary,
  },
  ':focus': {
    boxShadow: focusRing,
  },
  'selectors': {
    '&[aria-invalid="true"]': {
      boxShadow: `0 0 0 1px ${vars.color.alertCaution}, 0 0 0 3px color-mix(in srgb, ${vars.color.alertCaution} 16%, transparent)`,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const mono = style({
  fontFamily: vars.typography.fontMono,
  fontSize: '12px',
});
