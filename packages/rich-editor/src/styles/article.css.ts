import { articleTheme, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

import { detailsStyles } from './details.css';
import { richContent, sharedStyles } from './shared.css';

const articleBase = style({
  maxWidth: vars.layout.maxWidth,
  fontSize: vars.typography.fontSizeBase,
  lineHeight: vars.typography.lineHeight,
  color: vars.color.text,
});

export const articleVariant = style([richContent, articleTheme, articleBase]);
const article = (selector: string) => `${articleBase} ${selector}`;
const plainListItem = `${sharedStyles.listItem}:not(${sharedStyles.listItemChecked}):not(${sharedStyles.listItemUnchecked})`;

globalStyle(article(plainListItem), {
  paddingLeft: '0.25em',
});

globalStyle(
  `${article(sharedStyles.listUl)} ${sharedStyles.listUl}, ${article(sharedStyles.listUl)} ${sharedStyles.listOl}, ${article(sharedStyles.listOl)} ${sharedStyles.listUl}, ${article(sharedStyles.listOl)} ${sharedStyles.listOl}`,
  {
    marginTop: vars.flow.list,
    marginBottom: 0,
  },
);

globalStyle(`${articleBase} .rich-image`, {
  marginTop: vars.flow.block,
  marginBottom: vars.flow.block,
});

globalStyle(`${articleBase} .rich-image[data-layout^="float"]`, {
  marginTop: '0.125rem',
  marginBottom: '0.875rem',
});

globalStyle(`${articleBase} .rich-image-wrapper[data-layout^="float"] .rich-image`, {
  marginTop: 0,
  marginBottom: 0,
});

globalStyle(`${articleBase} .rich-image > *`, {
  marginTop: '0',
  marginBottom: '0',
});

globalStyle(`${articleBase} .rich-image figcaption`, {
  color: vars.color.textTertiary,
  fontSize: vars.typography.fontSizeCaption,
  lineHeight: vars.typography.lineHeightCompact,
  marginTop: '1em',
});

globalStyle(article(sharedStyles.hr), {
  borderColor: vars.color.hrBorder,
  borderTopWidth: '1px',
  marginTop: '3.5em',
  marginBottom: '3.5em',
  width: 60,
  marginLeft: 'auto',
  marginRight: 'auto',
});

globalStyle(
  `${article(sharedStyles.hr)} + *, ${articleBase} :where([data-virtual-editor-content]) > [data-document-prev-tag="hr"]`,
  {
    marginTop: '0',
  },
);

globalStyle(`${articleBase} .rich-banner`, {
  margin: `${vars.flow.block} 0`,
});

globalStyle(`${articleBase} .rich-code-snippet`, {
  margin: `${vars.flow.block} 0`,
});

globalStyle(article(detailsStyles.details), {
  margin: `${vars.flow.block} 0`,
});

globalStyle(`${articleBase} > *:first-child`, {
  marginTop: 0,
});

globalStyle(`${articleBase} > *:last-child`, {
  marginBottom: 0,
});
