import { chromeRadius, chromeText, chromeTypography, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

import { popupMotion } from '../../styles/menu.css';

export const popup = style({
  ...chromeTypography,
  ...popupMotion,
  zIndex: 50,
  width: 280,
  maxWidth: 'calc(100vw - 0.75rem)',
  boxSizing: 'border-box',
  borderRadius: chromeRadius.lg,
  border: 'none',
  padding: '12px',
  backgroundColor: vars.color.bgElevated,
  boxShadow: vars.boxShadow.menu,
  outline: 'none',
  fontFamily: vars.typography.fontFamilySans,
});

export const arrow = style({
  width: 10,
  height: 10,
  transformOrigin: 'center',
});

globalStyle(`${arrow} > polygon`, {
  fill: vars.color.bgElevated,
});

globalStyle(`${arrow} > polyline`, {
  stroke: vars.color.ring,
  fill: 'none',
});

export const title = style({
  ...chromeText.item,
  fontWeight: 600,
  color: vars.color.text,
});

export const description = style({
  ...chromeText.control,
  color: vars.color.textSecondary,
  marginTop: '4px',
});
