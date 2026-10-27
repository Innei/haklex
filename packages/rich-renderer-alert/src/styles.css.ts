import { chatVariant, commentVariant } from '@haklex/rich-editor/styles';
import { vars } from '@haklex/rich-style-token/styles';
import { createVar, globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

const alertColor = createVar();

const alertTypeColors = {
  note: vars.color.alertInfo,
  tip: vars.color.alertTip,
  important: vars.color.alertImportant,
  warning: vars.color.alertWarning,
  caution: vars.color.alertCaution,
} as const;

const alertTypeStyles = {
  note: { vars: { [alertColor]: vars.color.alertInfo } },
  tip: { vars: { [alertColor]: vars.color.alertTip } },
  important: { vars: { [alertColor]: vars.color.alertImportant } },
  warning: { vars: { [alertColor]: vars.color.alertWarning } },
  caution: { vars: { [alertColor]: vars.color.alertCaution } },
} as const;

export const semanticClassNames = {
  root: 'rich-alert',
  header: 'rich-alert-header',
  icon: 'rich-alert-icon',
  label: 'rich-alert-label',
  content: 'rich-alert-content',
  contentEditable: 'rich-alert-content-editable',
} as const;

export const semanticTypeClassNames = {
  root: {
    note: 'rich-alert-note',
    tip: 'rich-alert-tip',
    important: 'rich-alert-important',
    warning: 'rich-alert-warning',
    caution: 'rich-alert-caution',
  },
  header: {
    note: 'rich-alert-header-note',
    tip: 'rich-alert-header-tip',
    important: 'rich-alert-header-important',
    warning: 'rich-alert-header-warning',
    caution: 'rich-alert-header-caution',
  },
} as const;

export const alertType = recipe({
  variants: {
    type: alertTypeStyles,
  },
});

export const alertHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: vars.typography.fontFamilySans,
  fontWeight: 600,
  fontSize: '13px',
  lineHeight: 1.4,
  marginBottom: '4px',
});

export const alertTrigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  padding: '2px 6px',
  borderRadius: vars.borderRadius.sm,
  marginInline: '-6px',
  border: 'none',
  background: 'none',
  font: 'inherit',
  fontWeight: 600,
  fontSize: '13px',
  lineHeight: 1.4,
  transition: 'background-color 120ms ease-out',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.fillSecondary,
    },
  },
});

export const alertChevron = style({
  opacity: 0,
  transition: 'opacity 0.15s',
  width: '14px',
  height: '14px',
  flexShrink: 0,
  selectors: {
    [`${alertTrigger}:hover &`]: {
      opacity: 0.6,
    },
    [`${alertTrigger}[data-popup-open] &`]: {
      opacity: 0.8,
    },
  },
});

export const alertIcon = style({
  width: '15px',
  height: '15px',
  flexShrink: 0,
  color: alertColor,
});

export const alertLabel = style({
  color: alertColor,
});

export const alertMenuIcon = style({
  flexShrink: 0,
  color: alertColor,
});

const alertRootStyles = {
  position: 'relative',
  padding: '2px 0 2px 18px',
  margin: `${vars.flow.block} 0`,
  backgroundColor: 'transparent',
  borderRadius: 0,
} as const;

const alertRootBarStyles = {
  content: '""',
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: '2px',
  borderRadius: '1px',
} as const;

const alertHeaderStyles = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: vars.typography.fontFamilySans,
  fontWeight: 600,
  marginBottom: '4px',
  fontSize: '13px',
  lineHeight: 1.4,
} as const;

const alertContentStyles = {
  minHeight: '1em',
} as const;

const alertContentEditableStyles = {
  outline: 'none',
  width: '100%',
} as const;

globalStyle(`.${semanticClassNames.root}`, alertRootStyles);
globalStyle(`.${semanticClassNames.root}::before`, alertRootBarStyles);
globalStyle(`.${semanticClassNames.header}`, alertHeaderStyles);
globalStyle(`.${semanticClassNames.icon}`, {
  display: 'inline-flex',
  width: '15px',
  height: '15px',
  flexShrink: 0,
});
globalStyle(`.${semanticClassNames.content}`, alertContentStyles);
globalStyle(`.${semanticClassNames.contentEditable}`, alertContentEditableStyles);

globalStyle(`.${semanticClassNames.content} .rich-paragraph`, {
  margin: 0,
  marginBottom: '0.5em',
});

globalStyle(`.${semanticClassNames.content} .rich-paragraph:last-child`, {
  marginBottom: 0,
});

// Comment and chat fold the label into the first line of text so a one-line
// alert stays one line tall. No tint here: a filled block is Banner's shape.
const compactRoot = [commentVariant, chatVariant]
  .map((v) => `.${v} .${semanticClassNames.root}`)
  .join(', ');

globalStyle(compactRoot, {
  paddingLeft: '12px',
});

globalStyle(
  [commentVariant, chatVariant].map((v) => `.${v} .${semanticClassNames.header}`).join(', '),
  {
    float: 'left',
    marginRight: '6px',
    marginBottom: 0,
    fontSize: 'inherit',
    lineHeight: 'inherit',
  },
);

// The static renderer nests a `.rich-content` (flow-root) in the body; a new
// formatting context sits beside the float instead of wrapping under it.
globalStyle(
  [commentVariant, chatVariant]
    .map((v) => `.${v} .${semanticClassNames.content} > .rich-content`)
    .join(', '),
  {
    display: 'block',
  },
);

for (const type of Object.keys(alertTypeColors) as Array<keyof typeof alertTypeColors>) {
  globalStyle(`.${semanticTypeClassNames.root[type]}::before`, {
    backgroundColor: alertTypeColors[type],
  });
  globalStyle(`.${semanticTypeClassNames.header[type]}`, {
    color: alertTypeColors[type],
  });
}
