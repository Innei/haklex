import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const toolBar = style({
  borderBottom: `1px solid ${vars.color.border}`,
  padding: '8px 18px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flexShrink: 0,
});

export const toolBarHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
});

export const toolBarLabel = style({
  fontSize: '11px',
  color: vars.color.textQuaternary,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  flexShrink: 0,
});

export const toolButtons = style({
  display: 'flex',
  gap: 4,
  flexWrap: 'wrap',
});

export const toolButton = style({
  padding: '3px 10px',
  fontSize: '12px',
  border: `1px solid ${vars.color.border}`,
  borderRadius: 6,
  background: vars.color.bg,
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'all 120ms ease',
  selectors: {
    '&:hover': {
      background: vars.color.fillTertiary,
      borderColor: vars.color.textQuaternary,
    },
    '&[data-active]': {
      background: vars.color.text,
      color: vars.color.bg,
      borderColor: vars.color.text,
    },
  },
});

export const toolForm = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const toolRow = style({
  display: 'flex',
  gap: 6,
});

export const toolInput = style({
  'flex': 1,
  'padding': '5px 8px',
  'fontSize': '12px',
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': 6,
  'background': vars.color.bg,
  'color': vars.color.text,
  'outline': 'none',
  'fontFamily': vars.typography.fontMono,
  ':focus': {
    borderColor: vars.color.textQuaternary,
  },
  '::placeholder': {
    color: vars.color.textQuaternary,
  },
});

export const toolSelect = style({
  'padding': '5px 8px',
  'fontSize': '12px',
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': 6,
  'background': vars.color.bg,
  'color': vars.color.text,
  'outline': 'none',
  ':focus': {
    borderColor: vars.color.textQuaternary,
  },
});

export const toolTextarea = style({
  'padding': '5px 8px',
  'fontSize': '12px',
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': 6,
  'background': vars.color.bg,
  'color': vars.color.text,
  'outline': 'none',
  'fontFamily': vars.typography.fontMono,
  'resize': 'vertical',
  'minHeight': 48,
  ':focus': {
    borderColor: vars.color.textQuaternary,
  },
  '::placeholder': {
    color: vars.color.textQuaternary,
  },
});

export const toolSubmit = style({
  'alignSelf': 'flex-end',
  'padding': '4px 14px',
  'fontSize': '12px',
  'fontWeight': 500,
  'border': 'none',
  'borderRadius': 6,
  'background': vars.color.text,
  'color': vars.color.bg,
  'cursor': 'pointer',
  'transition': 'opacity 120ms ease',
  ':hover': {
    opacity: 0.85,
  },
});
