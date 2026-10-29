import {
  chromeMotion,
  chromeRadius,
  chromeText,
  chromeTypography,
  chromeWidth,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const mentionMenu = style({
  zIndex: 50,
  width: chromeWidth.sm,
  maxWidth: 'calc(100vw - 16px)',
  maxHeight: 300,
  boxSizing: 'border-box',
  overflowY: 'auto',
  overflowX: 'hidden',
  ...chromeTypography,
  ...chromeText.control,
  fontFamily: vars.typography.fontFamilySans,
  background: vars.color.bgElevated,
  border: 'none',
  borderRadius: chromeRadius.lg,
  boxShadow: vars.boxShadow.menu,
  padding: 4,
});

globalStyle(`${mentionMenu}::-webkit-scrollbar`, {
  width: 6,
});

globalStyle(`${mentionMenu}::-webkit-scrollbar-thumb`, {
  background: vars.color.textQuaternary,
  borderRadius: 9999,
});

export const mentionMenuHeading = style({
  ...chromeText.label,
  padding: '6px 8px 4px',
  color: vars.color.textTertiary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  userSelect: 'none',
});

export const mentionMenuList = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const mentionMenuItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 32,
  boxSizing: 'border-box',
  padding: '4px 8px',
  margin: 0,
  borderRadius: chromeRadius.md,
  cursor: 'pointer',
  color: vars.color.text,
  transition: `background-color ${chromeMotion.state} ease`,
});

globalStyle(`${mentionMenuItem}:hover, ${mentionMenuItem}[aria-selected="true"]`, {
  background: vars.color.fillSecondary,
});

export const mentionMenuItemIcon = style({
  width: 20,
  height: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  borderRadius: 9999,
  background: vars.color.fillSecondary,
  color: vars.color.textSecondary,
  fontSize: 12,
  lineHeight: 1,
});

export const mentionMenuItemTitle = style({
  flex: 1,
  minWidth: 0,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const mentionMenuItemEnd = style({
  ...chromeText.label,
  fontWeight: 400,
  flexShrink: 0,
  color: vars.color.textTertiary,
});

export const mentionMenuEmpty = style({
  ...chromeText.control,
  padding: '6px 8px',
  color: vars.color.textTertiary,
  userSelect: 'none',
});
