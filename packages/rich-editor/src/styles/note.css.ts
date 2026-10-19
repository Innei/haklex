import { noteTheme, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

import { katexStyles } from './katex.css';
import { richContent, sharedStyles } from './shared.css';

const noteBase = style({
  maxWidth: vars.layout.maxWidth,
  fontSize: vars.typography.fontSizeBase,
  lineHeight: vars.typography.lineHeight,
  color: vars.color.text,
});

export const noteVariant = style([richContent, noteTheme, noteBase]);
const note = (selector: string) => `${noteBase} ${selector}`;
const plainListItem = `${sharedStyles.listItem}:not(${sharedStyles.listItemChecked}):not(${sharedStyles.listItemUnchecked})`;

// ─── Paragraphs ─────────────────────────────────────────
// Use direct-child selectors so first-line indent only affects
// top-level prose paragraphs, not paragraphs nested inside alerts, quotes, tables, etc.
const editorTopParagraph = `${noteBase} .rich-editor__content > ${sharedStyles.paragraph}`;
const rendererTopParagraph = `${noteBase}.rich-content:not([data-rich-nested='true']) > ${sharedStyles.paragraph}`;

globalStyle(`${editorTopParagraph}, ${rendererTopParagraph}`, {
  marginTop: 0,
  marginBottom: vars.flow.paragraph,
});

globalStyle(`${rendererTopParagraph}:not(:first-of-type)`, {
  textIndent: '2em',
});

// text-indent is inherited: inline-block children (footnote refs, mention
// chips) would indent their own first line by 2em.
globalStyle(`${rendererTopParagraph} *`, {
  textIndent: 0,
});

globalStyle(`${editorTopParagraph}:first-of-type, ${rendererTopParagraph}:first-of-type`, {
  marginTop: 0,
});

// Instead of text-indent (which indents the entire first line including
// inline decorators like mention/katex), apply margin on the first text
// child only. If the paragraph starts with a decorator, no indent is added.
globalStyle(`${editorTopParagraph}:not(:first-of-type) > [data-lexical-text]:first-child`, {
  marginInlineStart: '2em',
});

// Keep the note lead-paragraph treatment while preserving the new indent rules.
globalStyle(`${rendererTopParagraph}:first-of-type::first-letter`, {
  float: 'left',
  fontSize: '2.4em',
  marginRight: '0.2em',
  lineHeight: '1',
});

globalStyle(`${editorTopParagraph}:first-of-type::first-letter`, {
  fontSize: '1.5em',
  fontWeight: 700,
  color: vars.color.accent,
});

globalStyle(`${editorTopParagraph}:last-child, ${rendererTopParagraph}:last-child`, {
  marginBottom: 0,
});

// ─── Bold uses sans-serif ────────────────────────────────
globalStyle(note(sharedStyles.textBold), {
  fontFamily: vars.typography.fontFamily,
  fontWeight: 600,
  color: vars.color.text,
});

// ─── Blockquote (sticky-note style) ─────────────────────
globalStyle(note(sharedStyles.quote), {
  fontFamily: vars.typography.fontFamilyKai,
  fontStyle: 'normal',
  lineHeight: '1.75',
  color: `color-mix(in srgb, ${vars.color.accent} 60%, ${vars.color.text})`,
  backgroundColor: `color-mix(in srgb, ${vars.color.accent} 12%, ${vars.color.bg})`,
  marginTop: '1.6em',
  marginBottom: '1.6em',
  marginLeft: 0,
  marginRight: 0,
  paddingTop: '1.2em',
  paddingBottom: '1.2em',
  paddingLeft: '1.5em',
  paddingRight: '1.5em',
  borderRadius: '2px',
  boxShadow: '2px 3px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  transform: 'rotate(-0.6deg)',
  textIndent: 0,
});

globalStyle(`${note(sharedStyles.quote)}::before`, {
  content: '""',
  position: 'absolute',
  top: '-7px',
  left: '50%',
  transform: 'translateX(-50%) rotate(1.2deg)',
  width: '56px',
  height: '16px',
  background: `repeating-linear-gradient(105deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px), color-mix(in srgb, ${vars.color.accent} 20%, rgba(0,0,0,0.06))`,
  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  borderRadius: '1px',
  bottom: 'auto',
  opacity: 0.85,
});

globalStyle(note(`${sharedStyles.quote} ${sharedStyles.paragraph}:first-child::first-letter`), {
  float: 'none',
  fontSize: 'inherit',
  marginRight: 0,
});

globalStyle(note(plainListItem), {
  paddingLeft: '0.25em',
});

// ─── Tables ─────────────────────────────────────────────

globalStyle(note(`${sharedStyles.table} ${sharedStyles.paragraph}:first-child::first-letter`), {
  float: 'none',
  fontSize: 'inherit',
  marginRight: 0,
});

// ─── Images ─────────────────────────────────────────────
globalStyle(`${noteBase} .rich-image`, {
  marginTop: vars.flow.block,
  marginBottom: vars.flow.block,
});

globalStyle(`${noteBase} .rich-image[data-layout^="float"]`, {
  marginTop: '0.125rem',
  marginBottom: '0.875rem',
});

globalStyle(`${noteBase} .rich-image-wrapper[data-layout^="float"] .rich-image`, {
  marginTop: 0,
  marginBottom: 0,
});

globalStyle(`${noteBase} .rich-image img`, {
  borderRadius: vars.borderRadius.md,
});

globalStyle(`${noteBase} .rich-image figcaption`, {
  fontSize: vars.typography.fontSizeCaption,
  lineHeight: vars.typography.lineHeightCompact,
  marginTop: '1em',
  color: vars.color.textTertiary,
  textAlign: 'center',
});

// ─── HR (match markdown--note: border + opacity 20%) ───────
globalStyle(note(sharedStyles.hr), {
  border: 'none',
  borderTop: `1px solid ${vars.color.hrBorder}`,
  opacity: 0.2,
  marginTop: '0.5rem',
  marginBottom: '0.5rem',
  width: 60,
  marginLeft: 'auto',
  marginRight: 'auto',
});

// ─── KaTeX ──────────────────────────────────────────────
globalStyle(note(katexStyles.block), {
  marginTop: '1.6em',
  marginBottom: '1.6em',
  overflowX: 'auto',
  padding: '1em 0',
});

// ─── Spoiler ────────────────────────────────────────────
globalStyle(note(sharedStyles.spoiler), {
  borderRadius: vars.borderRadius.sm,
  paddingInline: '0.25em',
});

// ─── First/Last child reset ─────────────────────────────
globalStyle(`${noteBase} > *:first-child`, {
  marginTop: 0,
});

globalStyle(`${noteBase} > *:last-child`, {
  marginBottom: 0,
});
