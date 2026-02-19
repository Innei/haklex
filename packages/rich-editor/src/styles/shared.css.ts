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

// ─── Table ───────────────────────────────────────────────
globalStyle(`${richContent} .rich-table-scrollable-wrapper`, {
  overflowX: 'auto',
})

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
  borderRight: `1px solid ${vars.color.border}`,
  padding: `1.25em ${vars.spacing.lg}`,
  textAlign: 'left',
  verticalAlign: 'middle',
  lineHeight: '1.5',
})

globalStyle(`${richContent} .rich-table-cell:last-child`, {
  borderRight: 'none',
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
  borderBottom: `1px solid ${vars.color.border}`,
  borderRight: `1px solid ${vars.color.border}`,
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
  position: 'sticky',
  top: 0,
  zIndex: 1,
})

globalStyle(`${richContent} .rich-table-cell-header:last-child`, {
  borderRight: 'none',
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

globalStyle(`${richContent} .rich-footnote-ref-wrapper`, {
  position: 'relative',
  display: 'inline',
})

// ─── Footnote Section ──────────────────────────────────
globalStyle(`${richContent} .rich-footnote-section`, {
  marginTop: vars.spacing.lg,
})

globalStyle(`${richContent} .rich-footnote-section-divider`, {
  border: 'none',
  borderTop: `1px solid ${vars.color.border}`,
  margin: `${vars.spacing.lg} 0 ${vars.spacing.md}`,
})

globalStyle(`${richContent} .rich-footnote-section-list`, {
  listStyleType: 'decimal',
  paddingLeft: vars.spacing.lg,
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.textSecondary,
  lineHeight: '1.6',
})

globalStyle(`${richContent} .rich-footnote-section-item`, {
  marginBottom: vars.spacing.sm,
  paddingLeft: vars.spacing.xs,
})

globalStyle(`${richContent} .rich-footnote-back-ref`, {
  display: 'inline-flex',
  alignItems: 'center',
  marginLeft: vars.spacing.xs,
  color: vars.color.accent,
  textDecoration: 'none',
  fontSize: '0.85em',
  transition: 'opacity 0.15s ease',
})

globalStyle(`${richContent} .rich-footnote-back-ref:hover`, {
  opacity: 0.7,
})

// ─── Footnote Section Edit ─────────────────────────────
globalStyle(`${richContent} .rich-footnote-section-item-edit`, {
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  listStyleType: 'none',
})

globalStyle(`${richContent} .rich-footnote-section-item-num`, {
  flexShrink: 0,
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeSmall,
  fontWeight: 600,
  minWidth: '1.5em',
})

globalStyle(`${richContent} .rich-footnote-section-item-input`, {
  flex: 1,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.text,
  backgroundColor: 'transparent',
  outline: 'none',
  transition: 'border-color 0.15s ease',
})

globalStyle(`${richContent} .rich-footnote-section-item-input:focus`, {
  borderColor: vars.color.accent,
})

globalStyle(`${richContent} .rich-footnote-section-item-remove`, {
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  border: 'none',
  background: 'none',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  borderRadius: vars.borderRadius.sm,
  fontSize: '14px',
  transition: 'color 0.15s ease, background-color 0.15s ease',
})

globalStyle(`${richContent} .rich-footnote-section-item-remove:hover`, {
  color: '#ef4444',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
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

// ─── First-child reset ──────────────────────────────────
globalStyle(`${richContent} > *:first-child`, {
  marginTop: 0,
})

globalStyle(`${richContent} > *:last-child`, {
  marginBottom: 0,
})
