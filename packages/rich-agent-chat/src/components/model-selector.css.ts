import { vars } from '@haklex/rich-style-token';
import { style } from '@vanilla-extract/css';

export const triggerButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'gap': 4,
  'padding': '4px 10px',
  'borderRadius': 6,
  'background': vars.color.bgTertiary,
  'border': `1px solid ${vars.color.border}`,
  'fontSize': 12,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'outline': 'none',
  'fontFamily': 'inherit',
  'lineHeight': 1.4,
  ':hover': {
    background: vars.color.bgTertiary,
  },
});

export const popoverContent = style({
  width: 260,
  maxHeight: 360,
  overflowY: 'auto',
});

export const modelGroup = style({
  padding: '6px 8px',
});

export const modelGroupLabel = style({
  fontSize: 11,
  color: vars.color.textQuaternary,
  padding: '4px 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
});

export const modelItem = style({
  'padding': '6px 8px',
  'borderRadius': 6,
  'fontSize': 13,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'space-between',
  ':hover': {
    background: vars.color.bgTertiary,
  },
});

export const modelItemActive = style({
  background: vars.color.bgTertiary,
  color: vars.color.text,
});

export const settingsEntry = style({
  'display': 'flex',
  'alignItems': 'center',
  'gap': 6,
  'padding': '8px 16px',
  'borderTop': `1px solid ${vars.color.border}`,
  'fontSize': 13,
  'color': vars.color.textTertiary,
  'cursor': 'pointer',
  ':hover': {
    color: vars.color.textSecondary,
  },
});

export const emptyState = style({
  padding: '16px',
  textAlign: 'center',
  fontSize: 13,
  color: vars.color.textQuaternary,
});

export const chevronIcon = style({
  color: vars.color.textQuaternary,
  flexShrink: 0,
});
