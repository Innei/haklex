import { vars } from '@shiro/rich-style-token'
import { globalStyle, style } from '@vanilla-extract/css'

// ─── Container ──────────────────────────────────────────
globalStyle('.rcs-container', {
  position: 'relative',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  border: `1px solid ${vars.color.border}`,
  background: vars.color.codeBg,
  fontSize: '0.875rem',
})

// ─── Header ─────────────────────────────────────────────
globalStyle('.rcs-header', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 12px',
  minHeight: 40,
})

globalStyle('.rcs-tabs', {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  overflowX: 'auto',
  scrollbarWidth: 'none',
})

globalStyle('.rcs-tabs::-webkit-scrollbar', {
  display: 'none',
})

globalStyle('.rcs-tab', {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  fontSize: '0.75rem',
  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
  fontWeight: 500,
  color: vars.color.textSecondary,
  background: 'transparent',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  transition: 'color 0.15s, background 0.15s',
})

globalStyle('.rcs-tab:hover', {
  color: vars.color.text,
  background: `color-mix(in srgb, ${vars.color.text} 5%, transparent)`,
})

globalStyle('.rcs-tab-active', {
  color: vars.color.text,
  background: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
})

globalStyle('.rcs-title-bar', {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 0',
  fontSize: '0.75rem',
  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
  fontWeight: 500,
  color: vars.color.textSecondary,
})

globalStyle('.rcs-header-actions', {
  display: 'flex',
  alignItems: 'center',
  opacity: 0,
  transition: 'opacity 0.15s',
})

globalStyle('.rcs-container:hover .rcs-header-actions', {
  opacity: 1,
})

globalStyle('.rcs-copy-btn', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: 6,
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
})

globalStyle('.rcs-copy-btn:hover', {
  background: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
  color: vars.color.text,
})

// ─── Separator ──────────────────────────────────────────
globalStyle('.rcs-separator', {
  height: 1,
  background: vars.color.border,
  opacity: 0.6,
})

// ─── Code panel ─────────────────────────────────────────
globalStyle('.rcs-code-scroll', {
  overflowX: 'auto',
})

globalStyle('.rcs-code-body', {
  padding: '12px 16px',
  margin: 0,
  fontSize: '0.8125rem',
  lineHeight: 1.7,
  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
})

globalStyle('.rcs-code-body pre', {
  margin: 0,
  background: 'transparent !important',
})

globalStyle('.rcs-code-body code', {
  fontFamily: 'inherit',
})

globalStyle('.rcs-editor-container pre code', {
  display: 'flex',
  flexDirection: 'column',
})

// ─── FileIcon ───────────────────────────────────────────
globalStyle('.rcs-file-icon svg', {
  width: '100%',
  height: '100%',
})

// ─── Edit overlay ───────────────────────────────────────
globalStyle('.rcs-edit-container', {
  position: 'relative',
})

globalStyle('.rcs-edit-overlay', {
  position: 'absolute',
  inset: 0,
  zIndex: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
})

globalStyle('.rcs-edit-overlay:hover', {
  background: 'color-mix(in srgb, currentColor 6%, transparent)',
})

globalStyle('.rcs-edit-label', {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 14px',
  borderRadius: 6,
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  color: vars.color.text,
  fontSize: '0.8125rem',
  fontWeight: 500,
  opacity: 0,
  transition: 'opacity 0.2s',
})

globalStyle('.rcs-edit-container:hover .rcs-edit-label', {
  opacity: 1,
})

// ─── Dialog popup override ──────────────────────────────
const _codeSnippetDialogPopup = style({})
globalStyle(`${_codeSnippetDialogPopup}${_codeSnippetDialogPopup}`, {
  padding: 0,
  gap: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  width: 'calc(100vw - 2rem)',
  height: 'min(720px, 80vh)',
  borderRadius: '0.75rem',
  '@media': {
    '(min-width: 640px)': {
      maxWidth: '64rem',
    },
  },
})
globalStyle(`${_codeSnippetDialogPopup}${_codeSnippetDialogPopup}[data-open]`, {
  animation: 'none',
})
globalStyle(
  `${_codeSnippetDialogPopup}${_codeSnippetDialogPopup}[data-closed]`,
  {
    animation: 'none',
  },
)
export { _codeSnippetDialogPopup as codeSnippetDialogPopup }

// ─── Modal ──────────────────────────────────────────────
globalStyle('.rcs-modal', {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
})

// ─── Title bar ──────────────────────────────────────────
globalStyle('.rcs-modal-titlebar', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 44,
  padding: '0 16px',
  borderBottom: `1px solid ${vars.color.border}`,
  flexShrink: 0,
})

globalStyle('.rcs-modal-title', {
  fontSize: '0.75rem',
  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
  color: vars.color.textSecondary,
})

globalStyle('.rcs-modal-icon-btn', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: 6,
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
})

globalStyle('.rcs-modal-icon-btn:hover', {
  background: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
  color: vars.color.text,
})

// ─── Body ───────────────────────────────────────────────
globalStyle('.rcs-modal-body', {
  display: 'flex',
  flex: 1,
  minHeight: 0,
})

// ─── Sidebar ────────────────────────────────────────────
globalStyle('.rcs-modal-sidebar', {
  width: 224,
  flexShrink: 0,
  borderRight: `1px solid ${vars.color.border}`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
})

globalStyle('.rcs-sidebar-header', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 12px 8px',
  fontSize: '0.625rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: `color-mix(in srgb, ${vars.color.textSecondary} 60%, transparent)`,
})

globalStyle('.rcs-sidebar-add-btn', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 22,
  height: 22,
  borderRadius: 4,
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
})

globalStyle('.rcs-sidebar-add-btn:hover', {
  background: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
  color: vars.color.text,
})

globalStyle('.rcs-file-list', {
  flex: 1,
  overflowY: 'auto',
  padding: '0 6px 8px',
})

globalStyle('.rcs-file-item', {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 8px',
  borderRadius: 6,
  height: 24,
  cursor: 'pointer',
  fontSize: '0.75rem',
  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
  color: vars.color.textSecondary,
  transition: 'background 0.15s, color 0.15s',
})

globalStyle('.rcs-file-drag-handle', {
  display: 'inline-flex',
  alignItems: 'center',
  cursor: 'grab',
  color: `color-mix(in srgb, ${vars.color.textSecondary} 40%, transparent)`,
  flexShrink: 0,
  touchAction: 'none',
})

globalStyle('.rcs-file-drag-handle:active', {
  cursor: 'grabbing',
})

globalStyle('.rcs-file-item:hover', {
  background: `color-mix(in srgb, ${vars.color.text} 5%, transparent)`,
  color: vars.color.text,
})

globalStyle('.rcs-file-item-active', {
  background: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
  color: vars.color.text,
})

globalStyle('.rcs-file-name', {
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

globalStyle('.rcs-file-delete', {
  display: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  borderRadius: 4,
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  flexShrink: 0,
})

globalStyle('.rcs-file-item:hover .rcs-file-delete', {
  display: 'inline-flex',
})

globalStyle('.rcs-file-delete:hover', {
  color: vars.color.alertCaution,
  background: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
})

globalStyle('.rcs-rename-input', {
  flex: 1,
  minWidth: 0,
  padding: '1px 4px',
  fontSize: '0.75rem',
  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
  borderRadius: 3,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bg,
  color: vars.color.text,
  outline: 'none',
})

globalStyle('.rcs-rename-input:focus', {
  borderColor: `color-mix(in srgb, ${vars.color.text} 30%, transparent)`,
})

// ─── Editor panel ───────────────────────────────────────
globalStyle('.rcs-modal-editor', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})

globalStyle('.rcs-breadcrumb', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 36,
  padding: '0 16px',
  borderBottom: `1px solid color-mix(in srgb, ${vars.color.border} 50%, transparent)`,
  flexShrink: 0,
})

globalStyle('.rcs-breadcrumb-left', {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: '0.75rem',
  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
  color: vars.color.textSecondary,
  overflow: 'hidden',
})

globalStyle('.rcs-breadcrumb-name', {
  color: vars.color.text,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})

globalStyle('.rcs-breadcrumb-lang', {
  opacity: 0.5,
})

globalStyle('.rcs-editor-container', {
  flex: 1,
  minHeight: 0,
  position: 'relative',
  overflow: 'auto',
  backgroundColor: 'transparent !important' as any,
})

// shikicode overrides — keep output static so input textarea overlaps correctly
globalStyle('.rcs-editor-container > .shikicode.output', {
  position: 'static !important' as any,
  inset: 'auto !important' as any,
})

globalStyle('.rcs-editor-container .shikicode', {
  height: '100%',
  fontSize: '0.8125rem',
  lineHeight: 1.7,
})

globalStyle(
  '.rcs-editor-container .shiki, .rcs-editor-container code, .rcs-editor-container pre',
  {
    background: 'transparent !important' as any,
  },
)

globalStyle('.rcs-editor-container pre', {
  margin: '0 !important' as any,
  padding: '0 !important' as any,
})

globalStyle('.rcs-editor-container .shikicode.output .line::before', {
  backgroundColor: 'transparent !important' as any,
})

globalStyle('.rcs-editor-container .line', {
  display: 'block',
  padding: '0 1rem',
})

globalStyle('.rcs-editor-container .shikicode.input.line-numbers', {
  paddingLeft: 'calc(5em + 1rem)',
})

globalStyle('.rcs-editor-container .shikicode.input:not(.line-numbers)', {
  paddingLeft: '1rem',
})

globalStyle('.rcs-editor-container .line > span:last-child', {
  marginRight: '1rem',
})

globalStyle('.rcs-editor-container .line::after', { content: "' '" })

// ─── DnD file item ─────────────────────────────────────
globalStyle('.rcs-file-item-dragging', {
  opacity: 0.4,
})

globalStyle('.rcs-drag-overlay', {
  background: vars.color.bgSecondary,
  borderRadius: 6,
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
})
