import {
  chromeRadius,
  chromeText,
  chromeTypography,
  chromeWidth,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, style, styleVariants } from '@vanilla-extract/css';

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

export const size = styleVariants(chromeWidth, (width) => ({ width }));

export const flush = style({
  padding: 0,
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  height: 44,
  boxSizing: 'border-box',
  padding: '0 6px 0 12px',
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
});

export const headerIcon = style({
  display: 'inline-flex',
  flexShrink: 0,
  color: vars.color.textTertiary,
});

globalStyle(`${headerIcon} svg`, {
  width: 16,
  height: 16,
});

export const headerTitle = style({
  ...chromeText.control,
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontWeight: 600,
  color: vars.color.text,
});

export const headerActions = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 2,
  flexShrink: 0,
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 12,
});

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 6,
  padding: '8px 12px',
  borderTop: `1px solid ${vars.color.borderSubtle}`,
});

export const footerHint = style({
  ...chromeText.label,
  flex: 1,
  minWidth: 0,
  fontWeight: 400,
  color: vars.color.textTertiary,
});
