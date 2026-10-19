import { vars } from '@haklex/rich-style-token';
import { style } from '@vanilla-extract/css';

export const frame = style({
  position: 'relative',
  borderRadius: 8,
  outline: '2px solid transparent',
  outlineOffset: 6,
  transition: 'outline-color 120ms ease',
});

export const frameSelected = style({
  outlineColor: vars.color.accent,
});

export const toolbar = style({
  position: 'absolute',
  top: -6,
  right: 0,
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  padding: 2,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 8,
  backgroundColor: vars.color.bg,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  transform: 'translateY(-100%)',
});

export const toolbarButton = style({
  appearance: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  height: 26,
  padding: '0 8px',
  border: 0,
  borderRadius: 6,
  background: 'transparent',
  color: vars.color.textSecondary,
  font: 'inherit',
  fontFamily: vars.typography.fontFamilySans,
  fontSize: 12,
  cursor: 'pointer',
  selectors: {
    '&:hover, &[aria-pressed="true"], &[data-popup-open]': {
      background: vars.color.fillSecondary,
      color: vars.color.text,
    },
    '&:focus-visible': { outline: `2px solid ${vars.color.accent}`, outlineOffset: 1 },
  },
});

export const rawPanel = style({
  display: 'flex',
  flexDirection: 'column',
  width: 'min(420px, calc(100vw - 32px))',
  maxHeight: 360,
  fontFamily: vars.typography.fontFamilySans,
});

export const rawHead = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '6px 6px 6px 12px',
  borderBottom: `1px solid ${vars.color.border}`,
  fontSize: 12,
  color: vars.color.textTertiary,
});

export const rawCode = style({
  flex: 1,
  margin: 0,
  padding: 12,
  overflow: 'auto',
  fontFamily: vars.typography.fontMono,
  fontSize: 12,
  lineHeight: 1.5,
  color: vars.color.text,
  whiteSpace: 'pre',
  userSelect: 'text',
});

export const rawEmpty = style({
  color: vars.color.textTertiary,
});
