import { globalStyle, style } from '@vanilla-extract/css'

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
