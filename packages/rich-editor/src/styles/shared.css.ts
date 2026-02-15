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

globalStyle(`${richContent} .rich-quote > .rich-paragraph:first-child`, {
  marginTop: 0,
})

globalStyle(`${richContent} .rich-quote > .rich-paragraph:last-child`, {
  marginBottom: 0,
})

// ─── Horizontal rule (match markdown: 60px centered line) ─
globalStyle(`${richContent} .rich-hr`, {
  border: 'none',
  borderTop: `1px solid ${vars.color.border}`,
  margin: `${vars.spacing.lg} auto`,
  width: 60,
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
  borderCollapse: 'separate',
  borderSpacing: 0,
  margin: `${vars.spacing.lg} 0`,
  fontSize: vars.typography.fontSizeSmall,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
})

globalStyle(`${richContent} .rich-table-cell`, {
  border: 'none',
  borderBottom: `1px solid ${vars.color.border}`,
  padding: `1.25em ${vars.spacing.lg}`,
  textAlign: 'left',
  verticalAlign: 'middle',
  lineHeight: '1.5',
})

globalStyle(`${richContent} .rich-table tbody tr:last-child .rich-table-cell`, {
  borderBottom: 'none',
})

globalStyle(`${richContent} .rich-table-cell .rich-paragraph`, {
  margin: 0,
  padding: 0,
  lineHeight: 'inherit',
})

globalStyle(`${richContent} .rich-table-cell > :first-child`, {
  marginTop: 0,
})

globalStyle(`${richContent} .rich-table-cell > :last-child`, {
  marginBottom: 0,
})

globalStyle(`${richContent} .rich-table-cell-header`, {
  border: 'none',
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.75em',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: vars.color.textSecondary,
  backgroundColor: vars.color.bgSecondary,
  verticalAlign: 'middle',
  lineHeight: '1.5',
})

globalStyle(`${richContent} .rich-table-cell-header .rich-paragraph`, {
  margin: 0,
  padding: 0,
  lineHeight: 'inherit',
})

globalStyle(`${richContent} .rich-table-cell-header > :first-child`, {
  marginTop: 0,
})

globalStyle(`${richContent} .rich-table-cell-header > :last-child`, {
  marginBottom: 0,
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

globalStyle(`[contenteditable="true"] .rich-spoiler`, {
  backgroundColor: `color-mix(in srgb, ${vars.color.text} 30%, transparent)`,
  color: 'inherit',
  userSelect: 'auto',
  cursor: 'text',
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

// ─── Footnote ───────────────────────────────────────────
globalStyle(`${richContent} .rich-footnote`, {
  verticalAlign: 'super',
  fontSize: '0.8em',
})

globalStyle(`${richContent} .rich-footnote-ref`, {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '1.5em',
  textDecoration: 'none',
  color: vars.color.accent,
  backgroundColor: vars.color.accentLight,
  borderRadius: '999px',
  padding: '0 0.35em',
  lineHeight: 1.45,
  fontWeight: 600,
  fontSize: '0.82em',
  transition: 'filter 0.15s ease',
})

globalStyle(`${richContent} .rich-footnote-ref:hover`, {
  filter: 'brightness(0.96)',
})

const footnoteFlash = keyframes({
  '0%': { backgroundColor: 'rgba(239, 68, 68, 0.24)' },
  '100%': { backgroundColor: 'transparent' },
})

globalStyle(`${richContent} .rich-footnote-highlight`, {
  animation: `${footnoteFlash} 1.2s ease-out`,
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
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  fontWeight: 600,
  marginBottom: vars.spacing.md,
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

globalStyle(`${richContent} .rich-alert-content`, {
  minHeight: '1em',
})

globalStyle(
  `${richContent} .rich-alert-content > .rich-paragraph:first-child`,
  {
    marginTop: 0,
  },
)

globalStyle(`${richContent} .rich-alert-content > .rich-paragraph:last-child`, {
  marginBottom: 0,
})

globalStyle(`${richContent} .rich-alert-content-editable`, {
  outline: 'none',
})

globalStyle(`${richContent} .rich-alert-content .rich-paragraph`, {
  margin: 0,
  marginBottom: '0.5em',
})

globalStyle(`${richContent} .rich-alert-content .rich-paragraph:last-child`, {
  marginBottom: 0,
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
  display: 'inline',
})

globalStyle(`.rich-link-card-edit-panel`, {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '340px',
  padding: '12px',
  fontSize: '13px',
  backgroundColor: vars.color.bg,
  borderColor: vars.color.border,
  color: vars.color.text,
})

globalStyle(`.rich-link-card-edit-url-row`, {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: vars.color.bgSecondary,
  borderRadius: vars.borderRadius.md,
  minWidth: 0,
})

globalStyle(`.rich-link-card-edit-link-icon`, {
  flexShrink: 0,
  color: vars.color.textSecondary,
})

globalStyle(`.rich-link-card-edit-url-text`, {
  flex: 1,
  color: vars.color.text,
  fontFamily: vars.typography.fontMono,
  fontSize: '13px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
})

globalStyle(`.rich-link-card-edit-input`, {
  flex: 1,
  appearance: 'none',
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.color.text,
  fontFamily: vars.typography.fontMono,
  fontSize: '13px',
  padding: 0,
  outline: 'none',
  minWidth: 0,
})

globalStyle(`.rich-link-card-edit-actions`, {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
})

globalStyle(`.rich-link-card-edit-action-btn`, {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: vars.color.text,
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: vars.borderRadius.sm,
  transition: 'color 0.15s ease, background-color 0.15s ease',
  whiteSpace: 'nowrap',
})

globalStyle(`.rich-link-card-edit-action-btn:hover`, {
  backgroundColor: vars.color.bgSecondary,
})

globalStyle(`.rich-link-card-edit-action-btn--end`, {
  marginLeft: 'auto',
})

// ─── Tabs ───────────────────────────────────────────────
globalStyle(`${richContent} .rich-tabs`, {
  display: 'flex',
  flexDirection: 'column',
  margin: `${vars.spacing.md} 0`,
})

globalStyle(`${richContent} .rich-tabs-list`, {
  display: 'inline-flex',
  gap: vars.spacing.sm,
  borderBottom: `1px solid ${vars.color.border}`,
  paddingBottom: '1px',
  flexWrap: 'wrap',
})

globalStyle(`${richContent} .rich-tabs-trigger`, {
  position: 'relative',
  display: 'flex',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.typography.fontSizeSmall,
  fontWeight: 700,
  color: vars.color.textSecondary,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  transition: 'color 0.3s, background-color 0.2s',
  outline: 'none',
  borderRadius: vars.borderRadius.sm,
})

globalStyle(`${richContent} .rich-tabs-trigger[data-state="active"]`, {
  color: vars.color.accent,
})

globalStyle(`${richContent} .rich-tabs-trigger-text`, {
  position: 'relative',
  zIndex: 1,
})

globalStyle(`${richContent} .rich-tabs-underline`, {
  position: 'absolute',
  bottom: '-1px',
  left: vars.spacing.sm,
  right: vars.spacing.sm,
  height: '2px',
  borderRadius: '1px',
  backgroundColor: vars.color.accent,
})

globalStyle(`${richContent} .rich-tabs-content`, {
  padding: `${vars.spacing.md} 0`,
  animation: 'rich-tabs-fade-in 0.3s ease',
})

globalStyle(`${richContent} .rich-tabs-content > .rich-paragraph:first-child`, {
  marginTop: 0,
})

globalStyle(`${richContent} .rich-tabs-content > .rich-paragraph:last-child`, {
  marginBottom: 0,
})

globalStyle(`${richContent} .rich-tabs-plain`, {
  margin: 0,
  whiteSpace: 'pre-wrap',
  lineHeight: 1.6,
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.textSecondary,
})

const tabsFadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

globalStyle(`${richContent} .rich-tabs-content[data-state="active"]`, {
  animation: `${tabsFadeIn} 0.3s ease`,
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

// Panel
globalStyle(`.rich-katex-editor-panel`, {
  width: 'min(420px, 90vw)',
  padding: 0,
  overflow: 'hidden',
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)',
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
})

// Header
globalStyle(`.rich-katex-editor-header`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  borderBottom: `1px solid color-mix(in srgb, ${vars.color.border} 60%, transparent)`,
})

globalStyle(`.rich-katex-editor-header-left`, {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

globalStyle(`.rich-katex-editor-icon-wrap`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.color.accentLight,
  color: vars.color.accent,
})

globalStyle(`.rich-katex-editor-title`, {
  fontWeight: 600,
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.text,
})

globalStyle(`.rich-katex-editor-header-right`, {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
})

globalStyle(`.rich-katex-editor-mode`, {
  fontSize: '10px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: vars.color.textSecondary,
  padding: '1px 6px',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.color.bgSecondary,
})

globalStyle(`.rich-katex-editor-delete`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  width: '28px',
  height: '28px',
  borderRadius: vars.borderRadius.sm,
  transition: 'color 0.15s ease, background-color 0.15s ease',
  flexShrink: 0,
})

globalStyle(`.rich-katex-editor-delete:hover`, {
  color: vars.color.alertCaution,
  backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
})

// Tabs
globalStyle(`.rich-katex-editor-tabs`, {
  display: 'flex',
  padding: '0 16px',
  borderBottom: `1px solid color-mix(in srgb, ${vars.color.border} 60%, transparent)`,
  gap: 0,
})

globalStyle(`.rich-katex-editor-tab`, {
  position: 'relative',
  appearance: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  background: 'none',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  padding: '0 12px',
  height: '36px',
  fontSize: '12px',
  fontWeight: 500,
  transition: 'color 0.15s ease',
})

globalStyle(`.rich-katex-editor-tab:hover`, {
  color: vars.color.text,
})

globalStyle(`.rich-katex-editor-tab-active`, {
  color: vars.color.accent,
  borderBottomColor: vars.color.accent,
})

// Body
globalStyle(`.rich-katex-editor-body`, {
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

// Field
globalStyle(`.rich-katex-editor-field`, {
  display: 'flex',
  flexDirection: 'column',
})

globalStyle(`.rich-katex-editor-label`, {
  fontSize: '10px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: vars.color.textSecondary,
  marginBottom: '6px',
  paddingLeft: '2px',
})

// Input wrap
globalStyle(`.rich-katex-editor-input-wrap`, {
  position: 'relative',
})

globalStyle(`.rich-katex-editor-textarea`, {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  paddingRight: '56px',
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeSmall,
  lineHeight: '1.5',
  backgroundColor: `color-mix(in srgb, ${vars.color.bgSecondary} 30%, transparent)`,
  color: vars.color.text,
  border: `1px solid color-mix(in srgb, ${vars.color.border} 60%, transparent)`,
  borderRadius: vars.borderRadius.md,
  outline: 'none',
  resize: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
})

globalStyle(`.rich-katex-editor-textarea::placeholder`, {
  color: `color-mix(in srgb, ${vars.color.textSecondary} 50%, transparent)`,
})

globalStyle(`.rich-katex-editor-textarea:focus`, {
  borderColor: `color-mix(in srgb, ${vars.color.accent} 50%, transparent)`,
  boxShadow: `0 0 0 2px color-mix(in srgb, ${vars.color.accent} 25%, transparent)`,
})

// Input action buttons
globalStyle(`.rich-katex-editor-input-actions`, {
  position: 'absolute',
  right: '6px',
  top: '6px',
  display: 'flex',
  gap: '2px',
})

globalStyle(`.rich-katex-editor-action-btn`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: `color-mix(in srgb, ${vars.color.textSecondary} 60%, transparent)`,
  cursor: 'pointer',
  width: '24px',
  height: '24px',
  borderRadius: vars.borderRadius.sm,
  transition: 'color 0.15s ease, background-color 0.15s ease',
})

globalStyle(`.rich-katex-editor-action-btn:hover`, {
  color: vars.color.text,
  backgroundColor: vars.color.bgSecondary,
})

globalStyle(`.rich-katex-editor-action-btn:disabled`, {
  opacity: 0.3,
  cursor: 'default',
  pointerEvents: 'none',
})

// Preview
globalStyle(`.rich-katex-editor-preview`, {
  border: `1px solid color-mix(in srgb, ${vars.color.border} 60%, transparent)`,
  borderRadius: vars.borderRadius.md,
  padding: vars.spacing.md,
  minHeight: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflowX: 'auto',
  backgroundColor: vars.color.bg,
})

globalStyle(`.rich-katex-editor-preview-empty`, {
  color: `color-mix(in srgb, ${vars.color.textSecondary} 50%, transparent)`,
  fontSize: vars.typography.fontSizeSmall,
})

// Snippets placeholder
globalStyle(`.rich-katex-editor-snippets-placeholder`, {
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeSmall,
  textAlign: 'center',
  padding: `${vars.spacing.lg} 0`,
})

// Footer
globalStyle(`.rich-katex-editor-footer`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  borderTop: `1px solid color-mix(in srgb, ${vars.color.border} 60%, transparent)`,
  backgroundColor: `color-mix(in srgb, ${vars.color.bgSecondary} 20%, transparent)`,
})

globalStyle(`.rich-katex-editor-charcount`, {
  color: vars.color.textSecondary,
  fontSize: '10px',
  fontFamily: vars.typography.fontMono,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '200px',
})

globalStyle(`.rich-katex-editor-footer-actions`, {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

globalStyle(`.rich-katex-editor-btn`, {
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  padding: '4px 10px',
  borderRadius: vars.borderRadius.sm,
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: 1.4,
  height: '28px',
  display: 'inline-flex',
  alignItems: 'center',
  transition: 'color 0.15s ease, background-color 0.15s ease',
})

globalStyle(`.rich-katex-editor-btn:hover`, {
  color: vars.color.text,
  backgroundColor: vars.color.bgSecondary,
})

globalStyle(`.rich-katex-editor-btn-primary`, {
  backgroundColor: vars.color.accent,
  color: '#fff',
})

globalStyle(`.rich-katex-editor-btn-primary:hover`, {
  backgroundColor: vars.color.accent,
  filter: 'brightness(0.9)',
  color: '#fff',
})

globalStyle(`.rich-katex-editor-btn-primary:disabled`, {
  opacity: 0.5,
  cursor: 'default',
  pointerEvents: 'none',
})

// ─── Details / Collapse ─────────────────────────────────
globalStyle(`${richContent} .rich-details`, {
  margin: `${vars.spacing.md} 0`,
  border: 'none',
})

globalStyle(`${richContent} .rich-details-summary`, {
  display: 'flex',
  width: '100%',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'space-between',
  listStyle: 'none',
  userSelect: 'none',
  fontWeight: 600,
  padding: `${vars.spacing.sm} 0`,
})

globalStyle(`${richContent} .rich-details-summary::-webkit-details-marker`, {
  display: 'none',
})

globalStyle(`${richContent} .rich-details-summary::marker`, {
  display: 'none',
  content: '""',
})

globalStyle(`${richContent} .rich-details-summary-text`, {
  flex: '1 1 0',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

globalStyle(`${richContent} .rich-details-chevron`, {
  display: 'inline-flex',
  flexShrink: 0,
  color: vars.color.textSecondary,
  transition: 'transform 0.2s ease',
})

globalStyle(`${richContent} .rich-details[open] .rich-details-chevron`, {
  transform: 'rotate(180deg)',
})

globalStyle(`${richContent} .rich-details-content`, {
  padding: `${vars.spacing.sm} 0`,
})

globalStyle(
  `${richContent} .rich-details-content > .rich-paragraph:first-child`,
  {
    marginTop: 0,
  },
)

globalStyle(
  `${richContent} .rich-details-content > .rich-paragraph:last-child`,
  {
    marginBottom: 0,
  },
)

// ─── Banner ─────────────────────────────────────────────
globalStyle(`${richContent} .rich-banner`, {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: vars.spacing.md,
  borderRadius: vars.borderRadius.md,
  border: '1px solid',
  padding: vars.spacing.lg,
  margin: `${vars.spacing.md} 0`,
  color: vars.color.text,
  lineHeight: '1.8',
})

globalStyle(`${richContent} .rich-banner-icon`, {
  display: 'inline-flex',
  flexShrink: 0,
  fontSize: '1.5em',
  alignSelf: 'flex-start',
})

globalStyle(`${richContent} .rich-banner-content`, {
  flex: 1,
  minWidth: 0,
})

globalStyle(
  `${richContent} .rich-banner-content > .rich-paragraph:first-child`,
  {
    marginTop: 0,
  },
)

globalStyle(
  `${richContent} .rich-banner-content > .rich-paragraph:last-child`,
  {
    marginBottom: 0,
  },
)

globalStyle(`${richContent} .rich-banner-info`, {
  backgroundColor: 'rgba(59, 130, 246, 0.08)',
  borderColor: 'rgba(59, 130, 246, 0.3)',
})

globalStyle(`${richContent} .rich-banner-icon-info`, {
  color: '#3b82f6',
})

globalStyle(`${richContent} .rich-banner-warning`, {
  backgroundColor: 'rgba(245, 158, 11, 0.08)',
  borderColor: 'rgba(245, 158, 11, 0.3)',
})

globalStyle(`${richContent} .rich-banner-icon-warning`, {
  color: '#f59e0b',
})

globalStyle(`${richContent} .rich-banner-error`, {
  backgroundColor: 'rgba(239, 68, 68, 0.08)',
  borderColor: 'rgba(239, 68, 68, 0.3)',
})

globalStyle(`${richContent} .rich-banner-icon-error`, {
  color: '#ef4444',
})

globalStyle(`${richContent} .rich-banner-success`, {
  backgroundColor: 'rgba(34, 197, 94, 0.08)',
  borderColor: 'rgba(34, 197, 94, 0.3)',
})

globalStyle(`${richContent} .rich-banner-icon-success`, {
  color: '#22c55e',
})

// ─── First-child reset ──────────────────────────────────
globalStyle(`${richContent} > *:first-child`, {
  marginTop: 0,
})

globalStyle(`${richContent} > *:last-child`, {
  marginBottom: 0,
})
