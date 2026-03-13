import { articleTheme, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

import { detailsStyles } from './details.css';
import { richContent, sharedStyles } from './shared.css';

// Helper for em calculation (based on 16px base)
const em = (target: number, context = 16) => `${target / context}em`;
const trailingFractionZeroRe = /(\.\d*?[1-9])0+$/;
const zeroFractionRe = /\.0+$/;
const round = (num: number) =>
  num.toFixed(7).replace(trailingFractionZeroRe, '$1').replace(zeroFractionRe, '');

// Prose-style typography
// Base font size: 16px

const articleBase = style({
  maxWidth: vars.layout.maxWidth,
  fontSize: vars.typography.fontSizeBase,
  lineHeight: round(28 / 16), // 1.75
  color: vars.color.text,
});

export const articleVariant = style([richContent, articleTheme, articleBase]);
const article = (selector: string) => `${articleBase} ${selector}`;
const plainListItem = `${sharedStyles.listItem}:not(${sharedStyles.listItemChecked}):not(${sharedStyles.listItemUnchecked})`;

// ─── Tailwind Prose LG Styles ───────────────────────────
// Reference: https://github.com/tailwindlabs/tailwindcss-typography/blob/master/src/styles.js

globalStyle(article(sharedStyles.paragraph), {
  marginTop: em(24, 16),
  marginBottom: em(24, 16),
});

globalStyle(article(sharedStyles.headingH1), {
  color: vars.color.text,
  fontWeight: 800,
  fontSize: em(48, 16),
  marginTop: '0',
  marginBottom: em(40, 48), // 0.8333333em
  lineHeight: 1,
});

globalStyle(article(sharedStyles.headingH2), {
  color: vars.color.text,
  fontWeight: 700,
  fontSize: em(30, 16),
  marginTop: em(56, 30), // 1.8666667em
  marginBottom: em(32, 30), // 1.0666667em
  lineHeight: round(40 / 30), // 1.3333333
});

globalStyle(article(sharedStyles.headingH3), {
  color: vars.color.text,
  fontWeight: 600,
  fontSize: em(24, 16),
  marginTop: em(40, 24), // 1.6666667em
  marginBottom: em(16, 24), // 0.6666667em
  lineHeight: round(36 / 24), // 1.5
});

globalStyle(article(sharedStyles.headingH4), {
  color: vars.color.text,
  fontWeight: 600,
  marginTop: em(32, 16),
  marginBottom: em(8, 16),
  lineHeight: round(25 / 16), // ~1.56
});

// Heading + * resets
globalStyle(
  `${article(sharedStyles.headingH2)} + *, ${article(sharedStyles.headingH3)} + *, ${article(sharedStyles.headingH4)} + *`,
  {
    marginTop: '0',
  },
);

globalStyle(article(sharedStyles.quote), {
  fontWeight: 500,
  fontStyle: 'italic',
  color: vars.color.text,
  marginTop: em(40, 16),
  marginBottom: em(40, 16),
  paddingLeft: `calc(${em(24, 16)} + 4px)`,
  backgroundColor: 'transparent',
  borderRadius: 0,
  quotes: '"\\201C""\\201D""\\2018""\\2019"',
});

globalStyle(article(`${sharedStyles.quote} ${sharedStyles.paragraph}:first-of-type::before`), {
  content: 'open-quote',
});

globalStyle(article(`${sharedStyles.quote} ${sharedStyles.paragraph}:last-of-type::after`), {
  content: 'close-quote',
});

globalStyle(article(`${sharedStyles.quote} ${sharedStyles.paragraph}:first-child`), {
  marginTop: 0,
});

globalStyle(article(`${sharedStyles.quote} ${sharedStyles.paragraph}:last-child`), {
  marginBottom: 0,
});

globalStyle(article(sharedStyles.textCode), {
  color: vars.color.text,
  fontWeight: 600,
  fontSize: em(14, 16),
  backgroundColor: vars.color.codeBg,
  padding: '0.2em 0.4em',
  borderRadius: vars.borderRadius.sm,
  fontFamily: vars.typography.fontMono,
});

globalStyle(`${article(sharedStyles.textCode)}::before, ${article(sharedStyles.textCode)}::after`, {
  content: '"`"',
  color: vars.color.textSecondary,
  opacity: 0.5,
});

globalStyle(
  `${articleBase} [contenteditable="true"] ${sharedStyles.textCode}::before, ${articleBase} [contenteditable="true"] ${sharedStyles.textCode}::after`,
  {
    content: '',
  },
);

globalStyle(`${articleBase} .rich-code-block`, {
  color: vars.color.text,
  backgroundColor: vars.color.codeBg,
  borderRadius: '0.375rem', // rem(6)
  marginTop: em(32, 16), // 2em (relative to code font size 16px)
  marginBottom: em(32, 16),
  fontSize: em(14, 16), // 0.8888889em
  lineHeight: round(28 / 16), // 1.75
});

globalStyle(`${articleBase} .rich-code-block pre`, {
  paddingTop: em(16, 16), // 1em
  paddingRight: em(24, 16), // 1.5em
  paddingBottom: em(16, 16),
  paddingLeft: em(24, 16),
  margin: 0, // Reset default pre margin
});

globalStyle(`${article(sharedStyles.listUl)}, ${article(sharedStyles.listOl)}`, {
  marginTop: em(24, 16),
  marginBottom: em(24, 16),
  paddingLeft: em(28, 16), // 1.5555556em
});

globalStyle(article(sharedStyles.listItem), {
  marginTop: em(12, 16),
  marginBottom: em(12, 16),
});

globalStyle(article(plainListItem), {
  paddingLeft: em(8, 16), // LG padding inline start for plain li
});

globalStyle(article(`${sharedStyles.listItem} ${sharedStyles.paragraph}`), {
  marginTop: em(16, 16),
  marginBottom: em(16, 16),
});

globalStyle(article(`${sharedStyles.listItem} > ${sharedStyles.paragraph}:first-child`), {
  marginTop: em(24, 16),
});

globalStyle(article(`${sharedStyles.listItem} > ${sharedStyles.paragraph}:last-child`), {
  marginBottom: em(24, 16),
});

// Nested lists
globalStyle(
  `${article(sharedStyles.listUl)} ${sharedStyles.listUl}, ${article(sharedStyles.listUl)} ${sharedStyles.listOl}, ${article(sharedStyles.listOl)} ${sharedStyles.listUl}, ${article(sharedStyles.listOl)} ${sharedStyles.listOl}`,
  {
    marginTop: em(16, 16),
    marginBottom: em(16, 16),
  },
);

globalStyle(article(sharedStyles.table), {
  marginTop: em(32, 16),
  marginBottom: em(32, 16),
  fontSize: em(14, 16),
  lineHeight: round(24 / 16),
});

globalStyle(article(`${sharedStyles.table} ${sharedStyles.paragraph}`), {
  margin: 0,
  padding: 0,
  lineHeight: 'inherit',
});

globalStyle(`${articleBase} .rich-image`, {
  marginTop: em(32, 16),
  marginBottom: em(32, 16),
});

globalStyle(`${articleBase} .rich-image > *`, {
  marginTop: '0',
  marginBottom: '0',
});

globalStyle(`${articleBase} .rich-image figcaption`, {
  color: vars.color.textSecondary,
  fontSize: em(14, 16),
  lineHeight: round(24 / 16), // 1.5
  marginTop: em(16, 16),
});

globalStyle(article(sharedStyles.hr), {
  borderColor: vars.color.hrBorder,
  borderTopWidth: '1px',
  marginTop: em(56, 16),
  marginBottom: em(56, 16),
  width: 60,
  marginLeft: 'auto',
  marginRight: 'auto',
});

globalStyle(`${article(sharedStyles.hr)} + *`, {
  marginTop: '0',
});

globalStyle(article(sharedStyles.link), {
  fontWeight: 500,
  textDecoration: 'underline',
});

// ─── Banner ─────────────────────────────────────────────
globalStyle(`${articleBase} .rich-banner`, {
  margin: `${em(32, 16)} 0`,
});

// ─── Code Snippet ───────────────────────────────────────
globalStyle(`${articleBase} .rich-code-snippet`, {
  margin: `${em(32, 16)} 0`,
});

// ─── Details ────────────────────────────────────────────
globalStyle(article(detailsStyles.details), {
  margin: `${em(32, 16)} 0`,
});

// ─── First-child reset ──────────────────────────────────
globalStyle(`${articleBase} > *:first-child`, {
  marginTop: 0,
});

globalStyle(`${articleBase} > *:last-child`, {
  marginBottom: 0,
});
