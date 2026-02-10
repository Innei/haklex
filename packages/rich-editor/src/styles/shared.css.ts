import { globalStyle, keyframes, style } from '@vanilla-extract/css'

import { vars } from './vars.css'

export const richContent = style({
  fontFamily: vars.typography.fontFamily,
  fontSize: vars.typography.fontSizeBase,
  lineHeight: vars.typography.lineHeight,
  color: vars.color.text,
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
})

// ─── Paragraphs ──────────────────────────────────────────
globalStyle(`${richContent} .rich-paragraph`, {
  margin: 0,
  marginBottom: '1em',
  lineHeight: vars.typography.lineHeight,
})

// ─── Inline text formats ─────────────────────────────────
globalStyle(`${richContent} .rich-text-bold`, {
  fontWeight: 700,
})

globalStyle(`${richContent} .rich-text-italic`, {
  fontStyle: 'italic',
})

globalStyle(`${richContent} .rich-text-underline`, {
  textDecoration: 'underline',
})

globalStyle(`${richContent} .rich-text-strikethrough`, {
  textDecoration: 'line-through',
})

globalStyle(`${richContent} .rich-text-highlight`, {
  backgroundColor: vars.color.accentLight,
  borderRadius: vars.borderRadius.sm,
  padding: '1px 4px',
})

globalStyle(`${richContent} .rich-text-code`, {
  fontFamily: vars.typography.fontMono,
  fontSize: '0.9em',
  backgroundColor: vars.color.codeBg,
  color: vars.color.codeText,
  padding: '2px 6px',
  borderRadius: vars.borderRadius.sm,
  border: `1px solid ${vars.color.border}`,
})

// ─── Headings (base) ─────────────────────────────────────

const headingSelector = `:is(.rich-heading-h1, .rich-heading-h2, .rich-heading-h3, .rich-heading-h4, .rich-heading-h5, .rich-heading-h6)`

globalStyle(`${richContent} ${headingSelector}`, {
  position: 'relative',
})

globalStyle(`${richContent} .rich-heading-anchor`, {
  position: 'absolute',
  left: '-1.25em',
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: vars.color.textSecondary,
  opacity: 0,
  transition: 'opacity 0.15s ease',
  fontSize: '0.8em',
})

globalStyle(`${richContent} .rich-heading-anchor::before`, {
  content: '"#"',
})

globalStyle(`${richContent} ${headingSelector}:hover .rich-heading-anchor`, {
  opacity: 0.5,
})

globalStyle(
  `${richContent} ${headingSelector}:hover .rich-heading-anchor:hover`,
  {
    opacity: 1,
  },
)

globalStyle(`${richContent} .rich-heading-h1`, {
  fontSize: '2em',
  fontWeight: 700,
  lineHeight: vars.typography.lineHeightTight,
  marginTop: '1.5em',
  marginBottom: '0.5em',
})

globalStyle(`${richContent} .rich-heading-h2`, {
  fontSize: '1.5em',
  fontWeight: 700,
  lineHeight: vars.typography.lineHeightTight,
  marginTop: '1.4em',
  marginBottom: '0.45em',
})

globalStyle(`${richContent} .rich-heading-h3`, {
  fontSize: '1.25em',
  fontWeight: 600,
  lineHeight: vars.typography.lineHeightTight,
  marginTop: '1.3em',
  marginBottom: '0.4em',
})

globalStyle(`${richContent} .rich-heading-h4`, {
  fontSize: '1.125em',
  fontWeight: 600,
  lineHeight: vars.typography.lineHeightTight,
  marginTop: '1.2em',
  marginBottom: '0.35em',
})

globalStyle(`${richContent} .rich-heading-h5`, {
  fontSize: '1em',
  fontWeight: 600,
  lineHeight: vars.typography.lineHeightTight,
  marginTop: '1.1em',
  marginBottom: '0.3em',
})

globalStyle(`${richContent} .rich-heading-h6`, {
  fontSize: '0.875em',
  fontWeight: 600,
  lineHeight: vars.typography.lineHeightTight,
  marginTop: '1em',
  marginBottom: '0.25em',
  color: vars.color.textSecondary,
})

// ─── Links ───────────────────────────────────────────────
globalStyle(`${richContent} .rich-link`, {
  color: vars.color.link,
  textDecoration: 'none',
  transition: 'color 0.2s ease',
})

globalStyle(`${richContent} .rich-link:hover`, {
  textDecoration: 'underline',
})

// ─── Lists ───────────────────────────────────────────────
globalStyle(`${richContent} .rich-list-ol`, {
  listStyleType: 'decimal',
  paddingLeft: vars.spacing.lg,
  marginBottom: '1em',
})

globalStyle(`${richContent} .rich-list-ul`, {
  listStyleType: 'disc',
  paddingLeft: vars.spacing.lg,
  marginBottom: '1em',
})

globalStyle(`${richContent} .rich-list-item`, {
  marginBottom: '0.25em',
})

globalStyle(`${richContent} .rich-list-nested-item`, {
  listStyleType: 'none',
})

globalStyle(`${richContent} .rich-list-nested-item .rich-list-ol`, {
  listStyleType: 'lower-alpha',
})

globalStyle(`${richContent} .rich-list-nested-item .rich-list-ul`, {
  listStyleType: 'circle',
})

// ─── Blockquote ──────────────────────────────────────────
globalStyle(`${richContent} .rich-quote`, {
  borderLeft: `4px solid ${vars.color.quoteBorder}`,
  backgroundColor: vars.color.quoteBg,
  margin: `${vars.spacing.md} 0`,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  fontStyle: 'italic',
  color: vars.color.textSecondary,
  borderRadius: `0 ${vars.borderRadius.sm} ${vars.borderRadius.sm} 0`,
})

// ─── Horizontal rule ─────────────────────────────────────
globalStyle(`${richContent} .rich-hr`, {
  border: 'none',
  borderTop: `1px solid ${vars.color.border}`,
  margin: `${vars.spacing.lg} 0`,
})

// ─── Code block ──────────────────────────────────────────
globalStyle(`${richContent} .rich-code-block`, {
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeSmall,
  backgroundColor: vars.color.codeBg,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
  margin: `${vars.spacing.md} 0`,
  border: `1px solid ${vars.color.border}`,
})

globalStyle(`${richContent} .rich-code-block pre`, {
  margin: 0,
  padding: vars.spacing.md,
  overflowX: 'auto',
})

globalStyle(`${richContent} .rich-code-block code`, {
  fontFamily: 'inherit',
  fontSize: 'inherit',
  background: 'none',
  border: 'none',
  padding: 0,
  color: 'inherit',
})

// ─── Table ───────────────────────────────────────────────
globalStyle(`${richContent} .rich-table`, {
  width: '100%',
  borderCollapse: 'collapse',
  margin: `${vars.spacing.md} 0`,
  fontSize: vars.typography.fontSizeSmall,
})

globalStyle(`${richContent} .rich-table-cell`, {
  border: `1px solid ${vars.color.border}`,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  textAlign: 'left',
})

globalStyle(`${richContent} .rich-table-cell-header`, {
  border: `1px solid ${vars.color.border}`,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  textAlign: 'left',
  fontWeight: 600,
  backgroundColor: vars.color.bgSecondary,
})

// ─── Images ──────────────────────────────────────────────
globalStyle(`${richContent} img`, {
  maxWidth: '100%',
  height: 'auto',
  borderRadius: vars.borderRadius.md,
})

globalStyle(`${richContent} .rich-image`, {
  margin: `${vars.spacing.md} 0`,
  textAlign: 'center',
})

globalStyle(`${richContent} .rich-image figcaption`, {
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.textSecondary,
  marginTop: vars.spacing.sm,
  lineHeight: vars.typography.lineHeightTight,
})

globalStyle(`${richContent} .rich-image-container`, {
  position: 'relative',
  display: 'inline-block',
  overflow: 'hidden',
  borderRadius: vars.borderRadius.md,
  transition: 'background-color 0.3s ease',
})

globalStyle(`${richContent} .rich-image-hidden`, {
  opacity: 0,
  transition: 'opacity 0.3s ease',
})

globalStyle(`${richContent} .rich-image-visible`, {
  opacity: 1,
  transition: 'opacity 0.3s ease',
})

const zoomIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

globalStyle(`.rich-image-zoom-overlay`, {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  cursor: 'zoom-out',
  animation: `${zoomIn} 0.2s ease`,
})

globalStyle(`.rich-image-zoom-img`, {
  maxWidth: '90vw',
  maxHeight: '90vh',
  objectFit: 'contain',
  borderRadius: '0',
})

// ─── Spoiler ─────────────────────────────────────────────
globalStyle(`${richContent} .rich-spoiler`, {
  backgroundColor: vars.color.text,
  color: 'transparent',
  borderRadius: vars.borderRadius.sm,
  paddingInline: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease, color 0.3s ease',
  userSelect: 'none',
})

globalStyle(`${richContent} .rich-spoiler:hover`, {
  backgroundColor: 'transparent',
  color: 'inherit',
  userSelect: 'auto',
})

globalStyle(`${richContent} .rich-spoiler-revealed`, {
  backgroundColor: 'transparent',
  color: 'inherit',
  userSelect: 'auto',
})

// ─── Mention ─────────────────────────────────────────────
globalStyle(`${richContent} .rich-mention`, {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: vars.color.accent,
  fontWeight: 500,
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
})

globalStyle(`${richContent} .rich-mention:hover`, {
  textDecoration: 'underline',
})

globalStyle(`${richContent} .rich-mention-platform`, {
  fontSize: '0.85em',
  opacity: 0.7,
})

globalStyle(`${richContent} .rich-mention-handle`, {
  fontWeight: 600,
})

// ─── KaTeX ───────────────────────────────────────────────
globalStyle(`${richContent} .rich-katex-inline`, {
  display: 'inline',
  padding: '0 2px',
  verticalAlign: 'middle',
})

globalStyle(`${richContent} .rich-katex-block`, {
  display: 'block',
  textAlign: 'center',
  padding: `${vars.spacing.md} 0`,
  overflowX: 'auto',
  margin: `${vars.spacing.md} 0`,
})

globalStyle(`${richContent} .rich-katex-fallback`, {
  fontFamily: vars.typography.fontMono,
  fontSize: '0.9em',
  color: vars.color.codeText,
  backgroundColor: vars.color.codeBg,
  padding: '2px 6px',
  borderRadius: vars.borderRadius.sm,
})

// ─── Alert / Callout ─────────────────────────────────────
globalStyle(`${richContent} .rich-alert`, {
  padding: vars.spacing.md,
  borderLeft: '4px solid',
  borderRadius: `0 ${vars.borderRadius.sm} ${vars.borderRadius.sm} 0`,
  margin: `${vars.spacing.md} 0`,
  backgroundColor: vars.color.bgSecondary,
})

globalStyle(`${richContent} .rich-alert-note`, {
  borderLeftColor: vars.color.alertInfo,
})

globalStyle(`${richContent} .rich-alert-tip`, {
  borderLeftColor: vars.color.alertTip,
})

globalStyle(`${richContent} .rich-alert-important`, {
  borderLeftColor: vars.color.alertImportant,
})

globalStyle(`${richContent} .rich-alert-warning`, {
  borderLeftColor: vars.color.alertWarning,
})

globalStyle(`${richContent} .rich-alert-caution`, {
  borderLeftColor: vars.color.alertCaution,
})

globalStyle(`${richContent} .rich-alert-header`, {
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  fontWeight: 600,
  marginBottom: vars.spacing.sm,
  fontSize: vars.typography.fontSizeSmall,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  lineHeight: 1,
})

globalStyle(`${richContent} .rich-alert-icon`, {
  display: 'inline-flex',
  width: '16px',
  height: '16px',
  flexShrink: 0,
})

globalStyle(`${richContent} .rich-alert-header-note`, {
  color: vars.color.alertInfo,
})

globalStyle(`${richContent} .rich-alert-header-tip`, {
  color: vars.color.alertTip,
})

globalStyle(`${richContent} .rich-alert-header-important`, {
  color: vars.color.alertImportant,
})

globalStyle(`${richContent} .rich-alert-header-warning`, {
  color: vars.color.alertWarning,
})

globalStyle(`${richContent} .rich-alert-header-caution`, {
  color: vars.color.alertCaution,
})

// ─── Code block header ──────────────────────────────────
globalStyle(`${richContent} .rich-code-block-header`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  borderBottom: `1px solid ${vars.color.border}`,
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.textSecondary,
  userSelect: 'none',
})

globalStyle(`${richContent} .rich-code-block-lang`, {
  fontFamily: vars.typography.fontMono,
  fontSize: '0.85em',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
})

globalStyle(`${richContent} .rich-code-block-copy`, {
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.borderRadius.sm,
  fontFamily: vars.typography.fontFamily,
  fontSize: vars.typography.fontSizeSmall,
  lineHeight: 1,
  transition: 'color 0.15s ease, background-color 0.15s ease',
})

globalStyle(`${richContent} .rich-code-block-copy:hover`, {
  color: vars.color.text,
  backgroundColor: vars.color.bgSecondary,
})

// ─── Code block line numbers ──────────────────────────────
globalStyle(`${richContent} .rich-code-block-numbered pre`, {
  counterReset: 'line',
})

globalStyle(`${richContent} .rich-code-block-numbered .line`, {
  counterIncrement: 'line',
})

globalStyle(`${richContent} .rich-code-block-numbered .line::before`, {
  content: 'counter(line)',
  display: 'inline-block',
  width: '2.5em',
  marginRight: vars.spacing.md,
  textAlign: 'right',
  color: vars.color.textSecondary,
  opacity: 0.4,
  userSelect: 'none',
  fontSize: vars.typography.fontSizeSmall,
})

// ─── Drag & Drop ──────────────────────────────────────────
globalStyle(`.rich-drag-handle`, {
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  cursor: 'grab',
  borderRadius: vars.borderRadius.sm,
  color: vars.color.textSecondary,
  opacity: 0.4,
  transition: 'opacity 0.15s ease, background-color 0.15s ease',
  zIndex: 10,
})

globalStyle(`.rich-drag-handle:hover`, {
  opacity: 1,
  backgroundColor: vars.color.bgSecondary,
})

globalStyle(`.rich-drag-handle:active`, {
  cursor: 'grabbing',
})

globalStyle(`.rich-drop-indicator`, {
  position: 'absolute',
  height: '2px',
  backgroundColor: vars.color.accent,
  borderRadius: '1px',
  pointerEvents: 'none',
  zIndex: 10,
})

// ─── Floating Toolbar ──────────────────────────────────────
globalStyle(`.rich-floating-toolbar`, {
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  padding: '4px',
  backgroundColor: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.md,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
})

globalStyle(`.rich-toolbar-btn`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  border: 'none',
  background: 'none',
  borderRadius: vars.borderRadius.sm,
  color: vars.color.textSecondary,
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
  lineHeight: 1,
  transition: 'color 0.1s, background-color 0.1s',
})

globalStyle(`.rich-toolbar-btn:hover`, {
  color: vars.color.text,
  backgroundColor: vars.color.bgSecondary,
})

globalStyle(`.rich-toolbar-btn-active`, {
  color: vars.color.accent,
  backgroundColor: vars.color.accentLight,
})

globalStyle(`.rich-toolbar-btn-active:hover`, {
  color: vars.color.accent,
  backgroundColor: vars.color.accentLight,
})

// ─── LinkCard Edit Decorator ─────────────────────────────
globalStyle(`.rich-link-card-edit-wrapper`, {
  position: 'relative',
})

globalStyle(`.rich-link-card-edit-toolbar`, {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  fontSize: vars.typography.fontSizeSmall,
  backgroundColor: vars.color.bgSecondary,
  border: `1px solid ${vars.color.border}`,
  borderBottom: 'none',
  borderRadius: `${vars.borderRadius.md} ${vars.borderRadius.md} 0 0`,
  opacity: 0,
  transition: 'opacity 0.15s ease',
})

globalStyle(`.rich-link-card-edit-wrapper:hover .rich-link-card-edit-toolbar`, {
  opacity: 1,
})

globalStyle(`.rich-link-card-edit-toolbar:focus-within`, {
  opacity: 1,
})

globalStyle(`.rich-link-card-edit-url`, {
  flex: 1,
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: vars.color.link,
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeSmall,
  cursor: 'pointer',
  padding: '2px 4px',
  borderRadius: vars.borderRadius.sm,
  textAlign: 'left',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  transition: 'background-color 0.1s ease',
})

globalStyle(`.rich-link-card-edit-url:hover`, {
  backgroundColor: vars.color.accentLight,
})

globalStyle(`.rich-link-card-edit-input`, {
  flex: 1,
  appearance: 'none',
  border: `1px solid ${vars.color.accent}`,
  backgroundColor: vars.color.bg,
  color: vars.color.text,
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeSmall,
  padding: '2px 6px',
  borderRadius: vars.borderRadius.sm,
  outline: 'none',
})

globalStyle(`.rich-link-card-edit-delete`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  padding: '4px',
  borderRadius: vars.borderRadius.sm,
  transition: 'color 0.1s ease, background-color 0.1s ease',
  flexShrink: 0,
})

globalStyle(`.rich-link-card-edit-delete:hover`, {
  color: vars.color.alertCaution,
  backgroundColor: `${vars.color.alertCaution}15`,
})

// ─── KaTeX Edit Decorator ────────────────────────────────
globalStyle(`.rich-katex-edit-wrapper`, {
  cursor: 'pointer',
  borderRadius: vars.borderRadius.sm,
  transition: 'background-color 0.15s ease',
})

globalStyle(`.rich-katex-edit-wrapper:hover`, {
  backgroundColor: vars.color.accentLight,
})

globalStyle(`.rich-katex-edit-block`, {
  display: 'block',
  border: `1px solid ${vars.color.accent}`,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
  margin: `${vars.spacing.md} 0`,
})

globalStyle(`.rich-katex-edit-inline`, {
  display: 'inline-flex',
  flexDirection: 'column',
  border: `1px solid ${vars.color.accent}`,
  borderRadius: vars.borderRadius.sm,
  overflow: 'hidden',
  verticalAlign: 'middle',
})

globalStyle(`.rich-katex-edit-header`, {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 8px',
  backgroundColor: vars.color.bgSecondary,
  borderBottom: `1px solid ${vars.color.border}`,
  fontSize: vars.typography.fontSizeSmall,
})

globalStyle(`.rich-katex-edit-label`, {
  fontWeight: 600,
  color: vars.color.accent,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
})

globalStyle(`.rich-katex-edit-hint`, {
  color: vars.color.textSecondary,
  fontSize: '11px',
  marginLeft: 'auto',
})

globalStyle(`.rich-katex-edit-textarea`, {
  display: 'block',
  width: '100%',
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeSmall,
  lineHeight: '1.5',
  backgroundColor: vars.color.bg,
  color: vars.color.text,
  border: 'none',
  outline: 'none',
  resize: 'vertical',
  boxSizing: 'border-box',
})
