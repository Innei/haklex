import {
  chromeMotion,
  chromeRadius,
  chromeText,
  chromeTypography,
  vars,
} from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const positioner = style({
  zIndex: 50,
  outline: 'none',
});

export const popup = style({
  ...chromeTypography,
  ...chromeText.label,
  'display': 'flex',
  'alignItems': 'center',
  'gap': '8px',
  'maxWidth': 320,
  'boxSizing': 'border-box',
  'padding': '4px 8px',
  'color': vars.color.bg,
  'backgroundColor': vars.color.text,
  'border': 'none',
  'borderRadius': chromeRadius.md,
  'outline': 'none',
  'whiteSpace': 'normal',
  'wordBreak': 'break-word',
  'pointerEvents': 'none',
  'transformOrigin': 'var(--transform-origin)',
  'transition': `opacity ${chromeMotion.popupIn}, transform ${chromeMotion.popupIn}`,
  'selectors': {
    '&[data-starting-style]': {
      opacity: 0,
      transform: 'scale(0.97)',
    },
    '&[data-ending-style]': {
      opacity: 0,
      transform: 'scale(0.97)',
      transition: `opacity ${chromeMotion.popupOut}, transform ${chromeMotion.popupOut}`,
    },
    '&[data-instant]': {
      transition: 'none',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      selectors: {
        '&[data-starting-style], &[data-ending-style]': {
          transform: 'none',
        },
      },
    },
  },
});

export const shortcut = style({
  marginRight: '-4px',
});
