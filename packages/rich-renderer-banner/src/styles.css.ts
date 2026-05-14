import { noteVariant } from '@haklex/rich-editor/styles';
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
    backgroundColor: `color-mix(in srgb, ${vars.color.alertInfo} 8%, transparent)`,
    borderColor: `color-mix(in srgb, ${vars.color.alertInfo} 30%, transparent)`,
  },
  tip: {
    backgroundColor: `color-mix(in srgb, ${vars.color.alertTip} 8%, transparent)`,
    borderColor: `color-mix(in srgb, ${vars.color.alertTip} 30%, transparent)`,
  },
  important: {
    backgroundColor: `color-mix(in srgb, ${vars.color.alertImportant} 8%, transparent)`,
    borderColor: `color-mix(in srgb, ${vars.color.alertImportant} 30%, transparent)`,
  },
  warning: {
    backgroundColor: `color-mix(in srgb, ${vars.color.alertWarning} 8%, transparent)`,
    borderColor: `color-mix(in srgb, ${vars.color.alertWarning} 30%, transparent)`,
  },
  caution: {
    backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 8%, transparent)`,
    borderColor: `color-mix(in srgb, ${vars.color.alertCaution} 30%, transparent)`,
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
  border: '1px solid',
  padding: vars.spacing.lg,
  margin: `${vars.spacing.md} 0`,
  color: vars.color.text,
  lineHeight: '1.8',
} as const;

export const bannerRoot = style(bannerRootStyles);

const bannerInnerStyles = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: vars.spacing.md,
} as const;

export const bannerInner = style(bannerInnerStyles);

const bannerIconStyles = {
  display: 'inline-flex',
  flexShrink: 0,
  fontSize: '1.5em',
  alignSelf: 'flex-start',
} as const;

export const bannerIcon = style(bannerIconStyles);

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
  cursor: 'pointer',
  borderRadius: '4px',
  border: 'none',
  background: 'none',
  padding: '2px',
  margin: '-2px',
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

globalStyle(`.${noteVariant} .${semanticClassNames.content} > .rich-paragraph`, {
  textIndent: '2em',
});

for (const type of Object.keys(bannerTypeColors) as Array<keyof typeof bannerTypeColors>) {
  globalStyle(`.${semanticTypeClassNames.icon[type]}`, bannerIconTypeStyles[type]);
  globalStyle(`.${semanticTypeClassNames.root[type]}`, bannerTypeStyles[type]);
}
