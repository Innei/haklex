import { vars } from '@haklex/rich-style-token/styles'
import { globalStyle } from '@vanilla-extract/css'

import { richContent } from './shared.css'

// ─── Grid Container ─────────────────────────────────────
globalStyle(`${richContent} .rich-grid-container`, {
  position: 'relative',
  margin: `${vars.spacing.md} 0`,
})

globalStyle(`${richContent} .rich-grid-toolbar`, {
  position: 'absolute',
  top: -36,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  padding: '4px 6px',
  borderRadius: vars.borderRadius.md,
  pointerEvents: 'none',
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  boxShadow: vars.boxShadow.topBar,
  zIndex: 10,
  userSelect: 'none',
  whiteSpace: 'nowrap',
  opacity: 0,
  transition: 'opacity 0.15s ease',
})

globalStyle(
  `${richContent} .rich-grid-container:hover .rich-grid-toolbar, ${richContent} .rich-grid-container:focus-within .rich-grid-toolbar`,
  {
    opacity: 1,
    pointerEvents: 'auto',
  },
)

globalStyle(`${richContent} .rich-grid-toolbar-icon`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  color: vars.color.textSecondary,
  flexShrink: 0,
})

globalStyle(`${richContent} .rich-grid-col-btn`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 24,
  height: 24,
  padding: '0 6px',
  borderRadius: vars.borderRadius.sm,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 500,
  color: vars.color.textSecondary,
  lineHeight: 1,
  transition: 'color 0.15s ease, background-color 0.15s ease',
})

globalStyle(`${richContent} .rich-grid-col-btn:hover`, {
  backgroundColor: vars.color.fillSecondary,
  color: vars.color.text,
})

globalStyle(`${richContent} .rich-grid-col-btn-active`, {
  background: vars.color.fill,
  fontWeight: 600,
  color: vars.color.text,
})

globalStyle(`${richContent} .rich-grid-toolbar-divider`, {
  width: 1,
  height: 16,
  background: vars.color.border,
  margin: '0 2px',
  flexShrink: 0,
})

globalStyle(`${richContent} .rich-grid-action-btn`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 24,
  height: 24,
  padding: '0 6px',
  borderRadius: vars.borderRadius.sm,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: vars.color.textSecondary,
  transition: 'color 0.15s ease, background-color 0.15s ease',
})

globalStyle(`${richContent} .rich-grid-action-btn:hover`, {
  backgroundColor: vars.color.fillSecondary,
  color: vars.color.text,
})

globalStyle(`${richContent} .rich-grid-inner`, {
  display: 'grid',
  gap: vars.spacing.md,
})

globalStyle(`${richContent} .rich-grid-cell`, {
  minWidth: 0,
})

globalStyle(`${richContent} .rich-grid-cell-editable`, {
  outline: 'none',
})
