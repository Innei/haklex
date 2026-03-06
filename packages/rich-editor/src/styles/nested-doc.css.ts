import { vars } from '@haklex/rich-style-token'
import { globalStyle } from '@vanilla-extract/css'

import { richContent } from './shared.css'

// ─── Container ─────────────────────────────────────────
globalStyle(`${richContent} .rich-nested-doc`, {
  margin: `${vars.spacing.md} 0`,
  position: 'relative',
  borderRadius: vars.borderRadius.md,
  border: `1px solid ${vars.color.border}`,
  overflow: 'hidden',
  interpolateSize: 'allow-keywords',
})

// ─── Content wrapper ───────────────────────────────────
globalStyle(`${richContent} .rich-nested-doc-content`, {
  padding: vars.spacing.md,
  maxHeight: '400px',
  overflow: 'hidden',
  transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
})

// ─── Expanded state ────────────────────────────────────
globalStyle(`${richContent} .rich-nested-doc-content[data-expanded="true"]`, {
  maxHeight: 'none',
})

// ─── Gradient mask ─────────────────────────────────────
globalStyle(`${richContent} .rich-nested-doc-mask`, {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  paddingBottom: vars.spacing.md,
  background: `linear-gradient(to bottom, transparent, ${vars.color.bg})`,
  transition: 'opacity 0.3s ease',
})

globalStyle(`${richContent} .rich-nested-doc-mask[data-expanded="true"]`, {
  opacity: 0,
  pointerEvents: 'none',
})

// ─── Toggle button ─────────────────────────────────────
globalStyle(`${richContent} .rich-nested-doc-toggle`, {
  pointerEvents: 'auto',
  cursor: 'pointer',
  borderRadius: vars.borderRadius.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.typography.fontSizeSmall,
  backgroundColor: vars.color.bgSecondary,
  border: 'none',
  color: vars.color.textSecondary,
  transition: 'background-color 0.2s ease, color 0.2s ease',
})

globalStyle(`${richContent} .rich-nested-doc-toggle:hover`, {
  backgroundColor: vars.color.fillSecondary,
  color: vars.color.text,
})

// ─── Edit mode ─────────────────────────────────────────
globalStyle(`[contenteditable="true"] .rich-nested-doc`, {
  cursor: 'pointer',
  transition: 'border-color 0.2s ease',
})

globalStyle(`[contenteditable="true"] .rich-nested-doc:hover`, {
  borderColor: vars.color.accent,
})
