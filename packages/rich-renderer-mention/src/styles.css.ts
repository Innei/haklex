import { vars } from '@haklex/rich-style-token'
import { globalStyle, style } from '@vanilla-extract/css'

export const semanticClassNames = {
  mention: 'rich-mention',
  mentionIcon: 'rich-mention-icon',
  mentionIconGitHub: 'rich-mention-icon-gh',
  mentionHandle: 'rich-mention-handle',
  mentionPlain: 'rich-mention-plain',
  editPanel: 'rich-mention-edit-panel',
  editField: 'rich-mention-edit-field',
  editTrigger: 'rich-mention-edit-trigger',
  editFieldIcon: 'rich-mention-edit-field-icon',
  editInput: 'rich-mention-edit-input',
  editSelect: 'rich-mention-edit-select',
  editActions: 'rich-mention-edit-actions',
  editActionButton: 'rich-mention-edit-action-btn',
  editActionButtonEnd: 'rich-mention-edit-action-btn--end',
} as const

// ─── Tag-style mention ──────────────────────────────────
export const mention = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3em',
  padding: '0.05em 0.55em',
  marginInline: '0.25em',
  borderRadius: '999px',
  background: vars.color.bgSecondary,
  border: `1px solid ${vars.color.border}`,
  verticalAlign: 'text-bottom',
  whiteSpace: 'nowrap',
  fontFamily: vars.typography.fontFamily,
  fontSize: vars.typography.fontSizeSm,
  lineHeight: '1.5',
  color: vars.color.text,
  transition: 'border-color 0.15s ease',
  selectors: {
    '&:hover': {
      borderColor: vars.color.accent,
    },
  },
})

export const mentionPlain = style({
  color: vars.color.textSecondary,
})

export const mentionIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
})

globalStyle(`${mentionIcon} svg`, {
  display: 'inline',
  height: '0.85em',
  width: '0.85em',
})

export const mentionIconGitHub = style({
  fill: 'currentColor',
})

export const mentionHandle = style({
  textDecoration: 'none',
  color: 'inherit',
  fontWeight: 500,
})

// ─── Edit popover ───────────────────────────────────────
export const editPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '300px',
  padding: '12px',
  fontSize: vars.typography.fontSizeSm,
  fontFamily: vars.typography.fontFamily,
})

export const editField = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 10px',
  backgroundColor: vars.color.bgSecondary,
  borderRadius: '6px',
  minWidth: 0,
})

export const editTrigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  marginInline: '0.15em',
})

globalStyle(`${editTrigger} a`, {
  pointerEvents: 'none',
})

export const editFieldIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const editInput = style({
  flex: 1,
  appearance: 'none',
  border: 'none',
  backgroundColor: 'transparent',
  color: 'inherit',
  fontSize: vars.typography.fontSizeSm,
  padding: 0,
  outline: 'none',
  minWidth: 0,
  selectors: {
    '&::placeholder': {
      color: vars.color.textSecondary,
    },
  },
})

export const editSelect = style({
  flex: 1,
  appearance: 'none',
  border: 'none',
  backgroundColor: 'transparent',
  color: 'inherit',
  fontSize: vars.typography.fontSizeSm,
  padding: 0,
  outline: 'none',
  cursor: 'pointer',
  minWidth: 0,
})

export const editActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
})

export const editActionButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: 'inherit',
  fontSize: vars.typography.fontSizeSm,
  fontWeight: 500,
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: '4px',
  transition: 'color 0.15s ease, background-color 0.15s ease',
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.bgSecondary,
    },
  },
})

export const editActionButtonEnd = style({
  marginLeft: 'auto',
})
