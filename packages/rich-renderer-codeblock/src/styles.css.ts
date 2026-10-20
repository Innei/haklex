import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const semanticClassNames = {
  card: 'rr-code-card',
  header: 'rr-code-header',
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
  position: 'relative',
  maxWidth: '100%',
  minWidth: 0,
  margin: `${vars.flow.block} 0`,
  borderRadius: vars.borderRadius.md,
  border: `1px solid ${vars.color.border}`,
  overflow: 'hidden',
  backgroundColor: vars.color.codeBg,
  color: vars.color.text,
  fontSize: vars.typography.fontSizeCode,
  fontFamily: vars.typography.fontMono,
  lineHeight: vars.typography.lineHeightCode,
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  height: '36px',
  padding: '0 6px 0 14px',
  backgroundColor: vars.color.codeHeaderBg,
  borderBottom: `1px solid ${vars.color.border}`,
  fontFamily: vars.typography.fontFamilySans,
  fontSize: '12px',
  lineHeight: 1,
  color: vars.color.textTertiary,
  userSelect: 'none',
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

export const lang = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0,
  whiteSpace: 'nowrap',
});

export const langMark = style({
  width: '10px',
  height: '10px',
  borderRadius: '3px',
  flexShrink: 0,
});

export const langIcon = style({
  display: 'inline-flex',
  flexShrink: 0,
});

globalStyle(`${langIcon} svg`, {
  width: '100%',
  height: '100%',
});

export const copyButton = style({
  'appearance': 'none',
  'display': 'inline-flex',
  'alignItems': 'center',
  'gap': '6px',
  'padding': '6px 8px',
  'border': 'none',
  'borderRadius': '6px',
  'background': 'transparent',
  'color': vars.color.textTertiary,
  'font': 'inherit',
  'cursor': 'pointer',
  'transition': 'color 0.15s ease, background-color 0.15s ease',
  ':hover': {
    color: vars.color.text,
    backgroundColor: vars.color.fill,
  },
});

/* ---- Body background ---- */
export const bodyBackground = style({
  position: 'relative',
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
  lineHeight: vars.typography.lineHeightCode,
  paddingBlock: '12px',
});

globalStyle(`${body} .cm-content`, {
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: '16px',
  paddingRight: '16px',
  minHeight: `calc(1em * ${vars.typography.lineHeightCode})`,
});

globalStyle(`${body}:has(.cm-gutters) .cm-content`, {
  paddingLeft: 0,
  paddingRight: '16px',
});

globalStyle(`${body} .cm-line`, {
  padding: 0,
});

globalStyle(`${body} .cm-gutters`, {
  borderRight: 'none',
  backgroundColor: vars.color.codeBg,
  paddingLeft: '16px',
});

globalStyle(`${body} .cm-lineNumbers .cm-gutterElement`, {
  minWidth: 'calc(var(--rc-ln-digits, 2) * 1ch)',
  padding: '0 16px 0 0',
  textAlign: 'right',
  color: `${vars.color.textQuaternary} !important` as any,
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
  left: 0,
  right: 0,
  bottom: 0,
  height: '56px',
  background: `linear-gradient(to bottom, transparent, ${vars.color.codeBg})`,
  pointerEvents: 'none',
});

export const expandButton = style({
  'appearance': 'none',
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'gap': '6px',
  'width': '100%',
  'height': '32px',
  'border': 'none',
  'borderTop': `1px solid ${vars.color.border}`,
  'background': vars.color.codeBg,
  'color': vars.color.textTertiary,
  'fontFamily': vars.typography.fontFamilySans,
  'fontSize': '12px',
  'cursor': 'pointer',
  ':hover': {
    color: vars.color.text,
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

globalStyle(`${card} ${scroll} > pre`, {
  padding: '12px 0 !important' as any,
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
  color: `${vars.color.textQuaternary} !important` as any,
  minWidth: 'calc(var(--rc-ln-digits, 2) * 1ch)',
  paddingRight: '16px',
});

// When textarea does NOT have .line-numbers: hide output ::before entirely
globalStyle(`${body}:not(:has(.shikicode.input.line-numbers)) .shikicode.output .line::before`, {
  display: 'none',
});

globalStyle(`${card} .line`, {
  display: 'block',
  padding: '0 16px',
});

globalStyle(`${card} .shikicode.input.line-numbers`, {
  paddingLeft: 'calc(2ch + 32px)',
});

globalStyle(`${card} .shikicode.input:not(.line-numbers)`, {
  paddingLeft: '16px',
});

globalStyle(`${card} .line > span:last-child`, {
  marginRight: '16px',
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
  background: `color-mix(in oklab, ${vars.color.accent} 8%, transparent)`,
});

globalStyle(`${card} .highlighted::before`, {
  background: vars.color.accent,
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
  boxSizing: 'content-box',
  minWidth: 'calc(var(--rc-ln-digits, 2) * 1ch)',
  display: 'inline-block',
  position: 'sticky',
  left: 0,
});

export const linedWithNumbers = style({});

globalStyle(`${linedWithNumbers} code`, {
  minWidth: '100%',
  width: 'max-content',
});

globalStyle(`${card} ${linedWithNumbers} .line`, {
  paddingLeft: 0,
});

globalStyle(`${linedWithNumbers} .line::before`, {
  color: vars.color.textQuaternary,
  minWidth: 'calc(var(--rc-ln-digits, 2) * 1ch)',
  paddingLeft: '16px',
  paddingRight: '16px',
  backgroundColor: vars.color.codeBg,
  zIndex: 1,
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
  display: 'block',
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeCode,
  lineHeight: vars.typography.lineHeightCode,
  color: vars.color.text,
  backgroundColor: vars.color.codeBg,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
  margin: `${vars.flow.block} 0`,
  border: `1px solid ${vars.color.border}`,
} as const;

const contentPreStyles = {
  margin: 0,
  padding: '12px 16px',
  overflowX: 'auto',
} as const;

const contentCodeStyles = {
  fontFamily: 'inherit',
  fontSize: 'inherit',
  background: 'none',
  border: 'none',
  boxShadow: 'none',
  padding: 0,
  color: 'inherit',
} as const;

const contentHeaderStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '36px',
  padding: '0 6px 0 14px',
  backgroundColor: vars.color.codeHeaderBg,
  borderBottom: `1px solid ${vars.color.border}`,
  fontFamily: vars.typography.fontFamilySans,
  fontSize: '12px',
  lineHeight: 1,
  color: vars.color.textTertiary,
  userSelect: 'none',
} as const;

const contentLangStyles = {
  fontFamily: 'inherit',
} as const;

const contentCopyButtonStyles = {
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: vars.color.textTertiary,
  cursor: 'pointer',
  padding: '6px 8px',
  borderRadius: '6px',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 1,
  transition: 'color 0.15s ease, background-color 0.15s ease',
} as const;

const contentCopyButtonHoverStyles = {
  color: vars.color.text,
  backgroundColor: vars.color.fill,
} as const;

const contentNumberedLineStyles = {
  counterIncrement: 'line',
} as const;

const contentNumberedLineBeforeStyles = {
  content: 'counter(line)',
  display: 'inline-block',
  minWidth: 'calc(var(--rc-ln-digits, 2) * 1ch)',
  marginRight: '16px',
  textAlign: 'right',
  color: `${vars.color.textQuaternary} !important` as any,
  userSelect: 'none',
} as const;

export const contentRoot = style(contentRootStyles);
export const contentHeader = style(contentHeaderStyles);
export const contentLang = style(contentLangStyles);
export const contentCopyButton = style(contentCopyButtonStyles);

// Content node classes stay global because they're consumed across editor/renderer boundaries.
globalStyle(`.${contentSemanticClassNames.root}`, contentRootStyles);
globalStyle(`.${contentSemanticClassNames.root} pre`, contentPreStyles);
globalStyle(`pre.${contentSemanticClassNames.root}, code.${contentSemanticClassNames.root}`, {
  ...contentPreStyles,
  whiteSpace: 'pre',
});
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
