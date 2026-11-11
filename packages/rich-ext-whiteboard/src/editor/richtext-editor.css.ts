import { globalStyle, style } from '@vanilla-extract/css';

import {
  RICHTEXT_LINK_COLOR,
  RICHTEXT_LIST_INDENT,
  RICHTEXT_QUOTE_BORDER,
  RICHTEXT_QUOTE_INDENT,
} from '../model/richtext';

export const surface = style({
  position: 'absolute',
  zIndex: 2,
  boxSizing: 'border-box',
  transformOrigin: '0 0',
  pointerEvents: 'auto',
  userSelect: 'text',
});

export const editable = style({
  outline: 'none',
  minHeight: '100%',
});

export const paragraph = style({ margin: 0, fontSize: 16, lineHeight: 1.5 });
export const h1 = style({ margin: 0, fontSize: 26, lineHeight: 1.3, fontWeight: 600 });
export const h2 = style({ margin: 0, fontSize: 22, lineHeight: 1.35, fontWeight: 600 });
export const h3 = style({ margin: 0, fontSize: 18, lineHeight: 1.4, fontWeight: 600 });
export const hOther = style({ margin: 0, fontSize: 16, lineHeight: 1.5, fontWeight: 600 });
export const quote = style({
  margin: 0,
  fontSize: 16,
  lineHeight: 1.5,
  paddingLeft: RICHTEXT_QUOTE_INDENT - 3,
  borderLeft: RICHTEXT_QUOTE_BORDER,
});
export const list = style({ margin: 0, paddingLeft: RICHTEXT_LIST_INDENT });
export const listItem = style({ fontSize: 16, lineHeight: 1.5 });
export const nestedListItem = style({ listStyleType: 'none' });
export const underline = style({ textDecoration: 'underline' });
export const strikethrough = style({ textDecoration: 'line-through' });
export const underlineStrikethrough = style({ textDecoration: 'underline line-through' });
export const link = style({ color: RICHTEXT_LINK_COLOR });

export const editingCard = style({});

globalStyle(`${editingCard} foreignObject`, { visibility: 'hidden' });
