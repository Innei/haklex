import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const selectorWrapper = style({
  display: 'inline-flex',
  alignItems: 'center',
});

export const triggerButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'fontSize': 12,
  'padding': '4px 10px',
  'borderRadius': 8,
  'border': 'none',
  'gap': 6,
  'background': vars.color.fillTertiary,
  'color': vars.color.text,
  'fontFamily': 'inherit',
  'cursor': 'pointer',
  'outline': 'none',
  'minWidth': 0,
  'maxWidth': 220,
  ':hover': {
    background: vars.color.fillSecondary,
  },
});

export const triggerLabel = style({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: vars.color.textSecondary,
});

export const fallbackIcon = style({
  display: 'inline-block',
  width: 16,
  height: 16,
  borderRadius: 4,
  background: vars.color.fillSecondary,
  flexShrink: 0,
});

export const searchWrapper = style({
  padding: '6px 10px',
});

export const searchInput = style({
  'width': '100%',
  'border': 'none',
  'background': 'transparent',
  'fontFamily': 'inherit',
  'fontSize': 13,
  'color': vars.color.text,
  'outline': 'none',
  'padding': 0,
  '::placeholder': {
    color: vars.color.textQuaternary,
  },
});

export const selectContent = style({
  width: 280,
  maxHeight: '360px !important',
  overflowY: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

globalStyle(`${selectContent} [role="listbox"]`, {
  overflowY: 'auto',
  flex: 1,
  minHeight: 0,
});

export const groupLabel = style({
  padding: '6px 8px',
  fontSize: 11,
  fontWeight: 500,
  color: vars.color.textTertiary,
});

export const itemInner = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  minWidth: 0,
  overflow: 'hidden',
});

export const itemText = style({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const emptyState = style({
  padding: '20px 16px',
  textAlign: 'center',
  fontSize: 13,
  color: vars.color.textQuaternary,
});

export const settingsFooter = style({
  borderTop: `1px solid ${vars.color.hrBorder}`,
});

export const settingsLink = style({
  'display': 'flex',
  'alignItems': 'center',
  'gap': 6,
  'width': '100%',
  'padding': '8px 12px',
  'border': 'none',
  'background': 'transparent',
  'fontFamily': 'inherit',
  'fontSize': 12,
  'color': vars.color.textTertiary,
  'cursor': 'pointer',
  'textAlign': 'left',
  'outline': 'none',
  ':hover': {
    color: vars.color.text,
  },
});
