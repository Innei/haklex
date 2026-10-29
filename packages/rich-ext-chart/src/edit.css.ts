import { chromeRadius, chromeTypography, vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const frame = style({
  position: 'relative',
  borderRadius: 8,
  outline: '2px solid transparent',
  outlineOffset: 6,
  transition: 'outline-color 120ms ease',
});

export const frameSelected = style({
  outlineColor: vars.color.accent,
});

export const toolbar = style({
  ...chromeTypography,
  position: 'absolute',
  top: -8,
  right: 0,
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  padding: 4,
  border: 'none',
  borderRadius: chromeRadius.lg,
  backgroundColor: vars.color.bgElevated,
  boxShadow: vars.boxShadow.menu,
  transform: 'translateY(-100%)',
});

export const rawPanel = style({
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 360,
});

export const rawCode = style({
  flex: 1,
  margin: 0,
  padding: 12,
  overflow: 'auto',
  fontFamily: vars.typography.fontMono,
  fontSize: 12,
  lineHeight: 1.5,
  color: vars.color.text,
  whiteSpace: 'pre',
  userSelect: 'text',
});

export const rawEmpty = style({
  color: vars.color.textTertiary,
});
