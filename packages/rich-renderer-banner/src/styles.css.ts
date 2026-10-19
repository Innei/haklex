import { chatVariant, commentVariant } from '@haklex/rich-editor/styles';
import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

const bannerTypeColors = {
  note: vars.color.alertInfo,
  tip: vars.color.alertTip,
  important: vars.color.alertImportant,
  warning: vars.color.alertWarning,
  caution: vars.color.alertCaution,
} as const;

const bannerTypeStyles = {
  note: {
    backgroundColor: `color-mix(in oklab, ${vars.color.alertInfo} 8%, transparent)`,
  },
  tip: {
    backgroundColor: `color-mix(in oklab, ${vars.color.alertTip} 8%, transparent)`,
  },
  important: {
    backgroundColor: `color-mix(in oklab, ${vars.color.alertImportant} 8%, transparent)`,
  },
  warning: {
    backgroundColor: `color-mix(in oklab, ${vars.color.alertWarning} 8%, transparent)`,
  },
  caution: {
    backgroundColor: `color-mix(in oklab, ${vars.color.alertCaution} 8%, transparent)`,
  },
} as const;

const bannerIconTypeStyles = {
  note: { color: vars.color.alertInfo },
  tip: { color: vars.color.alertTip },
  important: { color: vars.color.alertImportant },
  warning: { color: vars.color.alertWarning },
  caution: { color: vars.color.alertCaution },
} as const;

export const semanticClassNames = {
  root: 'rich-banner',
  inner: 'rich-banner-inner',
  icon: 'rich-banner-icon',
  content: 'rich-banner-content',
  contentEditable: 'rich-banner-content-editable',
} as const;

export const semanticTypeClassNames = {
  root: {
    note: 'rich-banner-note',
    tip: 'rich-banner-tip',
    important: 'rich-banner-important',
    warning: 'rich-banner-warning',
    caution: 'rich-banner-caution',
  },
  icon: {
    note: 'rich-banner-icon-note',
    tip: 'rich-banner-icon-tip',
    important: 'rich-banner-icon-important',
    warning: 'rich-banner-icon-warning',
    caution: 'rich-banner-icon-caution',
  },
} as const;

const bannerRootStyles = {
  borderRadius: vars.borderRadius.md,
  border: 'none',
  padding: '14px 18px',
  margin: `${vars.flow.block} 0`,
  color: vars.color.text,
  lineHeight: vars.typography.lineHeight,
} as const;

export const bannerRoot = style(bannerRootStyles);

const bannerInnerStyles = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '12px',
} as const;

export const bannerInner = style(bannerInnerStyles);

// The box keeps the text's font size so `1lh` is one line of banner text; the
// glyph inside is sized separately and centred on that line.
const bannerIconStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  height: '1lh',
  alignSelf: 'flex-start',
} as const;

export const bannerIcon = style(bannerIconStyles);

globalStyle(`${bannerIcon} svg, .rich-banner-icon svg`, {
  width: '18px',
  height: '18px',
});

const bannerContentStyles = {
  flex: 1,
  minWidth: 0,
  minHeight: '1em',
} as const;

export const bannerContent = style({
  ...bannerContentStyles,
});

const bannerContentEditableStyles = {
  outline: 'none',
  width: '100%',
} as const;

export const bannerContentEditable = style(bannerContentEditableStyles);

export const bannerType = recipe({
  variants: {
    type: bannerTypeStyles,
  },
});

export const bannerIconType = recipe({
  variants: {
    type: bannerIconTypeStyles,
  },
});

export const bannerTrigger = style({
  font: 'inherit',
  lineHeight: 'inherit',
  cursor: 'pointer',
  borderRadius: '4px',
  border: 'none',
  background: 'none',
  padding: '0 2px',
  margin: '0 -2px',
  transition: 'background-color 0.15s',
  selectors: {
    '&:hover': {
      backgroundColor: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
    },
  },
});

export const bannerMenuIcon = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,
});

// Content node classes stay global because they are consumed across editor/renderer boundaries.
globalStyle(`.${semanticClassNames.root}`, bannerRootStyles);
globalStyle(`.${semanticClassNames.inner}`, bannerInnerStyles);
globalStyle(`.${semanticClassNames.icon}`, bannerIconStyles);
globalStyle(`.${semanticClassNames.content}`, bannerContentStyles);
globalStyle(`.${semanticClassNames.contentEditable}`, bannerContentEditableStyles);

globalStyle(`.${semanticClassNames.content} > .rich-paragraph:first-child`, {
  marginTop: 0,
});

globalStyle(`.${semanticClassNames.content} > .rich-paragraph:last-child`, {
  marginBottom: 0,
});

globalStyle(`.${semanticClassNames.content} .rich-paragraph`, {
  margin: 0,
  marginBottom: '0.5em',
});

globalStyle(`.${semanticClassNames.content} .rich-paragraph:last-child`, {
  marginBottom: 0,
});

for (const type of Object.keys(bannerTypeColors) as Array<keyof typeof bannerTypeColors>) {
  globalStyle(`.${semanticTypeClassNames.icon[type]}`, bannerIconTypeStyles[type]);
  globalStyle(`.${semanticTypeClassNames.root[type]}`, bannerTypeStyles[type]);
}

const darkScopes = ["[data-theme='dark']", '.dark'];
const compactScopes = [commentVariant, chatVariant].map((v) => `.${v}`);

for (const type of Object.keys(bannerTypeColors) as Array<keyof typeof bannerTypeColors>) {
  globalStyle(darkScopes.map((d) => `${d} .${semanticTypeClassNames.root[type]}`).join(', '), {
    backgroundColor: `color-mix(in oklab, ${bannerTypeColors[type]} 14%, transparent)`,
  });
}

globalStyle(compactScopes.map((v) => `${v} .${semanticClassNames.root}`).join(', '), {
  padding: '10px 14px',
});
