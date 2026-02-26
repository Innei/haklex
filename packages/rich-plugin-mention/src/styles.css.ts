import { vars } from '@haklex/rich-style-token'
import { globalStyle, style } from '@vanilla-extract/css'

export const mentionMenu = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: 280,
  maxHeight: 300,
  overflowY: 'auto',
  overflowX: 'hidden',
  fontFamily: vars.typography.fontFamily,
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 10,
  boxShadow: vars.boxShadow.menu,
  padding: '6px 0',
  listStyle: 'none',
  margin: 0,
})

globalStyle(`${mentionMenu}::-webkit-scrollbar`, {
  width: 6,
})

globalStyle(`${mentionMenu}::-webkit-scrollbar-thumb`, {
  background: 'rgba(0,0,0,0.1)',
  borderRadius: 3,
})

export const mentionMenuItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '6px 10px',
  margin: '0 6px',
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'background 0.1s ease',
})

globalStyle(
  `${mentionMenuItem}:hover, ${mentionMenuItem}[aria-selected="true"]`,
  {
    background: vars.color.bgSecondary,
  },
)

export const mentionMenuItemIcon = style({
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 16,
  flexShrink: 0,
  borderRadius: 6,
  background: vars.color.bgSecondary,
  border: `1px solid ${vars.color.border}`,
  color: vars.color.textSecondary,
  lineHeight: 1,
})

export const mentionMenuItemText = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  gap: 1,
})

export const mentionMenuItemTitle = style({
  fontSize: 14,
  fontWeight: 500,
  lineHeight: '1.3',
  color: vars.color.text,
})

export const mentionMenuItemDescription = style({
  fontSize: 12,
  lineHeight: '1.3',
  color: vars.color.textSecondary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})

export const mentionMenuHint = style({
  padding: '8px 14px',
  fontSize: 12,
  color: vars.color.textSecondary,
  userSelect: 'none',
})

// ─── Phase 2: platform tag + handle input prompt ────────
export const phase2Container = style({
  padding: '8px 10px',
  margin: '0 6px',
})

export const platformTag = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '3px 8px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 500,
  lineHeight: '1.3',
  background: vars.color.bgSecondary,
  border: `1px solid ${vars.color.border}`,
  color: vars.color.text,
  marginBottom: 6,
})

export const platformTagIcon = style({
  display: 'flex',
  alignItems: 'center',
  fontSize: 14,
})

export const phase2Hint = style({
  fontSize: 12,
  color: vars.color.textSecondary,
  marginTop: 2,
})

export const phase2Handle = style({
  fontSize: 14,
  fontWeight: 500,
  color: vars.color.text,
  marginTop: 4,
})
