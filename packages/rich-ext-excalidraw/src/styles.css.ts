import { vars } from '@haklex/rich-style-token'
import { globalStyle, keyframes, style } from '@vanilla-extract/css'

const ASPECT_RATIO = '16 / 10'

export const excalidrawStaticContainer = style({
  position: 'relative',
  width: '100%',
  aspectRatio: ASPECT_RATIO,
  margin: '1rem 0',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  backgroundColor: vars.color.bg,
})

export const excalidrawEditorContainer = style({
  position: 'relative',
  width: '100%',
  aspectRatio: ASPECT_RATIO,
  margin: '1rem 0',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  border: `1px solid ${vars.color.border}`,
})

export const excalidrawPlaceholder = style({
  position: 'relative',
  width: '100%',
  aspectRatio: ASPECT_RATIO,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: vars.color.bg,
  borderRadius: '0.5rem',
  border: `1px solid ${vars.color.border}`,
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeMd,
})

export const excalidrawLoading = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  inset: 0,
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeMd,
})

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
})

globalStyle(`${excalidrawLoading}::after`, {
  content: '""',
  display: 'inline-block',
  width: 16,
  height: 16,
  marginLeft: 8,
  border: '2px solid currentColor',
  borderRightColor: 'transparent',
  borderRadius: '50%',
  animation: `${spin} 0.6s linear infinite`,
})

export const excalidrawError = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  inset: 0,
  padding: '0.75rem 1rem',
  backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
  color: vars.color.alertCaution,
  fontSize: vars.typography.fontSizeMd,
})

// Hide excalidraw's built-in bottom toolbar in readonly containers
globalStyle(`${excalidrawStaticContainer} .App-toolbar`, { display: 'none' })
globalStyle(`${excalidrawEditorContainer} .Island`, {
  display: 'none !important',
})
globalStyle(`.excalidraw--view-mode .dropdown-menu-button`, {
  display: 'none !important',
})

export const excalidrawActionGroup = style({
  position: 'absolute',
  bottom: 8,
  right: 8,
  zIndex: 10,
  display: 'flex',
  gap: 4,
  borderRadius: 6,
  padding: 2,
  backgroundColor: 'color-mix(in srgb, currentColor 8%, transparent)',
  backdropFilter: 'blur(8px)',
})

export const excalidrawActionButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: 4,
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
  ':hover': {
    background: 'color-mix(in srgb, currentColor 12%, transparent)',
    color: vars.color.text,
  },
})

globalStyle(`${excalidrawActionButton} svg`, {
  width: 16,
  height: 16,
})

// ── Fullscreen popup (overrides editor-ui dialog popup) ─────────

const _excalidrawFullscreenPopup = style({})
globalStyle(`${_excalidrawFullscreenPopup}${_excalidrawFullscreenPopup}`, {
  position: 'fixed',
  inset: 0,
  top: 0,
  left: 0,
  transform: 'none',
  width: '100vw',
  height: '100vh',
  maxWidth: '100vw',
  maxHeight: '100vh',
  margin: 0,
  padding: 0,
  gap: 0,
  borderRadius: 0,
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  background: vars.color.bg,
  overflow: 'hidden',
})
globalStyle(
  `${_excalidrawFullscreenPopup}${_excalidrawFullscreenPopup}[data-open]`,
  {
    animation: 'none',
  },
)
globalStyle(
  `${_excalidrawFullscreenPopup}${_excalidrawFullscreenPopup}[data-closed]`,
  {
    animation: 'none',
  },
)
export { _excalidrawFullscreenPopup as excalidrawFullscreenPopup }

// ── Dialog header ───────────────────────────────────────────────

export const excalidrawDialogHeader = style({
  display: 'flex',
  alignItems: 'center',
  height: 48,
  flexShrink: 0,
  padding: '0 12px 0 16px',
  borderBottom: `1px solid ${vars.color.border}`,
  gap: 10,
})

export const excalidrawDialogHeaderTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  flex: 1,
})

export const excalidrawStatusDot = style({
  width: 8,
  height: 8,
  borderRadius: '50%',
  flexShrink: 0,
  transition: 'background-color 0.3s',
})

export const excalidrawDialogTitle = style({
  fontSize: vars.typography.fontSizeMd,
  fontWeight: 600,
  color: vars.color.text,
  lineHeight: 1,
})

export const excalidrawDialogMeta = style({
  fontSize: vars.typography.fontSizeSm,
  color: vars.color.textSecondary,
  lineHeight: 1,
  paddingLeft: 10,
  borderLeft: `1px solid ${vars.color.border}`,
})

export const excalidrawHeaderActions = style({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: 2,
})

export const excalidrawHeaderClose = style({
  marginLeft: 8,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 6,
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
  ':hover': {
    background: 'color-mix(in srgb, currentColor 8%, transparent)',
    color: vars.color.text,
  },
})

// ── Header action buttons ────────────────────────────────────────

export const excalidrawActionBarBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 10px',
  borderRadius: 4,
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  fontSize: vars.typography.fontSizeSm,
  whiteSpace: 'nowrap',
  transition: 'background 0.15s, color 0.15s',
  ':hover': {
    background: 'color-mix(in srgb, currentColor 8%, transparent)',
    color: vars.color.text,
  },
  selectors: {
    '&:disabled': {
      opacity: 0.4,
      pointerEvents: 'none',
    },
  },
})

globalStyle(`${excalidrawActionBarBtn} svg`, {
  width: 14,
  height: 14,
  flexShrink: 0,
})

export const excalidrawActionBarSep = style({
  width: 1,
  height: 16,
  margin: '0 4px',
  background: vars.color.border,
  flexShrink: 0,
})

export const excalidrawActionBarUrl = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 10px',
  borderRadius: 4,
  background: 'color-mix(in srgb, currentColor 4%, transparent)',
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeXs,
  fontFamily: vars.typography.fontMono,
  width: 200,
  maxWidth: '50%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  border: `1px solid transparent`,
  outline: 'none',
  transition: 'background 0.15s, border-color 0.15s',
  ':hover': {
    background: 'color-mix(in srgb, currentColor 8%, transparent)',
  },
  ':focus': {
    borderColor: vars.color.accent,
    background: 'color-mix(in srgb, currentColor 6%, transparent)',
  },
})

// ── Dialog canvas area ──────────────────────────────────────────

export const excalidrawDialogCanvas = style({
  flex: 1,
  position: 'relative',
  minHeight: 0,
})

// ── Unsaved-changes confirmation (used inside presentDialog) ────

export const excalidrawConfirmActions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
})

export const excalidrawConfirmBtn = style({
  padding: '6px 14px',
  borderRadius: 6,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  fontSize: vars.typography.fontSizeSm,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background 0.15s',
  color: vars.color.text,
  ':hover': {
    background: 'color-mix(in srgb, currentColor 6%, transparent)',
  },
})

export const excalidrawConfirmBtnPrimary = style({
  padding: '6px 14px',
  borderRadius: 6,
  border: `1px solid ${vars.color.accent}`,
  background: vars.color.accent,
  fontSize: vars.typography.fontSizeSm,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'opacity 0.15s',
  color: '#fff',
  ':hover': {
    opacity: 0.9,
  },
})

export const excalidrawConfirmBtnDanger = style({
  padding: '6px 14px',
  borderRadius: 6,
  border: `1px solid ${vars.color.alertCaution}`,
  background: 'transparent',
  fontSize: vars.typography.fontSizeSm,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background 0.15s',
  color: vars.color.alertCaution,
  ':hover': {
    background: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
  },
})

// ── Edit overlay ────────────────────────────────────────────────

export const excalidrawEditOverlay = style({
  position: 'absolute',
  inset: 0,
  zIndex: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  transition: 'background 0.2s',
  ':hover': {
    background: 'color-mix(in srgb, currentColor 6%, transparent)',
  },
})

export const excalidrawEditLabel = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 14px',
  borderRadius: 6,
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  color: vars.color.text,
  fontSize: vars.typography.fontSizeSm,
  fontWeight: 500,
  opacity: 0,
  transition: 'opacity 0.2s',
  selectors: {
    [`${excalidrawEditOverlay}:hover &`]: {
      opacity: 1,
    },
  },
})
