import {
  chromeMotion,
  chromeRadius,
  chromeText,
  chromeTypography,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const mentionMenu = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: 280,
  maxHeight: 300,
  overflowY: 'auto',
  overflowX: 'hidden',
  ...chromeTypography,
  ...chromeText.control,
  background: vars.color.bgElevated,
  border: 'none',
  borderRadius: chromeRadius.lg,
  boxShadow: vars.boxShadow.menu,
  padding: 4,
  listStyle: 'none',
  margin: 0,
});

globalStyle(`${mentionMenu}::-webkit-scrollbar`, {
  width: 6,
});

globalStyle(`${mentionMenu}::-webkit-scrollbar-thumb`, {
  background: vars.color.textQuaternary,
  borderRadius: 9999,
});

export const mentionMenuItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  minHeight: 32,
  boxSizing: 'border-box',
  padding: '4px 8px',
  margin: 0,
  borderRadius: chromeRadius.md,
  cursor: 'pointer',
  transition: `background-color ${chromeMotion.state} ease`,
});

globalStyle(`${mentionMenuItem}:hover, ${mentionMenuItem}[aria-selected="true"]`, {
  background: vars.color.fillSecondary,
});

export const mentionMenuItemIcon = style({
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  flexShrink: 0,
  borderRadius: 6,
  background: vars.color.bgElevated,
  border: `1px solid ${vars.color.borderSubtle}`,
  color: vars.color.textSecondary,
  lineHeight: 1,
});

export const mentionMenuItemText = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  gap: 1,
});

export const mentionMenuItemTitle = style({
  fontSize: 13,
  fontWeight: 500,
  lineHeight: '1.3',
  color: vars.color.text,
});

export const mentionMenuItemDescription = style({
  fontSize: 12,
  lineHeight: '1.3',
  color: vars.color.textTertiary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const mentionMenuHint = style({
  padding: '8px 10px',
  fontSize: 12,
  color: vars.color.textTertiary,
  userSelect: 'none',
});

// ─── Phase 2: platform tag + handle input prompt ────────
export const phase2Container = style({
  padding: '8px 10px',
  margin: 0,
});

export const platformTag = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '3px 8px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 500,
  lineHeight: '1.3',
  background: vars.color.fillSecondary,
  border: 'none',
  color: vars.color.text,
  marginBottom: 6,
});

export const platformTagIcon = style({
  display: 'flex',
  alignItems: 'center',
  fontSize: 14,
});

export const phase2Hint = style({
  fontSize: 12,
  color: vars.color.textTertiary,
  marginTop: 2,
});

export const phase2Handle = style({
  fontSize: 14,
  fontWeight: 500,
  color: vars.color.text,
  marginTop: 4,
});
