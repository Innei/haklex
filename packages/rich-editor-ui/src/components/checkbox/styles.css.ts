import {
  chromeMotion,
  chromeRadius,
  chromeText,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const root = style({
  display: 'inline-flex',
  alignItems: 'flex-start',
  gap: '8px',
  borderRadius: chromeRadius.sm,
  padding: 0,
  textAlign: 'left',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontFamily: vars.typography.fontFamilySans,
  color: 'inherit',
  outline: 'none',
});

export const rootDisabled = style({
  cursor: 'not-allowed',
  opacity: 0.5,
});

export const box = style({
  position: 'relative',
  display: 'flex',
  width: '16px',
  height: '16px',
  marginTop: '2px',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: chromeRadius.sm,
  border: `1px solid ${vars.color.textQuaternary}`,
  color: vars.color.bg,
  transition: `background-color ${chromeMotion.state} ease, border-color ${chromeMotion.state} ease`,
  boxSizing: 'border-box',
});

globalStyle(`${root}:focus-visible ${box}`, {
  boxShadow: focusRing,
});

export const boxUnchecked = style({
  backgroundColor: 'transparent',
});

globalStyle(`${root}:hover:not(${rootDisabled}) ${boxUnchecked}`, {
  borderColor: vars.color.textTertiary,
});

export const boxChecked = style({
  selectors: {
    '&&': {
      borderColor: vars.color.text,
      backgroundColor: vars.color.text,
    },
  },
});

export const mark = style({
  'position': 'absolute',
  'width': '12px',
  'height': '12px',
  'transition': `opacity ${chromeMotion.state} ease, transform ${chromeMotion.state} ease`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});

export const markVisible = style({
  opacity: 1,
  transform: 'scale(1)',
});

export const markHidden = style({
  opacity: 0,
  transform: 'scale(0.8)',
});

export const labelArea = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

export const label = style({
  ...chromeText.item,
  fontWeight: 500,
  color: vars.color.text,
});

export const labelDisabled = style({
  color: vars.color.textSecondary,
});

export const description = style({
  ...chromeText.control,
  color: vars.color.textSecondary,
});
