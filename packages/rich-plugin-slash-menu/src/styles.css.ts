import { chromeTypography, vars } from '@haklex/rich-style-token/styles';
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
  fontSize: 13,
  lineHeight: 1.35,
  background: vars.color.bg,
  border: 'none',
  borderRadius: vars.borderRadius.lg,
  boxShadow: vars.boxShadow.menu,
  listStyle: 'none',
  margin: 0,
  padding: 4,
});

globalStyle(`${slashMenu}::-webkit-scrollbar`, {
  width: 5,
});

globalStyle(`${slashMenu}::-webkit-scrollbar-track`, {
  background: 'transparent',
});

globalStyle(`${slashMenu}::-webkit-scrollbar-thumb`, {
  background: vars.color.fill,
  borderRadius: 3,
});

// ─── Section wrapper ─────────────────────────────────────
export const slashMenuSectionWrapper = style({});

// ─── Section divider ─────────────────────────────────────
export const slashMenuSectionDivider = style({
  height: 1,
  background: vars.color.borderSubtle,
  margin: '4px -4px',
});

// ─── Section header ──────────────────────────────────────
export const slashMenuSection = style({
  'position': 'sticky',
  'top': 0,
  'zIndex': 10,
  'padding': '8px 10px 4px',
  'fontSize': 11,
  'fontWeight': 600,
  'letterSpacing': '0.06em',
  'textTransform': 'uppercase',
  'color': vars.color.textTertiary,
  'userSelect': 'none',
  'background': vars.color.bg,
  '@supports': {
    '(backdrop-filter: blur(8px))': {
      background: `color-mix(in srgb, ${vars.color.bg} 92%, transparent)`,
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
  padding: '6px 8px',
  margin: 0,
  borderRadius: vars.borderRadius.md,
  cursor: 'pointer',
  transition: 'background 120ms ease-out',
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
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
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
  fontSize: 13,
  fontWeight: 500,
  lineHeight: '1.35',
  color: vars.color.text,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const slashMenuItemDescription = style({
  fontSize: 12,
  lineHeight: '1.3',
  color: vars.color.textTertiary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

// ─── Empty state ─────────────────────────────────────────
export const slashMenuEmpty = style({
  padding: '32px 12px',
  color: vars.color.textTertiary,
  fontSize: 13,
  textAlign: 'center',
});
