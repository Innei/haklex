import {
  chromeMotion,
  chromeRadius,
  chromeText,
  chromeTypography,
  vars,
} from '@haklex/rich-style-token/styles';
import { keyframes, style } from '@vanilla-extract/css';

const rise = keyframes({
  from: { opacity: 0, transform: 'translateY(8px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

const rotate = keyframes({
  to: { transform: 'rotate(360deg)' },
});

export const viewport = style({
  position: 'fixed',
  left: '50%',
  bottom: 16,
  zIndex: 100,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  transform: 'translateX(-50%)',
  pointerEvents: 'none',
  width: 'max-content',
  maxWidth: 'calc(100vw - 2rem)',
});

export const toast = style({
  ...chromeTypography,
  ...chromeText.control,
  'display': 'flex',
  'alignItems': 'center',
  'gap': 10,
  'minHeight': 40,
  'boxSizing': 'border-box',
  'padding': '0 8px 0 12px',
  'borderRadius': chromeRadius.lg,
  'backgroundColor': vars.color.bgElevated,
  'boxShadow': vars.boxShadow.menu,
  'color': vars.color.text,
  'fontFamily': vars.typography.fontFamilySans,
  'pointerEvents': 'auto',
  'animation': `${rise} ${chromeMotion.popupIn}`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const title = style({
  flex: 1,
  minWidth: 0,
  paddingRight: 4,
});

export const icon = style({
  width: 14,
  height: 14,
  flexShrink: 0,
  color: vars.color.textTertiary,
});

export const spin = style({
  animation: `${rotate} 900ms linear infinite`,
});

export const success = style({
  color: vars.color.alertTip,
});

export const error = style({
  color: vars.color.alertCaution,
});
