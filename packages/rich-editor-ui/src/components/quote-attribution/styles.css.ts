import { chromeMotion, vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const slot = style({
  display: 'block',
  marginTop: '0.25em',
  fontStyle: 'normal',
  fontSize: vars.typography.fontSizeCaption,
  lineHeight: 1.6,
  color: vars.color.textTertiary,
  userSelect: 'none',
  selectors: {
    '&[data-empty]:not([data-active])': {
      display: 'none',
    },
  },
});

export const text = style({
  display: 'block',
});

export const field = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.25em',
  maxWidth: '100%',
  cursor: 'text',
});

export const dash = style({
  flexShrink: 0,
});

export const input = style({
  appearance: 'none',
  flex: 1,
  minWidth: 0,
  margin: 0,
  padding: 0,
  border: 'none',
  borderBottom: '1px dotted transparent',
  borderRadius: 0,
  background: 'transparent',
  outline: 'none',
  font: 'inherit',
  color: 'inherit',
  transition: `border-color ${chromeMotion.state} ease`,
  selectors: {
    '&::placeholder': {
      color: vars.color.textQuaternary,
    },
    '&:hover': {
      borderBottomColor: vars.color.textQuaternary,
    },
    '&:focus': {
      borderBottomColor: vars.color.textTertiary,
    },
  },
});
