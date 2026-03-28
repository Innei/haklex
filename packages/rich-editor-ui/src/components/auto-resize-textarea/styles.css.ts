import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const textarea = style({
  'width': '100%',
  'resize': 'none',
  'overflow': 'hidden',
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': vars.borderRadius.md,
  'padding': '8px 12px',
  'fontSize': '14px',
  'lineHeight': '1.5',
  'outline': 'none',
  'background': vars.color.bg,
  'color': vars.color.text,
  'fontFamily': 'inherit',
  ':focus': {
    borderColor: vars.color.textQuaternary,
  },
  '::placeholder': {
    color: vars.color.textQuaternary,
  },
});

export const overflowing = style({
  overflowY: 'auto',
});
