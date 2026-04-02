import { vars } from '@haklex/rich-style-token/styles';
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
  '0%': { backgroundColor: 'rgba(239, 68, 68, 0.24)' },
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

const quoteBarWidth = 4;

export const richContent = style({
  fontFamily: vars.typography.fontFamily,
  fontSize: vars.typography.fontSizeBase,
  lineHeight: vars.typography.lineHeight,
  color: vars.color.text,
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
});

export const paragraph = style({
  margin: 0,
  marginBottom: '1em',
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
  opacity: 0.65,
});

export const textSuperscript = style({
  verticalAlign: 'super',
  fontSize: '0.8em',
});

export const textSubscript = style({
  verticalAlign: 'sub',
  fontSize: '0.8em',
});

export const textCode = style({
  fontFamily: vars.typography.fontMono,
  fontSize: '0.9em',
  backgroundColor: vars.color.codeBg,
  color: vars.color.codeText,
  padding: '2px 6px',
  borderRadius: vars.borderRadius.sm,
  border: `1px solid ${vars.color.border}`,
  selectors: {
    '[contenteditable="true"] &': {
      paddingRight: 0,
    },
  },
});

export const textHighlight = style({
  'vars': {
    '--rc-hl-lightness': '0.3',
    '--rc-hl-highlighted': '1',
    '--rc-hl-color': `oklch(from ${vars.color.accent} l c h / var(--rc-hl-lightness))`,
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
    "[data-theme='dark'] &": {
      vars: {
        '--rc-hl-lightness': '0.35',
      },
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

export const headingH1 = style({
  position: 'relative',
  fontSize: '2em',
  fontWeight: 700,
  lineHeight: vars.typography.lineHeightTight,
  marginTop: '1.5em',
  marginBottom: '0.5em',
  selectors: {
    '[contenteditable="true"] &::before': {
      ...headingLevelBadge,
      content: '"H1"',
    },
  },
});

export const headingH2 = style({
  position: 'relative',
  fontSize: '1.5em',
  fontWeight: 700,
  lineHeight: vars.typography.lineHeightTight,
  marginTop: '1.4em',
  marginBottom: '0.45em',
  selectors: {
    '[contenteditable="true"] &::before': {
      ...headingLevelBadge,
      content: '"H2"',
    },
  },
});

export const headingH3 = style({
  position: 'relative',
  fontSize: '1.25em',
  fontWeight: 600,
  lineHeight: vars.typography.lineHeightTight,
  marginTop: '1.3em',
  marginBottom: '0.4em',
  selectors: {
    '[contenteditable="true"] &::before': {
      ...headingLevelBadge,
      content: '"H3"',
    },
  },
});

export const headingH4 = style({
  position: 'relative',
  fontSize: '1.125em',
  fontWeight: 600,
  lineHeight: vars.typography.lineHeightTight,
  marginTop: '1.2em',
  marginBottom: '0.35em',
  selectors: {
    '[contenteditable="true"] &::before': {
      ...headingLevelBadge,
      content: '"H4"',
    },
  },
});

export const headingH5 = style({
  position: 'relative',
  fontSize: '1em',
  fontWeight: 600,
  lineHeight: vars.typography.lineHeightTight,
  marginTop: '1.1em',
  marginBottom: '0.3em',
  selectors: {
    '[contenteditable="true"] &::before': {
      ...headingLevelBadge,
      content: '"H5"',
    },
  },
});

export const headingH6 = style({
  position: 'relative',
  fontSize: '0.875em',
  fontWeight: 600,
  lineHeight: vars.typography.lineHeightTight,
  marginTop: '1em',
  marginBottom: '0.25em',
  color: vars.color.text,
  selectors: {
    '[contenteditable="true"] &::before': {
      ...headingLevelBadge,
      content: '"H6"',
    },
  },
});

export const link = style({
  color: vars.color.link,
  textDecoration: 'none',
  transition: 'color 0.2s ease',
  selectors: {
    '&:hover': {
      textDecoration: 'underline',
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
  paddingLeft: vars.spacing.lg,
  marginBottom: '1em',
});

export const listUl = style({
  listStyleType: 'disc',
  paddingLeft: vars.spacing.lg,
  marginBottom: '1em',
});

export const listItem = style({
  marginBottom: '0.25em',
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
      left: 'calc(var(--rc-cb-size) * 0.32)',
      top: 'calc((1lh - var(--rc-cb-size)) / 2 + var(--rc-cb-size) * 0.14)',
      width: 'calc(var(--rc-cb-size) * 0.28)',
      height: 'calc(var(--rc-cb-size) * 0.55)',
      borderRight: `2px solid ${vars.color.accent}`,
      borderBottom: `2px solid ${vars.color.accent}`,
      boxSizing: 'border-box',
      display: 'block',
      pointerEvents: 'none',
      transform: 'rotate(45deg) scale(0)',
      transformOrigin: 'center',
      opacity: 0,
      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s, opacity 0.15s ease',
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
  color: vars.color.textSecondary,
  selectors: {
    ...checklistItemBase.selectors,
    '&::before': {
      ...checklistItemBase.selectors['&::before'],
      borderColor: vars.color.accent,
      backgroundColor: vars.color.accentLight,
    },
    '&::after': {
      ...checklistItemBase.selectors['&::after'],
      transform: 'rotate(45deg) scale(1)',
      opacity: 1,
    },
    '[contenteditable="true"] &:hover::before': {
      backgroundColor: `color-mix(in oklab, ${vars.color.accent} 12%, transparent)`,
    },
  },
});

export const quote = style({
  position: 'relative',
  backgroundColor: vars.color.quoteBg,
  margin: `${vars.spacing.md} 0`,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  paddingLeft: `calc(${vars.spacing.md} + ${quoteBarWidth}px)`,
  fontFamily: vars.typography.fontFamilyKai,
  fontStyle: 'normal',
  color: vars.color.textSecondary,
  borderRadius: `0 ${vars.borderRadius.sm} ${vars.borderRadius.sm} 0`,
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '0',
      top: '0',
      bottom: '0',
      width: `${quoteBarWidth}px`,
      borderRadius: vars.borderRadius.sm,
      backgroundColor: vars.color.quoteBorder,
    },
  },
});

export const hr = style({
  border: 'none',
  borderTop: `1px solid ${vars.color.hrBorder}`,
  margin: `${vars.spacing.lg} auto`,
  width: 60,
});

export const tableScrollableWrapper = style({
  overflowX: 'auto',
});

export const tableCell = style({
  border: 'none',
  borderBottom: `1px solid ${vars.color.border}`,
  borderRight: `1px solid ${vars.color.border}`,
  padding: `1.25em ${vars.spacing.lg}`,
  textAlign: 'left',
  verticalAlign: 'middle',
  lineHeight: '1.5',
  selectors: {
    '&:last-child': {
      borderRight: 'none',
    },
  },
});

export const tableCellHeader = style({
  border: 'none',
  borderBottom: `1px solid ${vars.color.border}`,
  borderRight: `1px solid ${vars.color.border}`,
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.75em',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: vars.color.textSecondary,
  backgroundColor: vars.color.bgSecondary,
  verticalAlign: 'middle',
  lineHeight: '1.5',
  position: 'sticky',
  top: 0,
  zIndex: 1,
  selectors: {
    '&:last-child': {
      borderRight: 'none',
    },
  },
});

export const table = style({
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  margin: `${vars.spacing.lg} 0`,
  fontSize: vars.typography.fontSizeSmall,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
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
  verticalAlign: 'super',
  fontSize: '0.8em',
});

export const footnoteRef = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '1.5em',
  textDecoration: 'none',
  color: vars.color.accent,
  backgroundColor: vars.color.accentLight,
  borderRadius: '999px',
  padding: '0 0.35em',
  lineHeight: 1.45,
  fontWeight: 600,
  fontSize: '0.82em',
  transition: 'filter 0.15s ease',
  selectors: {
    '&:hover': {
      filter: 'brightness(0.96)',
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
      color: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
  margin: '2em 0',
  padding: '0 1em',
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
  width: '1em',
  height: '1em',
  borderRadius: '2px',
  objectFit: 'contain',
});

globalStyle(`${linkFavicon} svg`, {
  width: '0.9em',
  height: '0.9em',
});

globalStyle(`${listNestedItem} ${listOl}`, {
  listStyleType: 'lower-alpha',
});

globalStyle(`${listNestedItem} ${listUl}`, {
  listStyleType: 'circle',
});

globalStyle(`${listItemChecked} > *, ${listItemUnchecked} > *`, {
  backgroundImage: `linear-gradient(${vars.color.textSecondary}, ${vars.color.textSecondary})`,
  backgroundSize: '0% 1.5px',
  backgroundPosition: 'left center',
  backgroundRepeat: 'no-repeat',
  transition: 'background-size 0.35s cubic-bezier(0.4, 0, 0.2, 1) 0.15s, opacity 0.15s ease',
});

globalStyle(`${listItemChecked} > *`, {
  backgroundSize: '100% 1.5px',
  opacity: 0.5,
});

globalStyle(`${quote} > ${paragraph}:first-child`, {
  marginTop: 0,
});

globalStyle(`${quote} > ${paragraph}:last-child`, {
  marginBottom: 0,
});

globalStyle(`${table} tbody tr:last-child ${tableCell}`, {
  borderBottom: 'none',
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
