import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const card = style({
  vars: {
    '--rr-code-accent': '#737373',
  },
  position: 'relative',
  margin: '1.5rem 0',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  fontSize: vars.typography.fontSizeMd,
  fontFamily: vars.typography.fontMono,
  lineHeight: 1.65,
});

export const lang = style({
  position: 'absolute',
  bottom: '0.75rem',
  right: '0.75rem',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: vars.typography.fontSizeMd,
  opacity: 0.6,
  pointerEvents: 'none',
});

export const copyButton = style({
  appearance: 'none',
  position: 'absolute',
  right: '0.5rem',
  top: '0.5rem',
  zIndex: 3,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.375rem',
  borderRadius: '0.375rem',
  border: '1px solid color-mix(in srgb, var(--rr-code-accent) 5%, transparent)',
  background: 'color-mix(in srgb, var(--rr-code-accent) 80%, transparent)',
  color: 'white',
  cursor: 'pointer',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  backdropFilter: 'blur(8px)',
  selectors: {
    [`${card}:hover &`]: {
      opacity: 1,
    },
  },
});

export const bodyBackground = style({
  position: 'relative',
  background: 'color-mix(in srgb, var(--rr-code-accent) 5%, transparent)',
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

export const expandWrap = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  padding: '0.5rem 0 0.75rem',
  background: `linear-gradient(to bottom, transparent 0%, var(--bg, ${vars.color.bgSecondary}) 80%)`,
  pointerEvents: 'none',
});

export const expandButton = style({
  appearance: 'none',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: vars.typography.fontSizeXs,
  color: 'inherit',
  opacity: 0.7,
  pointerEvents: 'auto',
  selectors: {
    '&:hover': {
      opacity: 1,
    },
  },
});

export const lined = style({
  counterReset: 'shiki-line 0',
});

globalStyle(`${lined} .line`, {
  counterIncrement: 'shiki-line 1',
});

globalStyle(`${lined} .line::before`, {
  content: 'counter(shiki-line)',
  color: 'transparent',
  textAlign: 'right',
  boxSizing: 'border-box',
  width: '2em',
  display: 'inline-block',
  position: 'sticky',
  left: 0,
});

export const linedWithNumbers = style({});

globalStyle(`${linedWithNumbers} .line::before`, {
  color: 'inherit',
  opacity: 0.4,
  width: '5em',
  paddingRight: '2em',
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

globalStyle(`${card} .shiki, ${card} code, ${card} pre`, {
  background: 'transparent !important' as any,
  lineHeight: 'inherit',
});

globalStyle(
  `[data-theme='dark'] ${card} .shiki-themes, [data-theme='dark'] ${card} .shiki-themes span`,
  {
    color: 'var(--shiki-dark) !important' as any,
    fontStyle: 'var(--shiki-dark-font-style) !important' as any,
    fontWeight: 'var(--shiki-dark-font-weight) !important' as any,
    textDecoration: 'var(--shiki-dark-text-decoration) !important' as any,
  },
);

globalStyle(`${card} .line`, {
  display: 'block',
  padding: '0 1.25rem',
});

globalStyle(`${card} .line > span:last-child`, {
  marginRight: '1.25rem',
});

globalStyle(`${card} .line::after`, {
  content: "' '",
});
