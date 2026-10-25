import { inDarkScheme, vars } from '@haklex/rich-style-token/styles';
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
  border: `1px solid ${vars.color.borderSubtle}`,
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
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
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
  'transition': 'color 120ms ease-out, background-color 120ms ease-out',
  ':hover': {
    color: vars.color.text,
    backgroundColor: vars.color.fillSecondary,
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

/* ---- Code body (CodeMirror host) ---- */
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
  'borderTop': `1px solid ${vars.color.borderSubtle}`,
  'background': vars.color.codeBg,
  'color': vars.color.textTertiary,
  'fontFamily': vars.typography.fontFamilySans,
  'fontSize': '12px',
  'cursor': 'pointer',
  ':hover': {
    color: vars.color.text,
  },
});

globalStyle(`${body} pre, ${body} code, ${body} .line, ${body} .line span`, {
  fontFamily: `${vars.typography.fontMono} !important` as any,
});

/* ---- Highlighted output overrides ---- */
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

globalStyle(`${card} .highlights, ${card} code, ${card} pre`, {
  background: 'transparent !important' as any,
});

/* ---- Dual-theme: dark mode variable switch ---- */
globalStyle(inDarkScheme(`${card} .highlights-themes, ${card} .highlights-themes span`), {
  color: 'var(--hls-dark) !important' as any,
});

globalStyle(`${card} .line`, {
  display: 'block',
  padding: '0 16px',
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
  background: `color-mix(in oklab, ${vars.color.alertTip} 12%, transparent)`,
});

globalStyle(`${card} .diff.add::before`, { background: vars.color.alertTip });

globalStyle(`${card} .diff.add::after`, {
  content: "' +'",
  position: 'absolute',
  left: 0,
  color: vars.color.alertTip,
});

globalStyle(`${card} .diff.remove`, {
  background: `color-mix(in oklab, ${vars.color.alertCaution} 12%, transparent)`,
});

globalStyle(`${card} .diff.remove::before`, { background: vars.color.alertCaution });

globalStyle(`${card} .diff.remove::after`, {
  content: "' -'",
  position: 'absolute',
  left: 0,
  color: vars.color.alertCaution,
});

/* ---- Line-numbered container (fallback + static highlight) ---- */
export const lined = style({
  counterReset: 'code-line 0',
});

globalStyle(`${lined} .line`, {
  counterIncrement: 'code-line 1',
});

globalStyle(`${lined} .line::before`, {
  content: 'counter(code-line)',
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
  border: `1px solid ${vars.color.borderSubtle}`,
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
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
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
  backgroundColor: vars.color.fillSecondary,
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
