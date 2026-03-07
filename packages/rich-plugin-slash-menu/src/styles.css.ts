import { vars } from '@haklex/rich-style-token/styles'
import { globalStyle, style } from '@vanilla-extract/css'

// ─── Menu container ──────────────────────────────────────
export const slashMenu = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: 288,
  maxHeight: 384,
  overflowY: 'auto',
  overflowX: 'hidden',
  fontFamily: vars.typography.fontFamilySans,
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.lg,
  boxShadow: vars.boxShadow.menu,
  listStyle: 'none',
  margin: 0,
  padding: 0,
})

globalStyle(`${slashMenu}::-webkit-scrollbar`, {
  width: 5,
})

globalStyle(`${slashMenu}::-webkit-scrollbar-track`, {
  background: 'transparent',
})

globalStyle(`${slashMenu}::-webkit-scrollbar-thumb`, {
  background: vars.color.textQuaternary,
  borderRadius: 3,
})

// ─── Section wrapper ─────────────────────────────────────
export const slashMenuSectionWrapper = style({})

// ─── Section divider ─────────────────────────────────────
export const slashMenuSectionDivider = style({
  height: 1,
  background: vars.color.border,
  opacity: 0.5,
})

// ─── Section header ──────────────────────────────────────
export const slashMenuSection = style({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  padding: '8px 12px',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: vars.color.textTertiary,
  userSelect: 'none',
  background: vars.color.bg,
  '@supports': {
    '(backdrop-filter: blur(8px))': {
      background: `color-mix(in srgb, ${vars.color.bg} 92%, transparent)`,
      backdropFilter: 'blur(8px)',
    },
  },
})

// ─── Items container ─────────────────────────────────────
export const slashMenuItems = style({
  padding: '4px 0',
  listStyle: 'none',
  margin: 0,
})

// ─── Menu item ───────────────────────────────────────────
export const slashMenuItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '8px 12px',
  margin: '0 4px',
  borderRadius: vars.borderRadius.md,
  cursor: 'pointer',
  transition: 'background 75ms ease',
  color: vars.color.text,
})

globalStyle(`${slashMenuItem}:hover, ${slashMenuItem}[aria-selected="true"]`, {
  background: vars.color.fill,
})

// ─── Icon ────────────────────────────────────────────────
export const slashMenuItemIcon = style({
  width: 36,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 16,
  flexShrink: 0,
  borderRadius: 6,
  background: vars.color.bgTertiary,
  border: '1px solid transparent',
  color: vars.color.textTertiary,
  lineHeight: 1,
  transition: 'background 75ms ease, border-color 75ms ease',
})

globalStyle(`${slashMenuItem}[aria-selected="true"] ${slashMenuItemIcon}`, {
  background: vars.color.bg,
  borderColor: vars.color.border,
})

// ─── Text container ──────────────────────────────────────
export const slashMenuItemText = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  flex: 1,
  gap: 2,
})

export const slashMenuItemTitle = style({
  fontSize: 14,
  fontWeight: 500,
  lineHeight: '1.3',
  color: vars.color.text,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const slashMenuItemDescription = style({
  fontSize: 12,
  lineHeight: '1.3',
  color: vars.color.textTertiary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})

// ─── Empty state ─────────────────────────────────────────
export const slashMenuEmpty = style({
  padding: '32px 12px',
  color: vars.color.textQuaternary,
  fontSize: 13,
  textAlign: 'center',
})
