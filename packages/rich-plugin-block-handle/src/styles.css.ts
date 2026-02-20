import { vars } from '@haklex/rich-style-token'
import { style } from '@vanilla-extract/css'

// ─── Handle container ──────────────────────────────────
export const handleContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  position: 'absolute',
  zIndex: 30,
  opacity: 0,
  pointerEvents: 'none',
  transition: 'opacity 0.15s',
})

export const handleContainerVisible = style({
  opacity: 1,
  pointerEvents: 'auto',
})

// ─── Handle button ─────────────────────────────────────
export const handleBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  borderRadius: 4,
  border: 'none',
  background: 'transparent',
  color: `color-mix(in srgb, ${vars.color.text} 35%, transparent)`,
  cursor: 'pointer',
  padding: 0,
  transition: 'background-color 0.15s, color 0.15s',
  ':hover': {
    background: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
    color: `color-mix(in srgb, ${vars.color.text} 70%, transparent)`,
  },
})

// ─── Drag state ────────────────────────────────────────
export const draggingBlock = style({
  opacity: 0.35,
})

export const dragPreview = style({
  position: 'fixed',
  top: -10000,
  left: -10000,
  zIndex: 40,
  pointerEvents: 'none',
  margin: 0,
  boxSizing: 'border-box',
  opacity: 0.9,
  backgroundColor: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.sm,
  boxShadow: `0 10px 28px color-mix(in srgb, ${vars.color.text} 18%, transparent)`,
})

// ─── Drop indicator ────────────────────────────────────
export const dropIndicator = style({
  position: 'absolute',
  height: 2,
  background: vars.color.accent,
  borderRadius: 1,
  zIndex: 30,
  pointerEvents: 'none',
})

// ─── Context menu destructive item ─────────────────────
export const menuItemDestructive = style({
  color: vars.color.alertCaution,
  selectors: {
    '&[data-highlighted]': {
      color: vars.color.alertCaution,
      backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 8%, transparent)`,
    },
  },
})
