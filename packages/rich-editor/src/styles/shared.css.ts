import { contentTypography, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, keyframes, style } from '@vanilla-extract/css';

export const semanticClassNames = {
  paragraph: 'rich-paragraph',
  textBold: 'rich-text-bold',
  textItalic: 'rich-text-italic',
  textUnderline: 'rich-text-underline',
  textStrikethrough: 'rich-text-strikethrough',
  textSuperscript: 'rich-text-superscript',
  textSubscript: 'rich-text-subscript',
  textCode: 'rich-text-code',
  textHighlight: 'rich-text-highlight',
  headingAnchor: 'rich-heading-anchor',
  headingH1: 'rich-heading-h1',
  headingH2: 'rich-heading-h2',
  headingH3: 'rich-heading-h3',
  headingH4: 'rich-heading-h4',
  headingH5: 'rich-heading-h5',
  headingH6: 'rich-heading-h6',
  link: 'rich-link',
  linkFavicon: 'rich-link-favicon',
  listOl: 'rich-list-ol',
  listUl: 'rich-list-ul',
  listItem: 'rich-list-item',
  listNestedItem: 'rich-list-nested-item',
  checklist: 'rich-checklist',
  listItemChecked: 'rich-list-item-checked',
  listItemUnchecked: 'rich-list-item-unchecked',
  quote: 'rich-quote',
  quoteAttribution: 'rich-quote-attribution',
  hr: 'rich-hr',
  tableScrollableWrapper: 'rich-table-scrollable-wrapper',
  table: 'rich-table',
  tableCell: 'rich-table-cell',
  tableCellHeader: 'rich-table-cell-header',
  spoiler: 'rich-spoiler',
  spoilerRevealed: 'rich-spoiler-revealed',
  tag: 'rich-tag',
  comment: 'rich-comment',
  ruby: 'rich-ruby',
  rubyRt: 'rich-ruby-rt',
  footnote: 'rich-footnote',
  footnoteRef: 'rich-footnote-ref',
  footnoteHighlight: 'rich-footnote-highlight',
  footnoteRefWrapper: 'rich-footnote-ref-wrapper',
  footnoteSection: 'rich-footnote-section',
  footnoteSectionDivider: 'rich-footnote-section-divider',
  footnoteSectionList: 'rich-footnote-section-list',
  footnoteSectionItem: 'rich-footnote-section-item',
  footnoteBackRef: 'rich-footnote-back-ref',
  footnoteSectionItemEdit: 'rich-footnote-section-item-edit',
  footnoteSectionItemNum: 'rich-footnote-section-item-num',
  footnoteSectionItemInput: 'rich-footnote-section-item-input',
  footnoteSectionItemRemove: 'rich-footnote-section-item-remove',
  dragHandle: 'rich-drag-handle',
  dropIndicator: 'rich-drop-indicator',
  alert: 'rich-alert',
} as const;

const highlightKf = keyframes({
  to: { '--rc-hl-highlighted': '1' } as Record<string, string>,
});

const footnoteFlash = keyframes({
  '0%': { backgroundColor: vars.color.accentLight },
  '100%': { backgroundColor: 'transparent' },
});

const headingLevelBadge = {
  position: 'absolute',
  left: '-1.5rem',
  bottom: '0.5rem',
  display: 'flex',
  fontSize: '0.5rem',
  fontWeight: 600,
  color: vars.color.textSecondary,
  opacity: 0.6,
  pointerEvents: 'none',
  fontFamily: vars.typography.fontMono,
} as const;

const quoteBarWidth = 2;

export const richContent = style({
  // flow-root establishes a BFC so floated images (data-layout^="float")
  // cannot overflow past the end of the rendered content
  display: 'flow-root',
  ...contentTypography,
  fontSize: vars.typography.fontSizeBase,
  lineHeight: vars.typography.lineHeight,
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
});

export const paragraph = style({
  margin: 0,
  marginBottom: vars.flow.paragraph,
  lineHeight: vars.typography.lineHeight,
});

export const textBold = style({
  fontWeight: 700,
});

export const textItalic = style({
  fontStyle: 'italic',
});

export const textUnderline = style({
  textDecoration: 'underline',
});

export const textStrikethrough = style({
  textDecoration: 'line-through',
  textDecorationColor: vars.color.textQuaternary,
  color: vars.color.textTertiary,
});

// Shifted with relative positioning instead of vertical-align so the line box
// keeps the paragraph's line height.
export const textSuperscript = style({
  position: 'relative',
  top: '-0.5em',
  verticalAlign: 'baseline',
  fontSize: '0.75em',
  lineHeight: 0,
});

export const textSubscript = style({
  position: 'relative',
  top: '0.25em',
  verticalAlign: 'baseline',
  fontSize: '0.75em',
  lineHeight: 0,
});

export const textCode = style({
  fontFamily: vars.typography.fontMono,
  fontSize: '0.875em',
  fontWeight: 'normal',
  backgroundColor: vars.color.codeBg,
  color: 'inherit',
  padding: '0.12em 0.4em',
  borderRadius: vars.borderRadius.sm,
  selectors: {
    '[contenteditable="true"] &': {
      paddingRight: 0,
    },
  },
});

export const textHighlight = style({
  'vars': {
    '--rc-hl-highlighted': '1',
    '--rc-hl-color': vars.color.accentLight,
  },
  'background':
    'linear-gradient(120deg, var(--rc-hl-color, lightblue) 50%, transparent 50%) 110% 0 / 200% 100% no-repeat',
  'backgroundPosition': 'calc((1 - var(--rc-hl-highlighted)) * 110%) 0',
  'color': vars.color.text,
  'transition': 'background-position 1s',
  '@supports': {
    '(animation-timeline: view())': {
      vars: {
        '--rc-hl-highlighted': '0',
      },
      animation: `${highlightKf} steps(1) both`,
      animationTimeline: 'view()',
      animationRange: 'entry 100% cover 10%',
    } as any,
  },
  'selectors': {
    '[contenteditable="true"] &': {
      vars: {
        '--rc-hl-highlighted': '1',
      },
      animation: 'none',
    },
  },
});

export const headingAnchor = style({
  position: 'absolute',
  left: '-1.25rem',
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: vars.color.textSecondary,
  opacity: 0,
  transition: 'opacity 0.15s ease',
  fontSize: '0.8rem',
});

// Top margin is `flow.heading` measured in body ems, so it is divided by the
// heading's own size ratio before being applied in the heading's em.
const headingTop = (k: number, ratio: number) => `calc(${vars.flow.heading} * ${k / ratio})`;

const hideBadgeWhenNarrow = {
  '(max-width: 640px)': {
    selectors: {
      '[contenteditable="true"] &::before': { display: 'none' },
    },
  },
};

export const headingH1 = style({
  'position': 'relative',
  'fontSize': '1.875em',
  'fontWeight': 700,
  'lineHeight': 1.2667,
  'letterSpacing': '-0.015em',
  'marginTop': headingTop(1.25, 1.875),
  'marginBottom': '0.6em',
  'selectors': {
    '[contenteditable="true"] &::before': {
      ...headingLevelBadge,
      content: '"H1"',
    },
  },
  '@media': hideBadgeWhenNarrow,
});

export const headingH2 = style({
  'position': 'relative',
  'fontSize': '1.5em',
  'fontWeight': 650,
  'lineHeight': 1.3333,
  'letterSpacing': '-0.01em',
  'marginTop': headingTop(1.1, 1.5),
  'marginBottom': '0.5em',
  'selectors': {
    '[contenteditable="true"] &::before': {
      ...headingLevelBadge,
      content: '"H2"',
    },
  },
  '@media': hideBadgeWhenNarrow,
});

export const headingH3 = style({
  'position': 'relative',
  'fontSize': '1.25em',
  'fontWeight': 600,
  'lineHeight': 1.4,
  'marginTop': headingTop(1, 1.25),
  'marginBottom': '0.4em',
  'selectors': {
    '[contenteditable="true"] &::before': {
      ...headingLevelBadge,
      content: '"H3"',
    },
  },
  '@media': hideBadgeWhenNarrow,
});

export const headingH4 = style({
  'position': 'relative',
  'fontSize': '1.0625em',
  'fontWeight': 600,
  'lineHeight': 1.5294,
  'marginTop': headingTop(0.9, 1.0625),
  'marginBottom': '0.35em',
  'selectors': {
    '[contenteditable="true"] &::before': {
      ...headingLevelBadge,
      content: '"H4"',
    },
  },
  '@media': hideBadgeWhenNarrow,
});

export const headingH5 = style({
  'position': 'relative',
  'fontSize': '1em',
  'fontWeight': 600,
  'lineHeight': vars.typography.lineHeightTight,
  'marginTop': headingTop(0.9, 1),
  'marginBottom': '0.3em',
  'selectors': {
    '[contenteditable="true"] &::before': {
      ...headingLevelBadge,
      content: '"H5"',
    },
  },
  '@media': hideBadgeWhenNarrow,
});

export const headingH6 = style({
  'position': 'relative',
  'fontSize': '0.875em',
  'fontWeight': 600,
  'lineHeight': vars.typography.lineHeightTight,
  'marginTop': headingTop(0.9, 0.875),
  'marginBottom': '0.25em',
  'color': vars.color.textSecondary,
  'selectors': {
    '[contenteditable="true"] &::before': {
      ...headingLevelBadge,
      content: '"H6"',
    },
  },
  '@media': hideBadgeWhenNarrow,
});

globalStyle(
  [headingH1, headingH2, headingH3, headingH4, headingH5, headingH6]
    .map((h) => `${h} + *`)
    .join(', '),
  { marginTop: 0 },
);

export const link = style({
  color: vars.color.link,
  textDecoration: 'underline',
  textDecorationThickness: '1px',
  textUnderlineOffset: '0.22em',
  textDecorationColor: `color-mix(in oklab, ${vars.color.link} 35%, transparent)`,
  transition: 'color 0.2s ease, text-decoration-color 0.2s ease',
  selectors: {
    '&:hover': {
      textDecorationColor: vars.color.link,
    },
    '&[data-favicon="loaded"]::before': {
      content: '""',
      display: 'inline-block',
      width: '1em',
      height: '1em',
      marginRight: '0.2em',
      verticalAlign: '-0.125em',
      backgroundImage: 'var(--rc-link-favicon)',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      borderRadius: '2px',
    },
  },
});

export const linkFavicon = style({
  display: 'inline-flex',
  alignItems: 'center',
  marginRight: '0.15em',
  verticalAlign: '-0.125em',
});

export const listOl = style({
  listStyleType: 'decimal',
  paddingLeft: '1.375em',
  marginTop: 0,
  marginBottom: vars.flow.paragraph,
});

export const listUl = style({
  listStyleType: 'disc',
  paddingLeft: '1.375em',
  marginTop: 0,
  marginBottom: vars.flow.paragraph,
});

export const listItem = style({
  marginBottom: vars.flow.list,
  selectors: {
    '&::marker': {
      color: vars.color.textTertiary,
    },
  },
});

export const listNestedItem = style({
  listStyleType: 'none',
});

export const checklist = style({
  listStyleType: 'none',
  paddingLeft: 0,
});

const checklistItemBase = {
  position: 'relative',
  paddingLeft: '2em',
  listStyleType: 'none',
  outline: 'none',
  transition: 'color 0.25s ease',
  vars: {
    '--rc-cb-size': '1.125rem',
  },
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 'calc((1lh - var(--rc-cb-size)) / 2)',
      width: 'var(--rc-cb-size)',
      height: 'var(--rc-cb-size)',
      border: `1.5px solid ${vars.color.textQuaternary}`,
      borderRadius: vars.borderRadius.sm,
      boxSizing: 'border-box',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      transition:
        'background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s ease',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 'calc(var(--rc-cb-size) * 0.36)',
      top: 'calc((1lh - var(--rc-cb-size)) / 2 + var(--rc-cb-size) * 0.14)',
      width: 'calc(var(--rc-cb-size) * 0.28)',
      height: 'calc(var(--rc-cb-size) * 0.55)',
      borderRight: `2px solid ${vars.color.bg}`,
      borderBottom: `2px solid ${vars.color.bg}`,
      boxSizing: 'border-box',
      display: 'block',
      pointerEvents: 'none',
      transform: 'rotate(45deg) scale(0)',
      transformOrigin: 'center',
      opacity: 0,
      transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1) 0.05s, opacity 0.15s ease',
    },
    '[contenteditable="true"] &:active::before': {
      transform: 'scale(0.94)',
    },
  },
} as const;

export const listItemUnchecked = style({
  ...checklistItemBase,
  selectors: {
    ...checklistItemBase.selectors,
    '[contenteditable="true"] &:hover::before': {
      borderColor: vars.color.textTertiary,
    },
  },
});

export const listItemChecked = style({
  ...checklistItemBase,
  color: vars.color.textTertiary,
  textDecoration: 'line-through',
  textDecorationColor: vars.color.textQuaternary,
  selectors: {
    ...checklistItemBase.selectors,
    '&::before': {
      ...checklistItemBase.selectors['&::before'],
      borderColor: vars.color.text,
      backgroundColor: vars.color.text,
    },
    '&::after': {
      ...checklistItemBase.selectors['&::after'],
      transform: 'rotate(45deg) scale(1)',
      opacity: 1,
    },
    '[contenteditable="true"] &:hover::before': {
      backgroundColor: `color-mix(in oklab, ${vars.color.text} 80%, transparent)`,
    },
  },
});

export const quote = style({
  position: 'relative',
  backgroundColor: 'transparent',
  margin: `${vars.flow.block} 0`,
  padding: '0.125em 0',
  paddingLeft: '1.125em',
  fontStyle: 'normal',
  color: vars.color.textSecondary,
  borderRadius: 0,
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '0',
      top: '0',
      bottom: '0',
      width: `${quoteBarWidth}px`,
      borderRadius: '1px',
      backgroundColor: vars.color.quoteBorder,
    },
    // When the floating attribution input is anchored to this quote, reserve
    // bottom space so the last line of quote text never collides with it.
    '&[data-attribution-panel]': {
      paddingBottom: `calc(0.125em + 24px)`,
    },
  },
});

export const quoteAttribution = style({
  display: 'block',
  textAlign: 'start',
  fontSize: vars.typography.fontSizeCaption,
  color: vars.color.textTertiary,
  marginTop: vars.spacing.sm,
  fontStyle: 'normal',
});

export const hr = style({
  border: 'none',
  borderTop: `1px solid ${vars.color.hrBorder}`,
  margin: `${vars.spacing.lg} auto`,
  width: 60,
});

// Discrete keyframes: the fade stays until the scroll timeline reaches its end.
// Without overflow the timeline is inactive, so no fade is drawn at all.
const tableEdgeFade = keyframes({
  '0%, 99%': {
    maskImage: 'linear-gradient(to right, #000 calc(100% - 28px), transparent)',
  },
  '100%': {
    maskImage: 'none',
  },
});

export const tableScrollableWrapper = style({
  'display': 'block',
  'width': '100%',
  'maxWidth': '100%',
  'minWidth': 0,
  'overflowX': 'auto',
  'overscrollBehaviorX': 'contain',
  'margin': `${vars.flow.block} 0`,
  '@supports': {
    '(animation-timeline: scroll())': {
      animation: `${tableEdgeFade} linear both`,
      animationTimeline: 'scroll(self inline)',
    } as any,
  },
});

export const tableCell = style({
  border: 'none',
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
  padding: '10px 14px',
  minWidth: '4em',
  textAlign: 'start',
  verticalAlign: 'top',
});

export const tableCellHeader = style({
  border: 'none',
  borderBottom: `1px solid ${vars.color.border}`,
  padding: '8px 14px',
  textAlign: 'start',
  verticalAlign: 'bottom',
  fontWeight: 600,
  fontSize: '0.9286em',
  color: vars.color.textSecondary,
  whiteSpace: 'nowrap',
});

export const table = style({
  width: 'max-content',
  minWidth: '100%',
  borderCollapse: 'collapse',
  margin: `${vars.flow.block} 0`,
  fontSize: '0.875em',
  lineHeight: vars.typography.lineHeightCompact,
  fontVariantNumeric: 'tabular-nums',
  selectors: {
    [`${tableScrollableWrapper} > &`]: {
      margin: 0,
    },
    '[contenteditable="true"] &': {
      borderCollapse: 'separate',
      borderSpacing: 0,
      border: `1px solid ${vars.color.border}`,
      borderRadius: vars.borderRadius.md,
      overflow: 'hidden',
    },
  },
});

globalStyle(`${table} tr:last-child > ${tableCell}`, {
  borderBottomColor: vars.color.border,
});

globalStyle(`${table} tr > :first-child`, {
  paddingLeft: 0,
});

globalStyle(`${table} tr > :last-child`, {
  paddingRight: 0,
});

globalStyle(`${table} :is(${tableCell}, ${tableCellHeader}) > ${paragraph}`, {
  margin: 0,
  lineHeight: 'inherit',
});

globalStyle(`${table} ${tableCell} > ${paragraph}`, {
  maxWidth: '20em',
});

globalStyle(`[contenteditable="true"] ${tableCellHeader}`, {
  backgroundColor: vars.color.bgSecondary,
  borderBottomColor: vars.color.border,
});

globalStyle(`[contenteditable="true"] ${table} tr > :first-child`, {
  paddingLeft: '16px',
});

globalStyle(`[contenteditable="true"] ${table} tr > :last-child`, {
  paddingRight: '16px',
});

globalStyle(`[contenteditable="true"] ${table} tr:last-child > ${tableCell}`, {
  borderBottom: 'none',
});

globalStyle(`${tableScrollableWrapper} ${table} tr > :first-child`, {
  '@media': {
    '(max-width: 767px)': {
      position: 'sticky',
      left: 0,
      zIndex: 1,
      paddingRight: '14px',
      backgroundColor: vars.color.bg,
      boxShadow: `1px 0 0 ${vars.color.border}`,
    },
  },
});

export const spoiler = style({
  backgroundColor: vars.color.text,
  color: 'transparent',
  borderRadius: vars.borderRadius.sm,
  paddingInline: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease, color 0.3s ease',
  userSelect: 'none',
  selectors: {
    '[contenteditable="true"] &': {
      backgroundColor: `color-mix(in srgb, ${vars.color.text} 30%, transparent)`,
      color: 'inherit',
      userSelect: 'auto',
      cursor: 'text',
    },
    '&:hover': {
      backgroundColor: 'transparent',
      color: 'inherit',
      userSelect: 'auto',
    },
  },
});

/** RichRenderer root (`.rich-content`): neutral gray mask — default uses body `text` and reads too heavy when not editing */
globalStyle(`.rich-content ${spoiler}`, {
  backgroundColor: vars.color.textTertiary,
  color: 'transparent',
});

/** Force descendants transparent while hidden so TextNode inline `color` styles don't leak through the mask */
globalStyle(`.rich-content ${spoiler}:not(:hover):not(.${semanticClassNames.spoilerRevealed}) *`, {
  color: 'transparent !important',
});

globalStyle(`.rich-content ${spoiler}:hover`, {
  backgroundColor: 'transparent',
  color: 'inherit',
  userSelect: 'auto',
});

export const spoilerRevealed = style({
  backgroundColor: 'transparent',
  color: 'inherit',
  userSelect: 'auto',
});

export const tag = style({
  display: 'inline-block',
  borderRadius: '999px',
  paddingInline: '0.75em',
  fontSize: vars.typography.fontSizeSmall,
  lineHeight: '1.6',
  verticalAlign: 'baseline',
});

export const comment = style({
  display: 'inline-block',
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.textSecondary,
  backgroundColor: vars.color.codeBg,
  border: `1px dashed ${vars.color.border}`,
  borderRadius: vars.borderRadius.sm,
  padding: '2px 6px',
  whiteSpace: 'break-spaces',
  selectors: {
    '&::before': {
      content: '"<!--"',
      opacity: 0.7,
    },
    '&::after': {
      content: '"-->"',
      opacity: 0.7,
    },
  },
});

export const ruby = style({
  rubyPosition: 'over',
  rubyAlign: 'center',
  selectors: {
    '[contenteditable="true"] &[data-ruby]': {
      position: 'relative',
      display: 'inline-block',
      paddingTop: '0.72em',
      lineHeight: 1.2,
    },
    '[contenteditable="true"] &[data-ruby]::before': {
      content: 'attr(data-ruby)',
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      transform: 'translateY(-0.68em)',
      fontSize: '0.58em',
      lineHeight: 1,
      textAlign: 'center',
      color: vars.color.textSecondary,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    },
  },
});

export const rubyRt = style({
  fontSize: '0.58em',
  lineHeight: 1,
  color: vars.color.textSecondary,
  userSelect: 'none',
});

export const footnote = style({
  verticalAlign: 'baseline',
  fontSize: 'inherit',
});

// Raised with relative positioning so the reference never grows its line box.
export const footnoteRef = style({
  display: 'inline-block',
  position: 'relative',
  top: '-0.5em',
  padding: '0 0.1em',
  textDecoration: 'none',
  color: vars.color.accent,
  lineHeight: 1.3,
  fontWeight: 600,
  fontSize: '0.72em',
  fontVariantNumeric: 'tabular-nums',
  transition: 'opacity 0.15s ease',
  selectors: {
    '&:hover': {
      opacity: 0.7,
    },
  },
});

export const footnoteHighlight = style({
  animation: `${footnoteFlash} 1.2s ease-out`,
});

export const footnoteRefWrapper = style({
  position: 'relative',
  display: 'inline',
});

export const footnoteSection = style({
  marginTop: vars.spacing.lg,
});

export const footnoteSectionDivider = style({
  border: 'none',
  borderTop: `1px solid ${vars.color.border}`,
  margin: `${vars.spacing.lg} 0 ${vars.spacing.md}`,
});

export const footnoteSectionList = style({
  listStyleType: 'decimal',
  paddingLeft: vars.spacing.lg,
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.textSecondary,
  lineHeight: '1.6',
});

export const footnoteSectionItem = style({
  marginBottom: vars.spacing.sm,
  paddingLeft: vars.spacing.xs,
});

export const footnoteBackRef = style({
  display: 'inline-flex',
  alignItems: 'center',
  marginLeft: vars.spacing.xs,
  color: vars.color.accent,
  textDecoration: 'none',
  fontSize: '0.85em',
  transition: 'opacity 0.15s ease',
  fontFamily: vars.typography.fontMono,
  selectors: {
    '&:hover': {
      opacity: 0.7,
    },
  },
});

export const footnoteSectionItemEdit = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  listStyleType: 'none',
});

export const footnoteSectionItemNum = style({
  flexShrink: 0,
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeSmall,
  fontWeight: 600,
  minWidth: '1.5em',
});

export const footnoteSectionItemInput = style({
  flex: 1,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.typography.fontSizeSmall,
  color: vars.color.text,
  backgroundColor: 'transparent',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  selectors: {
    '&:focus': {
      borderColor: vars.color.accent,
    },
  },
});

export const footnoteSectionItemRemove = style({
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  border: 'none',
  background: 'none',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  borderRadius: vars.borderRadius.sm,
  fontSize: '14px',
  transition: 'color 0.15s ease, background-color 0.15s ease',
  selectors: {
    '&:hover': {
      color: vars.color.alertCaution,
      backgroundColor: `color-mix(in oklab, ${vars.color.alertCaution} 10%, transparent)`,
    },
  },
});

export const dragHandle = style({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  cursor: 'grab',
  borderRadius: vars.borderRadius.sm,
  color: vars.color.textSecondary,
  opacity: 0.4,
  transition: 'opacity 0.15s ease, background-color 0.15s ease',
  zIndex: 10,
  selectors: {
    '&:hover': {
      opacity: 1,
      backgroundColor: vars.color.fillSecondary,
    },
    '&:active': {
      cursor: 'grabbing',
    },
  },
});

export const dropIndicator = style({
  position: 'absolute',
  height: '2px',
  backgroundColor: vars.color.accent,
  borderRadius: '1px',
  pointerEvents: 'none',
  zIndex: 10,
});

export const alert = style({
  margin: `${vars.flow.block} 0`,
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: 0,
});

globalStyle(`${richContent} mark`, {
  background: 'transparent',
});

globalStyle(`${richContent} img`, {
  maxWidth: '100%',
  height: 'auto',
  borderRadius: vars.borderRadius.md,
});

globalStyle(
  `${richContent} > *:first-child, ${richContent} .rich-editor__content > *:first-child`,
  {
    marginTop: 0,
  },
);

globalStyle(`${richContent} > *:last-child, ${richContent} .rich-editor__content > *:last-child`, {
  marginBottom: 0,
});

globalStyle(`${headingAnchor} svg`, {
  flexShrink: 0,
});

globalStyle(`${headingH1}:hover ${headingAnchor}`, {
  opacity: 0.5,
});

globalStyle(`${headingH1}:hover ${headingAnchor}:hover`, {
  opacity: 1,
});

globalStyle(`${headingH2}:hover ${headingAnchor}`, {
  opacity: 0.5,
});

globalStyle(`${headingH2}:hover ${headingAnchor}:hover`, {
  opacity: 1,
});

globalStyle(`${headingH3}:hover ${headingAnchor}`, {
  opacity: 0.5,
});

globalStyle(`${headingH3}:hover ${headingAnchor}:hover`, {
  opacity: 1,
});

globalStyle(`${headingH4}:hover ${headingAnchor}`, {
  opacity: 0.5,
});

globalStyle(`${headingH4}:hover ${headingAnchor}:hover`, {
  opacity: 1,
});

globalStyle(`${headingH5}:hover ${headingAnchor}`, {
  opacity: 0.5,
});

globalStyle(`${headingH5}:hover ${headingAnchor}:hover`, {
  opacity: 1,
});

globalStyle(`${headingH6}:hover ${headingAnchor}`, {
  opacity: 0.5,
});

globalStyle(`${headingH6}:hover ${headingAnchor}:hover`, {
  opacity: 1,
});

globalStyle(`${linkFavicon} img`, {
  display: 'inline-block',
  width: '1em',
  height: '1em',
  borderRadius: '2px',
  objectFit: 'contain',
});

globalStyle(`${linkFavicon} svg`, {
  display: 'inline-block',
  width: '0.9em',
  height: '0.9em',
});

globalStyle(`${listNestedItem} ${listOl}`, {
  listStyleType: 'lower-alpha',
});

globalStyle(`${listNestedItem} ${listUl}`, {
  listStyleType: 'circle',
});

globalStyle(`${quote} > ${paragraph}:first-child`, {
  marginTop: 0,
});

globalStyle(`${quote} > ${paragraph}:last-child`, {
  marginBottom: 0,
});

globalStyle(`${tableCell} ${paragraph}`, {
  margin: 0,
  padding: 0,
  lineHeight: 'inherit',
});

globalStyle(`${tableCell} > :first-child`, {
  marginTop: 0,
});

globalStyle(`${tableCell} > :last-child`, {
  marginBottom: 0,
});

globalStyle(`${tableCellHeader} ${paragraph}`, {
  margin: 0,
  padding: 0,
  lineHeight: 'inherit',
});

globalStyle(`${tableCellHeader} > :first-child`, {
  marginTop: 0,
});

globalStyle(`${tableCellHeader} > :last-child`, {
  marginBottom: 0,
});

const mobileMedia = '(max-width: 640px)';
const imageFloatWidthFallback = '42%';

// ─── Image display width & layout ───────────────────────
// `--rich-image-display-width` is set inline by ImageRenderer when
// displayWidth is present. In the editor, float is carried by the
// `.rich-image-wrapper` block (from ImageNode.createDOM); in static SSR
// output the figure is the top-level block and floats itself.
globalStyle('figure.rich-image', {
  width: 'var(--rich-image-display-width, auto)',
  maxWidth: '100%',
  maxHeight: 'var(--rich-image-display-height, none)',
  marginInline: 'auto',
});

globalStyle('figure.rich-image[data-display="fixed-height"]', {
  width: 'auto',
});

globalStyle('figure.rich-image[data-layout="align-left"]', {
  marginLeft: 0,
  marginRight: 'auto',
  textAlign: 'left',
});

globalStyle('figure.rich-image[data-layout="align-right"]', {
  marginLeft: 'auto',
  marginRight: 0,
  textAlign: 'right',
});

globalStyle('figure.rich-image[data-layout="float-left"]', {
  float: 'left',
  width: `var(--rich-image-display-width, ${imageFloatWidthFallback})`,
  margin: '0.125rem 1.25rem 0.875rem 0',
});

globalStyle('figure.rich-image[data-layout="float-right"]', {
  float: 'right',
  width: `var(--rich-image-display-width, ${imageFloatWidthFallback})`,
  margin: '0.125rem 0 0.875rem 1.25rem',
});

globalStyle(
  'figure.rich-image[data-display="fixed-height"][data-layout="float-left"], figure.rich-image[data-display="fixed-height"][data-layout="float-right"]',
  {
    width: 'auto',
  },
);

globalStyle('figure.rich-image[data-display="fixed-height"] img', {
  width: 'auto',
  height: 'auto',
  maxWidth: '100%',
  maxHeight: 'var(--rich-image-display-height)',
});

// width matches the static renderer's var() fallback for floats without
// an explicit displayWidth; the wrapper's inline width overrides it when set.
globalStyle('.rich-image-wrapper[data-layout="float-left"]', {
  float: 'left',
  clear: 'both',
  width: imageFloatWidthFallback,
  maxWidth: '100%',
  margin: '0.125rem 1.25rem 0.875rem 0',
});

globalStyle('.rich-image-wrapper[data-layout="float-right"]', {
  float: 'right',
  clear: 'both',
  width: imageFloatWidthFallback,
  maxWidth: '100%',
  margin: '0.125rem 0 0.875rem 1.25rem',
});

// Inside a floated wrapper the wrapper already carries float + width;
// the inner figure must fill it instead of double-applying both.
globalStyle('.rich-image-wrapper[data-layout^="float"] figure.rich-image', {
  float: 'none',
  width: 'auto',
  margin: 0,
});

globalStyle('figure.rich-image[data-layout^="float"]', {
  '@media': {
    [mobileMedia]: {
      float: 'none',
      width: 'auto',
      margin: '1.25rem auto',
    },
  },
});

globalStyle('.rich-image-wrapper[data-layout^="float"]', {
  '@media': {
    [mobileMedia]: {
      float: 'none',
      // overrides the inline width set by ImageNode.createDOM/updateDOM
      width: '100% !important',
      margin: 0,
    },
  },
});

// Float layouts are tuned at one column width; only flowing text may wrap a
// float that overran its paragraphs at another width, every other block starts below it.
globalStyle(
  `${richContent} > :not(p, ul, ol, blockquote), ${richContent} .rich-editor__content > :not(p, ul, ol, blockquote)`,
  {
    clear: 'both',
  },
);

export const sharedStyles = {
  paragraph,
  textBold,
  textItalic,
  textUnderline,
  textStrikethrough,
  textSuperscript,
  textSubscript,
  textCode,
  textHighlight,
  headingAnchor,
  headingH1,
  headingH2,
  headingH3,
  headingH4,
  headingH5,
  headingH6,
  link,
  linkFavicon,
  listOl,
  listUl,
  listItem,
  listNestedItem,
  checklist,
  listItemChecked,
  listItemUnchecked,
  quote,
  quoteAttribution,
  hr,
  tableScrollableWrapper,
  table,
  tableCell,
  tableCellHeader,
  spoiler,
  spoilerRevealed,
  tag,
  comment,
  ruby,
  rubyRt,
  footnote,
  footnoteRef,
  footnoteHighlight,
  footnoteRefWrapper,
  footnoteSection,
  footnoteSectionDivider,
  footnoteSectionList,
  footnoteSectionItem,
  footnoteBackRef,
  footnoteSectionItemEdit,
  footnoteSectionItemNum,
  footnoteSectionItemInput,
  footnoteSectionItemRemove,
  dragHandle,
  dropIndicator,
  alert,
} satisfies Record<keyof typeof semanticClassNames, string>;

export type SharedStyleKey = keyof typeof sharedStyles;
