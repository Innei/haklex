import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const trigger = style({
  'display': 'flex',
  'alignItems': 'center',
  'gap': '6px',
  'cursor': 'pointer',
  'border': 'none',
  'background': 'none',
  'padding': 0,
  'color': vars.color.textTertiary,
  'fontSize': 'inherit',
  'fontFamily': 'inherit',
  'width': '100%',
  'textAlign': 'left',
  ':hover': {
    color: vars.color.textSecondary,
  },
});

export const chevron = style({
  transition: 'transform 0.2s ease',
  width: '14px',
  height: '14px',
  flexShrink: 0,
  selectors: {
    '[data-panel-open] &': {
      transform: 'rotate(90deg)',
    },
  },
});

export const panel = style({
  overflow: 'hidden',
  interpolateSize: 'allow-keywords',
  height: 'var(--collapsible-panel-height)',
  transition: 'height 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  selectors: {
    '&[data-closed]': {
      height: 0,
    },
    '&[data-starting-style]': {
      height: 0,
    },
    '&[data-ending-style]': {
      height: 0,
    },
  },
});
