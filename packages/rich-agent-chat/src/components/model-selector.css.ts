import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const triggerButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'gap': 6,
  'minWidth': 0,
  'maxWidth': '100%',
  'padding': '4px 10px',
  'border': 'none',
  'borderRadius': 8,
  'background': vars.color.fillTertiary,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'outline': 'none',
  'fontFamily': 'inherit',
  'fontSize': '11px',
  'lineHeight': 1.2,
  ':hover': {
    background: vars.color.fillSecondary,
  },
  ':focus-visible': {
    background: vars.color.fillSecondary,
  },
});

export const providerIcon = style({
  width: 14,
  height: 14,
  borderRadius: 3,
  background: 'linear-gradient(135deg, #d4a574, #c4956a)',
  flexShrink: 0,
});

export const triggerLabel = style({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: 120,
  color: vars.color.textSecondary,
});

export const chevronIcon = style({
  color: vars.color.textQuaternary,
  flexShrink: 0,
});

export const popoverContent = style({
  width: 288,
  maxHeight: 360,
  overflowY: 'auto',
  padding: 8,
  borderRadius: 8,
  background: vars.color.bg,
});

export const modelGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '6px 4px 10px',
});

export const modelGroupLabel = style({
  fontSize: 10,
  fontWeight: 700,
  color: vars.color.textQuaternary,
  padding: '4px 8px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
});

export const modelItem = style({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'space-between',
  'width': '100%',
  'padding': '10px 12px',
  'border': 'none',
  'borderRadius': 4,
  'background': 'transparent',
  'fontFamily': 'inherit',
  'fontSize': 13,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'textAlign': 'left',
  'outline': 'none',
  ':hover': {
    background: vars.color.fillTertiary,
    color: vars.color.text,
  },
  ':focus-visible': {
    background: vars.color.fillTertiary,
    color: vars.color.text,
  },
});

export const modelItemActive = style({
  background: vars.color.fillTertiary,
  color: vars.color.text,
});

export const emptyState = style({
  padding: '20px 16px',
  textAlign: 'center',
  fontSize: 13,
  color: vars.color.textQuaternary,
});

export const settingsLink = style({
  'display': 'flex',
  'alignItems': 'center',
  'gap': 6,
  'width': '100%',
  'padding': '10px 12px',
  'border': 'none',
  'borderTop': `1px solid ${vars.color.border}`,
  'borderRadius': 0,
  'background': 'transparent',
  'fontFamily': 'inherit',
  'fontSize': 12,
  'color': vars.color.textTertiary,
  'cursor': 'pointer',
  'textAlign': 'left',
  'outline': 'none',
  'marginTop': 4,
  ':hover': {
    color: vars.color.text,
  },
});
