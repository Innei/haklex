import { chatTheme, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

import { katexStyles } from './katex.css';
import { richContent, sharedStyles } from './shared.css';

const chatBase = style({
  fontSize: vars.typography.fontSizeBase,
  lineHeight: vars.typography.lineHeight,
});

export const chatVariant = style([richContent, chatTheme, chatBase]);
const chat = (selector: string) => `${chatBase} ${selector}`;

globalStyle(
  [
    sharedStyles.headingH1,
    sharedStyles.headingH2,
    sharedStyles.headingH3,
    sharedStyles.headingH4,
    sharedStyles.headingH5,
    sharedStyles.headingH6,
  ]
    .map(chat)
    .join(', '),
  {
    fontSize: '1em',
    fontWeight: 600,
    marginTop: vars.flow.heading,
    marginBottom: '0.25em',
  },
);

globalStyle(chat(sharedStyles.headingH1), { fontSize: '1.25em' });
globalStyle(chat(sharedStyles.headingH2), { fontSize: '1.125em' });

globalStyle(`${chatBase} .line::before`, {
  display: 'none !important' as any,
});

globalStyle(chat(sharedStyles.table), {
  minWidth: 0,
});

globalStyle(`${chatBase} .rich-image`, {
  margin: `${vars.flow.block} 0`,
});

globalStyle(`${chatBase} .rich-image[data-layout^="float"]`, {
  marginTop: '0.125rem',
  marginBottom: '0.875rem',
});

globalStyle(`${chatBase} .rich-image-wrapper[data-layout^="float"] .rich-image`, {
  marginTop: 0,
  marginBottom: 0,
});

globalStyle(`${chatBase} .rich-image figcaption`, {
  fontSize: vars.typography.fontSizeSmall,
});

globalStyle(chat(sharedStyles.hr), {
  border: 'none',
  borderTop: `1px solid ${vars.color.hrBorder}`,
  margin: `${vars.spacing.lg} auto`,
  width: 60,
});

globalStyle(chat(katexStyles.block), {
  padding: `${vars.spacing.sm} 0`,
  margin: `${vars.flow.block} 0`,
});
