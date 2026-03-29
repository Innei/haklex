import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const triggerButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'gap': '4px',
  'padding': '4px 8px',
  'fontSize': '13px',
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': vars.borderRadius.sm,
  'background': vars.color.bg,
  'color': vars.color.text,
  'cursor': 'pointer',
  'outline': 'none',
  'whiteSpace': 'nowrap',
  ':hover': {
    background: vars.color.fillTertiary,
  },
  ':focus-visible': {
    borderColor: vars.color.accent,
  },
  'selectors': {
    '&[data-popup-open]': {
      background: vars.color.fillQuaternary,
      borderColor: vars.color.accent,
      boxShadow: `0 0 0 3px ${vars.color.accentLight}`,
    },
  },
});

export const triggerIcon = style({
  width: '14px',
  height: '14px',
  color: vars.color.textTertiary,
  flexShrink: 0,
});

export const positioner = style({
  outline: 'none',
  zIndex: 50,
});

export const popup = style({
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.md,
  boxShadow: vars.boxShadow.menu,
  padding: '4px',
  width: 'min(var(--anchor-width), calc(100vw - 0.75rem))',
  maxWidth: 'calc(100vw - 0.75rem)',
  maxHeight: '240px',
  overflowY: 'auto',
  outline: 'none',
});

export const item = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 8px',
  borderRadius: vars.borderRadius.sm,
  fontSize: '13px',
  cursor: 'pointer',
  outline: 'none',
  color: vars.color.text,
  selectors: {
    '&[data-highlighted]': {
      background: vars.color.fillTertiary,
    },
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const itemIndicator = style({
  width: '14px',
  height: '14px',
  flexShrink: 0,
});

export const groupLabel = style({
  padding: '6px 8px 4px',
  fontSize: '11px',
  fontWeight: 600,
  color: vars.color.textTertiary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

export const separator = style({
  height: '1px',
  background: vars.color.border,
  margin: '4px 0',
});
