import { commentTheme, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

import { katexStyles } from './katex.css';
import { richContent, sharedStyles } from './shared.css';

const commentBase = style({
  fontSize: vars.typography.fontSizeBase,
  lineHeight: vars.typography.lineHeight,
});

export const commentVariant = style([richContent, commentTheme, commentBase]);
const comment = (selector: string) => `${commentBase} ${selector}`;

// ─── Paragraphs (tighter) ───────────────────────────────
globalStyle(comment(sharedStyles.paragraph), {
  marginBottom: '0.6em',
});

// ─── Headings (smaller, compact) ────────────────────────
globalStyle(comment(sharedStyles.headingH1), {
  fontSize: '1.35em',
  fontWeight: 700,
  marginTop: '0.8em',
  marginBottom: '0.3em',
});

globalStyle(comment(sharedStyles.headingH2), {
  fontSize: '1.2em',
  fontWeight: 700,
  marginTop: '0.7em',
  marginBottom: '0.25em',
});

globalStyle(comment(sharedStyles.headingH3), {
  fontSize: '1.1em',
  fontWeight: 600,
  marginTop: '0.6em',
  marginBottom: '0.2em',
});

globalStyle(comment(sharedStyles.headingH4), {
  fontSize: '1em',
  fontWeight: 600,
  marginTop: '0.5em',
  marginBottom: '0.15em',
});

globalStyle(comment(sharedStyles.headingH5), {
  fontSize: '0.9em',
  fontWeight: 600,
  marginTop: '0.45em',
  marginBottom: '0.1em',
});

globalStyle(comment(sharedStyles.headingH6), {
  fontSize: '0.85em',
  fontWeight: 600,
  marginTop: '0.4em',
  marginBottom: '0.1em',
});

// ─── Blockquote (compact) ───────────────────────────────
globalStyle(comment(sharedStyles.quote), {
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  paddingLeft: `calc(${vars.spacing.md} + 3px)`,
  margin: `${vars.spacing.sm} 0`,
  fontSize: '0.95em',
});

globalStyle(`${comment(sharedStyles.quote)}::before`, {
  width: '3px',
});

// ─── Lists (compact) ───────────────────────────────────
globalStyle(`${comment(sharedStyles.listOl)}, ${comment(sharedStyles.listUl)}`, {
  marginBottom: '0.6em',
  paddingLeft: vars.spacing.md,
});

globalStyle(comment(sharedStyles.listItem), {
  marginBottom: '0.1em',
});

// ─── Code block (compact) ──────────────────────────────
globalStyle(`${commentBase} .rich-code-block`, {
  margin: `${vars.spacing.sm} 0`,
  borderRadius: vars.borderRadius.sm,
  fontSize: vars.typography.fontSizeSmall,
});

globalStyle(`${commentBase} .rich-code-block pre`, {
  padding: vars.spacing.sm,
});

// Hide line numbers in comment variant (covers both shikicode and fallback)
globalStyle(`${commentBase} .line::before`, {
  display: 'none !important' as any,
});

// ─── Table (compact cells) ─────────────────────────────
globalStyle(comment(sharedStyles.table), {
  margin: `${vars.spacing.sm} 0`,
  fontSize: vars.typography.fontSizeSmall,
});

globalStyle(`${comment(sharedStyles.tableCell)}, ${comment(sharedStyles.tableCellHeader)}`, {
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
});

// ─── Images (less margin) ──────────────────────────────
globalStyle(`${commentBase} .rich-image`, {
  margin: `${vars.spacing.sm} 0`,
});

globalStyle(`${commentBase} .rich-image[data-layout^="float"]`, {
  marginTop: '0.125rem',
  marginBottom: '0.875rem',
});

globalStyle(`${commentBase} .rich-image-wrapper[data-layout^="float"] .rich-image`, {
  marginTop: 0,
  marginBottom: 0,
});

globalStyle(`${commentBase} .rich-image figcaption`, {
  fontSize: vars.typography.fontSizeSmall,
});

// ─── HR (compact, match markdown short centered line) ───
globalStyle(comment(sharedStyles.hr), {
  border: 'none',
  borderTop: `1px solid ${vars.color.hrBorder}`,
  margin: `${vars.spacing.lg} auto`,
  width: 60,
});

// ─── Alert (compact) ───────────────────────────────────
globalStyle(comment(sharedStyles.alert), {
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  paddingLeft: vars.spacing.lg,
  margin: `${vars.spacing.sm} 0`,
});

// ─── KaTeX block (compact) ─────────────────────────────
globalStyle(comment(katexStyles.block), {
  padding: `${vars.spacing.sm} 0`,
  margin: `${vars.spacing.sm} 0`,
});
