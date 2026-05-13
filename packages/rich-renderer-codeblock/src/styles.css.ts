import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const semanticClassNames = {
  card: 'rr-code-card',
  lang: 'rr-code-lang',
  langIcon: 'rr-code-lang-icon',
  copyButton: 'rr-code-copy',
  bodyBackground: 'rr-code-bg',
  scroll: 'rr-code-scroll',
  scrollCollapsed: 'rr-code-scroll-collapsed',
  body: 'rr-code-body',
  bodyReadonly: 'rr-code-readonly',
  expandWrap: 'rr-code-expand-wrap',
  expandButton: 'rr-code-expand',
  lined: 'rr-code-lined',
  linedWithNumbers: 'rr-code-lined-ln',
} as const;

/* ---- Card ---- */
export const card = style({
  vars: {
    '--rr-code-accent': '#737373',
  },
  position: 'relative',
  maxWidth: '100%',
  minWidth: 0,
  margin: '1.5rem 0',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  fontSize: vars.typography.fontSizeMd,
  fontFamily: vars.typography.fontMono,
});

/* ---- Language input (edit mode) ---- */
export const langInput = style({
  appearance: 'none',
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  padding: 0,
  outline: 'none',
  width: '8em',
  opacity: 1,
  selectors: {
    '&::placeholder': {
      opacity: 0.5,
    },
  },
});

/* ---- Language label (bottom-right) ---- */
export const lang = style({
  position: 'absolute',
  bottom: '0.75rem',
  right: '0.75rem',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: vars.typography.fontSizeMd,
  opacity: 0.6,
  pointerEvents: 'none',
  selectors: {
    [`&:has(${langInput})`]: {
      pointerEvents: 'auto',
    },
  },
});

export const langIcon = style({
  display: 'inline-flex',
  flexShrink: 0,
});

globalStyle(`${langIcon} svg`, {
  width: '100%',
  height: '100%',
});

/* ---- Copy button (top-right, hover reveal) ---- */
export const copyButton = style({
  appearance: 'none',
  position: 'absolute',
  right: '0.5rem',
  top: '0.5rem',
  zIndex: 3,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.375rem',
  borderRadius: '0.375rem',
  border: '1px solid color-mix(in srgb, var(--rr-code-accent) 5%, transparent)',
  background: 'color-mix(in srgb, var(--rr-code-accent) 80%, transparent)',
  color: 'white',
  cursor: 'pointer',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  backdropFilter: 'blur(8px)',
  selectors: {
    [`${card}:hover &`]: {
      opacity: 1,
    },
  },
});

/* ---- Body background ---- */
export const bodyBackground = style({
  position: 'relative',
  background: 'color-mix(in srgb, var(--rr-code-accent) 5%, transparent)',
  padding: 0,
});

export const bodyBackgroundStatic = style([
  bodyBackground,
  {
    paddingBlock: 12,
  },
]);

/* ---- Scroll container ---- */
export const scroll = style({
  position: 'relative',
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  overflow: 'auto',
});

export const scrollCollapsed = style({
  maxHeight: '50vh',
  overflow: 'hidden',
});

/* ---- Code body (shikicode host) ---- */
export const body = style({
  position: 'relative',
  maxWidth: '100%',
  minWidth: 0,
  overflow: 'auto',
  backgroundColor: 'transparent !important' as any,
});

export const bodyReadonly = style({});

globalStyle(`${body} .cm-editor`, {
  background: 'transparent',
  color: vars.color.text,
  fontFamily: vars.typography.fontMono,
});

globalStyle(`${body} .cm-scroller`, {
  fontFamily: `${vars.typography.fontMono} !important` as any,
  lineHeight: '1.6',
});

globalStyle(`${body} .cm-content`, {
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: '1.25rem',
  paddingRight: '1.25rem',
  minHeight: '1.6em',
});

globalStyle(`${body}:has(.cm-gutters) .cm-content`, {
  paddingLeft: '0.5rem',
  paddingRight: '1.25rem',
});

globalStyle(`${body} .cm-line`, {
  padding: 0,
});

globalStyle(`${body} .cm-gutters`, {
  borderRight: 'none',
  paddingLeft: '1.25rem',
});

globalStyle(`${body} .cm-lineNumbers .cm-gutterElement`, {
  minWidth: '3em',
  textAlign: 'right',
  paddingRight: '2em',
  color: `color-mix(in srgb, ${vars.color.textSecondary} 40%, transparent) !important` as any,
});

globalStyle(`${body} > .shikicode.output`, {
  position: 'static !important' as any,
  inset: 'auto !important' as any,
});

globalStyle(`${bodyReadonly} > textarea.shikicode`, {
  display: 'none',
});

/* ---- Expand ---- */
export const expandWrap = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  padding: '0.5rem 0 0.75rem',
  background: `linear-gradient(to bottom, transparent 0%, var(--bg, ${vars.color.bgSecondary}) 80%)`,
  pointerEvents: 'none',
});

export const expandButton = style({
  appearance: 'none',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: vars.typography.fontSizeXs,
  color: 'inherit',
  opacity: 0.7,
  pointerEvents: 'auto',
  selectors: {
    '&:hover': {
      opacity: 1,
    },
  },
});

/* ---- Font normalization for textarea / output overlay alignment ---- */
globalStyle(
  `${card} .shikicode.input, ${card} .shikicode.output, ${card} .shikicode.output code, ${card} .shikicode.output .line, ${card} .shikicode.output .line span`,
  {
    fontVariantLigatures: 'none',
    fontKerning: 'none',
  },
);

globalStyle(`${card} .shikicode.input, ${card} .shikicode.output`, {
  fontFamily: `${vars.typography.fontMono} !important` as any,
});

// Force shikicode output descendants to inherit font-family from the shikicode layer
// (prevents Shiki theme / CSS reset overriding the font on pre/code)
globalStyle(`${body} pre, ${body} code, ${body} .line, ${body} .line span`, {
  fontFamily: `${vars.typography.fontMono} !important` as any,
});

/* ---- Shiki output overrides ---- */
globalStyle(`${card} pre`, {
  margin: '0 !important' as any,
  padding: '0 !important' as any,
  borderRadius: 0,
  fontSize: '1em',
  maxWidth: '100%',
  overflow: 'auto',
});

globalStyle(`${card} pre code`, {
  display: 'flex',
  flexDirection: 'column',
  fontFamily: `${vars.typography.fontMono} !important` as any,
});

globalStyle(`${card} .shiki, ${card} code, ${card} pre`, {
  background: 'transparent !important' as any,
});

/* ---- Shiki dual-theme: dark mode variable switch ---- */
globalStyle(
  `[data-theme='dark'] ${card} .shiki-themes, [data-theme='dark'] ${card} .shiki-themes span`,
  {
    color: 'var(--shiki-dark) !important' as any,
    fontStyle: 'var(--shiki-dark-font-style) !important' as any,
    fontWeight: 'var(--shiki-dark-font-weight) !important' as any,
    textDecoration: 'var(--shiki-dark-text-decoration) !important' as any,
  },
);

// When textarea has .line-numbers: align output ::before to match textarea padding
globalStyle(`${body}:has(.shikicode.input.line-numbers) .shikicode.output .line::before`, {
  backgroundColor: 'transparent !important' as any,
  color: `color-mix(in srgb, ${vars.color.textSecondary} 40%, transparent) !important` as any,
  width: '5em',
  paddingRight: '2em',
});

// When textarea does NOT have .line-numbers: hide output ::before entirely
globalStyle(`${body}:not(:has(.shikicode.input.line-numbers)) .shikicode.output .line::before`, {
  display: 'none',
});

globalStyle(`${card} .line`, {
  display: 'block',
  padding: '0 1.25rem',
});

globalStyle(`${card} .shikicode.input.line-numbers`, {
  paddingLeft: 'calc(5em + 1.25rem)',
});

globalStyle(`${card} .shikicode.input:not(.line-numbers)`, {
  paddingLeft: '1.25rem',
});

globalStyle(`${card} .line > span:last-child`, {
  marginRight: '1.25rem',
});

globalStyle(`${card} .line::after`, { content: "' '" });

/* ---- Highlighted / Diff lines ---- */
globalStyle(`${card} .highlighted, ${card} .diff`, {
  position: 'relative',
  overflowWrap: 'break-word',
});

globalStyle(`${card} .highlighted::before, ${card} .diff::before`, {
  content: "''",
  position: 'absolute',
  left: 0,
  top: 0,
  height: '100%',
  width: '2px',
});

globalStyle(`${card} .highlighted`, {
  background: 'color-mix(in srgb, var(--rr-code-accent) 20%, transparent)',
});

globalStyle(`${card} .highlighted::before`, {
  background: 'var(--rr-code-accent)',
});

globalStyle(`${card} .diff.add`, {
  background: 'rgba(34, 197, 94, 0.15)',
});

globalStyle(`${card} .diff.add::before`, { background: '#22c55e' });

globalStyle(`${card} .diff.add::after`, {
  content: "' +'",
  position: 'absolute',
  left: 0,
  color: '#22c55e',
});

globalStyle(`${card} .diff.remove`, {
  background: 'rgba(239, 68, 68, 0.15)',
});

globalStyle(`${card} .diff.remove::before`, { background: '#ef4444' });

globalStyle(`${card} .diff.remove::after`, {
  content: "' -'",
  position: 'absolute',
  left: 0,
  color: '#ef4444',
});

/* ---- Line-numbered container (fallback + static highlight) ---- */
export const lined = style({
  counterReset: 'shiki-line 0',
});

globalStyle(`${lined} .line`, {
  counterIncrement: 'shiki-line 1',
});

globalStyle(`${lined} .line::before`, {
  content: 'counter(shiki-line)',
  color: 'transparent',
  textAlign: 'right',
  boxSizing: 'border-box',
  width: '2em',
  display: 'inline-block',
  position: 'sticky',
  left: 0,
});

export const linedWithNumbers = style({});

globalStyle(`${linedWithNumbers} .line::before`, {
  color: 'inherit',
  opacity: 0.4,
  width: '5em',
  paddingRight: '2em',
});

/* ---- Scrollbar ---- */
globalStyle(`${scroll} pre::-webkit-scrollbar-track`, {
  marginLeft: '1rem',
  marginRight: 'var(--sr-margin, 0)',
});

globalStyle(`${scroll} pre::-webkit-scrollbar`, {
  backgroundColor: 'transparent !important' as any,
});

export const contentSemanticClassNames = {
  root: 'rich-code-block',
  header: 'rich-code-block-header',
  lang: 'rich-code-block-lang',
  copyButton: 'rich-code-block-copy',
  numbered: 'rich-code-block-numbered',
} as const;

const contentRootStyles = {
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeMd,
  backgroundColor: vars.color.codeBg,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
  margin: `${vars.spacing.md} 0`,
  border: `1px solid ${vars.color.border}`,
} as const;

const contentPreStyles = {
  margin: 0,
  padding: vars.spacing.md,
  overflowX: 'auto',
} as const;

const contentCodeStyles = {
  fontFamily: 'inherit',
  fontSize: 'inherit',
  background: 'none',
  border: 'none',
  padding: 0,
  color: 'inherit',
} as const;

const contentHeaderStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  borderBottom: `1px solid ${vars.color.border}`,
  fontSize: vars.typography.fontSizeMd,
  color: vars.color.textSecondary,
  userSelect: 'none',
} as const;

const contentLangStyles = {
  fontFamily: vars.typography.fontMono,
  fontSize: '0.85em',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
} as const;

const contentCopyButtonStyles = {
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.borderRadius.sm,
  fontFamily: vars.typography.fontFamily,
  fontSize: vars.typography.fontSizeMd,
  lineHeight: 1,
  transition: 'color 0.15s ease, background-color 0.15s ease',
} as const;

const contentCopyButtonHoverStyles = {
  color: vars.color.text,
  backgroundColor: vars.color.fillSecondary,
} as const;

const contentNumberedLineStyles = {
  counterIncrement: 'line',
} as const;

const contentNumberedLineBeforeStyles = {
  content: 'counter(line)',
  display: 'inline-block',
  width: '2.5em',
  marginRight: vars.spacing.md,
  textAlign: 'right',
  color: `color-mix(in srgb, ${vars.color.textSecondary} 40%, transparent) !important` as any,
  opacity: 0.4,
  userSelect: 'none',
  fontSize: vars.typography.fontSizeMd,
} as const;

export const contentRoot = style(contentRootStyles);
export const contentHeader = style(contentHeaderStyles);
export const contentLang = style(contentLangStyles);
export const contentCopyButton = style(contentCopyButtonStyles);

// Content node classes stay global because they're consumed across editor/renderer boundaries.
globalStyle(`.${contentSemanticClassNames.root}`, contentRootStyles);
globalStyle(`.${contentSemanticClassNames.root} pre`, contentPreStyles);
globalStyle(`.${contentSemanticClassNames.root} code`, contentCodeStyles);
globalStyle(`.${contentSemanticClassNames.header}`, contentHeaderStyles);
globalStyle(`.${contentSemanticClassNames.lang}`, contentLangStyles);
globalStyle(`.${contentSemanticClassNames.copyButton}`, contentCopyButtonStyles);
globalStyle(`.${contentSemanticClassNames.copyButton}:hover`, contentCopyButtonHoverStyles);

globalStyle(`.${contentSemanticClassNames.numbered} pre`, {
  counterReset: 'line',
});

globalStyle(`.${contentSemanticClassNames.numbered} .line`, contentNumberedLineStyles);

globalStyle(
  `.${contentSemanticClassNames.numbered} .line::before`,
  contentNumberedLineBeforeStyles,
);
