import {
  chromeMotion,
  chromeRadius,
  chromeText,
  chromeTypography,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

// ─── Menu container ──────────────────────────────────────
export const slashMenu = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: 288,
  maxHeight: 384,
  overflowY: 'auto',
  overflowX: 'hidden',
  ...chromeTypography,
  ...chromeText.control,
  background: vars.color.bgElevated,
  border: 'none',
  borderRadius: chromeRadius.lg,
  boxShadow: vars.boxShadow.menu,
  listStyle: 'none',
  margin: 0,
  padding: 4,
});

globalStyle(`${slashMenu}::-webkit-scrollbar`, {
  width: 6,
});

globalStyle(`${slashMenu}::-webkit-scrollbar-track`, {
  background: 'transparent',
});

globalStyle(`${slashMenu}::-webkit-scrollbar-thumb`, {
  background: vars.color.textQuaternary,
  borderRadius: 9999,
});

// ─── Section wrapper ─────────────────────────────────────
export const slashMenuSectionWrapper = style({});

// ─── Section divider ─────────────────────────────────────
export const slashMenuSectionDivider = style({
  height: 1,
  background: vars.color.borderSubtle,
  margin: '4px 0',
});

// ─── Section header ──────────────────────────────────────
export const slashMenuSection = style({
  'position': 'sticky',
  'top': 0,
  'zIndex': 10,
  ...chromeText.label,
  'padding': '8px 8px 4px',
  'color': vars.color.textTertiary,
  'userSelect': 'none',
  'background': vars.color.bgElevated,
  '@supports': {
    '(backdrop-filter: blur(8px))': {
      background: `color-mix(in srgb, ${vars.color.bgElevated} 92%, transparent)`,
      backdropFilter: 'blur(8px)',
    },
  },
});

// ─── Items container ─────────────────────────────────────
export const slashMenuItems = style({
  padding: 0,
  listStyle: 'none',
  margin: 0,
});

// ─── Menu item ───────────────────────────────────────────
export const slashMenuItem = style({
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
  color: vars.color.text,
});

globalStyle(`${slashMenuItem}:hover, ${slashMenuItem}[aria-selected="true"]`, {
  background: vars.color.fillSecondary,
});

// ─── Icon ────────────────────────────────────────────────
export const slashMenuItemIcon = style({
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

// ─── Text container ──────────────────────────────────────
export const slashMenuItemText = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  flex: 1,
  gap: 2,
});

export const slashMenuItemTitle = style({
  ...chromeText.control,
  fontWeight: 500,
  color: vars.color.text,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const slashMenuItemDescription = style({
  ...chromeText.label,
  fontWeight: 400,
  color: vars.color.textTertiary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

// ─── Empty state ─────────────────────────────────────────
export const slashMenuEmpty = style({
  padding: '24px 12px',
  color: vars.color.textTertiary,
  textAlign: 'center',
});
