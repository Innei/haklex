import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const card = style({
  position: 'relative',
  margin: `${vars.flow.block} 0`,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
  backgroundColor: vars.color.codeBg,
  color: vars.color.text,
  fontSize: vars.typography.fontSizeCode,
  fontFamily: vars.typography.fontMono,
  lineHeight: vars.typography.lineHeightCode,
  selectors: {
    '&[data-chrome="bar"]': {
      border: `1px solid ${vars.color.border}`,
    },
  },
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  fontFamily: vars.typography.fontFamilySans,
  fontSize: '12px',
  lineHeight: 1,
  color: vars.color.textTertiary,
  userSelect: 'none',
  selectors: {
    [`${card}[data-chrome="bar"] &`]: {
      height: '36px',
      padding: '0 6px 0 14px',
      backgroundColor: vars.color.codeHeaderBg,
      borderBottom: `1px solid ${vars.color.border}`,
    },
    [`${card}[data-chrome="compact"] &`]: {
      position: 'absolute',
      top: '6px',
      right: '6px',
      zIndex: 2,
    },
  },
});

export const lang = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0,
  whiteSpace: 'nowrap',
  selectors: {
    [`${card}[data-chrome="compact"] &`]: {
      fontFamily: vars.typography.fontMono,
      fontSize: '11px',
      padding: '4px 4px',
    },
  },
});

export const langMark = style({
  width: '10px',
  height: '10px',
  borderRadius: '3px',
  flexShrink: 0,
  selectors: {
    [`${card}[data-chrome="compact"] &`]: {
      display: 'none',
    },
  },
});

export const copyButton = style({
  'appearance': 'none',
  'display': 'inline-flex',
  'alignItems': 'center',
  'gap': '6px',
  'padding': '6px 8px',
  'border': 'none',
  'borderRadius': '6px',
  'background': 'transparent',
  'color': vars.color.textTertiary,
  'font': 'inherit',
  'cursor': 'pointer',
  'transition': 'color 0.15s ease, background-color 0.15s ease, opacity 0.15s ease',
  ':hover': {
    color: vars.color.text,
    backgroundColor: vars.color.fill,
  },
  'selectors': {
    [`${card}[data-chrome="compact"] &`]: {
      backgroundColor: vars.color.fill,
      color: vars.color.text,
    },
  },
});

// Compact chrome swaps the language label for the copy button on hover. The
// button stays in the tab order (opacity, not display) so keyboard users can
// still reach it.
globalStyle(`${card}[data-chrome="compact"] ${copyButton}`, {
  '@media': {
    '(hover: hover)': {
      position: 'absolute',
      top: 0,
      right: 0,
      opacity: 0,
    },
  },
});

globalStyle(
  `${card}[data-chrome="compact"]:hover ${copyButton}, ${card}[data-chrome="compact"] ${copyButton}:focus-visible`,
  {
    '@media': {
      '(hover: hover)': {
        opacity: 1,
      },
    },
  },
);

globalStyle(
  `${card}[data-chrome="compact"]:hover ${lang}, ${card}[data-chrome="compact"]:has(${copyButton}:focus-visible) ${lang}`,
  {
    '@media': {
      '(hover: hover)': {
        visibility: 'hidden',
      },
    },
  },
);

export const bodyBackground = style({
  position: 'relative',
  padding: 0,
});

export const bodyBackgroundStatic = style([
  bodyBackground,
  {
    paddingBlock: 12,
  },
]);

export const scroll = style({
  position: 'relative',
  width: '100%',
  overflow: 'auto',
});

export const scrollCollapsed = style({
  maxHeight: '50vh',
  overflow: 'hidden',
});

export const expandFade = style({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: '56px',
  background: `linear-gradient(to bottom, transparent, ${vars.color.codeBg})`,
  pointerEvents: 'none',
});

export const expandButton = style({
  'appearance': 'none',
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'gap': '6px',
  'width': '100%',
  'height': '32px',
  'border': 'none',
  'borderTop': `1px solid ${vars.color.border}`,
  'background': vars.color.codeBg,
  'color': vars.color.textTertiary,
  'fontFamily': vars.typography.fontFamilySans,
  'fontSize': '12px',
  'cursor': 'pointer',
  ':hover': {
    color: vars.color.text,
  },
});

export const lined = style({
  counterReset: 'code-line 0',
});

globalStyle(`${lined} .line`, {
  counterIncrement: 'code-line 1',
});

globalStyle(`${lined} .line::before`, {
  content: 'counter(code-line)',
  color: 'transparent',
  textAlign: 'right',
  boxSizing: 'content-box',
  minWidth: 'calc(var(--rc-ln-digits, 2) * 1ch)',
  display: 'inline-block',
  position: 'sticky',
  left: 0,
});

export const linedWithNumbers = style({});

globalStyle(`${linedWithNumbers} code`, {
  minWidth: '100%',
  width: 'max-content',
});

globalStyle(`${card} ${linedWithNumbers} .line`, {
  paddingLeft: 0,
});

globalStyle(`${linedWithNumbers} .line::before`, {
  color: vars.color.textQuaternary,
  paddingLeft: '16px',
  paddingRight: '16px',
  backgroundColor: vars.color.codeBg,
  zIndex: 1,
});

globalStyle(`${card} pre`, {
  margin: '0 !important' as any,
  padding: '0 !important' as any,
  borderRadius: 0,
  fontSize: '1em',
  overflowX: 'auto',
});

globalStyle(`${card} pre code`, {
  display: 'flex',
  flexDirection: 'column',
  fontFamily: `${vars.typography.fontMono} !important` as any,
  lineHeight: 'inherit',
});

globalStyle(`${card} .highlights, ${card} code, ${card} pre`, {
  background: 'transparent !important' as any,
  lineHeight: 'inherit',
});

globalStyle(
  `[data-theme='dark'] ${card} .highlights-themes, [data-theme='dark'] ${card} .highlights-themes span`,
  {
    color: 'var(--hls-dark) !important' as any,
  },
);

globalStyle(`${card} .line`, {
  display: 'block',
  padding: '0 16px',
});

globalStyle(`${card}[data-chrome="compact"] .line`, {
  paddingRight: '3em',
});

globalStyle(`${card} .line > span:last-child`, {
  marginRight: '16px',
});

globalStyle(`${card} .line::after`, {
  content: "' '",
});
