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

globalStyle(
  [
    sharedStyles.headingH1,
    sharedStyles.headingH2,
    sharedStyles.headingH3,
    sharedStyles.headingH4,
    sharedStyles.headingH5,
    sharedStyles.headingH6,
  ]
    .map(comment)
    .join(', '),
  {
    fontSize: '1em',
    fontWeight: 600,
    marginTop: vars.flow.heading,
    marginBottom: '0.25em',
  },
);

globalStyle(`${commentBase} .line::before`, {
  display: 'none !important' as any,
});

globalStyle(comment(sharedStyles.table), {
  minWidth: 0,
});

globalStyle(`${commentBase} .rich-image`, {
  margin: `${vars.flow.block} 0`,
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

globalStyle(comment(sharedStyles.hr), {
  border: 'none',
  borderTop: `1px solid ${vars.color.hrBorder}`,
  margin: `${vars.spacing.lg} auto`,
  width: 60,
});

globalStyle(comment(katexStyles.block), {
  padding: `${vars.spacing.sm} 0`,
  margin: `${vars.flow.block} 0`,
});
