import { createVar, globalStyle, style } from '@vanilla-extract/css'

// CSS custom properties for dark mode support
const bgVar = createVar()
const bgHoverVar = createVar()
const textVar = createVar()
const textSecondaryVar = createVar()
const textMutedVar = createVar()
const borderVar = createVar()
const iconBgVar = createVar()
const sectionTextVar = createVar()

// ─── Menu container ──────────────────────────────────────
export const slashMenu = style({
  vars: {
    [bgVar]: '#ffffff',
    [bgHoverVar]: '#f1f1ef',
    [textVar]: '#373530',
    [textSecondaryVar]: '#787774',
    [textMutedVar]: '#9b9a97',
    [borderVar]: '#e8e8e5',
    [iconBgVar]: '#f1f1ef',
    [sectionTextVar]: '#787774',
  },
  position: 'absolute',
  top: 0,
  left: 0,
  width: 320,
  maxHeight: 340,
  overflowY: 'auto',
  overflowX: 'hidden',
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  background: bgVar,
  border: `1px solid ${borderVar}`,
  borderRadius: 10,
  boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.08)',
  padding: '6px 0',
  listStyle: 'none',
  margin: 0,
  '@media': {
    '(prefers-color-scheme: dark)': {
      vars: {
        [bgVar]: '#252525',
        [bgHoverVar]: '#333333',
        [textVar]: '#d4d4d4',
        [textSecondaryVar]: '#9b9b9b',
        [textMutedVar]: '#6c7086',
        [borderVar]: '#3a3a3a',
        [iconBgVar]: '#333333',
        [sectionTextVar]: '#6c7086',
      },
      boxShadow: '0 1px 4px rgba(0,0,0,0.12), 0 4px 24px rgba(0,0,0,0.3)',
    },
  },
})

// smooth scrollbar
globalStyle(`${slashMenu}::-webkit-scrollbar`, {
  width: 6,
})

globalStyle(`${slashMenu}::-webkit-scrollbar-thumb`, {
  background: 'rgba(0,0,0,0.1)',
  borderRadius: 3,
})

// ─── Section header ──────────────────────────────────────
export const slashMenuSection = style({
  padding: '10px 14px 4px',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: sectionTextVar,
  userSelect: 'none',
})

// ─── Menu item ───────────────────────────────────────────
export const slashMenuItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '6px 10px',
  margin: '0 6px',
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'background 0.1s ease',
})

globalStyle(`${slashMenuItem}:hover, ${slashMenuItem}[aria-selected="true"]`, {
  background: bgHoverVar,
})

// ─── Icon ────────────────────────────────────────────────
export const slashMenuItemIcon = style({
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
  flexShrink: 0,
  borderRadius: 6,
  background: iconBgVar,
  border: `1px solid ${borderVar}`,
  color: textSecondaryVar,
  lineHeight: 1,
})

// ─── Text container ──────────────────────────────────────
export const slashMenuItemText = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  gap: 1,
})

export const slashMenuItemTitle = style({
  fontSize: 14,
  fontWeight: 500,
  lineHeight: '1.3',
  color: textVar,
})

export const slashMenuItemDescription = style({
  fontSize: 12,
  lineHeight: '1.3',
  color: textMutedVar,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})

// ─── Empty state ─────────────────────────────────────────
export const slashMenuEmpty = style({
  padding: '20px 16px',
  color: textMutedVar,
  fontSize: 13,
  textAlign: 'center',
})
