import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const codeBlockWrapper = style({
  borderRadius: vars.borderRadius.md,
  border: `1px solid ${vars.color.border}`,
  overflow: 'hidden',
  fontSize: '13px',
});

export const codeHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '4px 12px',
  background: vars.color.fillQuaternary,
  borderBottom: `1px solid ${vars.color.border}`,
  fontSize: '11px',
  color: vars.color.textTertiary,
});

export const languageLabel = style({
  textTransform: 'uppercase',
  fontWeight: 500,
  letterSpacing: '0.05em',
});

export const copyButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'gap': '4px',
  'border': 'none',
  'background': 'none',
  'cursor': 'pointer',
  'color': vars.color.textTertiary,
  'fontSize': '11px',
  'padding': '2px 4px',
  'borderRadius': vars.borderRadius.sm,
  ':hover': {
    color: vars.color.text,
    background: vars.color.fillTertiary,
  },
});

export const codeContent = style({
  padding: '12px',
  overflowX: 'auto',
  background: vars.color.codeBg,
  fontFamily: vars.typography.fontMono,
  lineHeight: '1.6',
});

export const codePre = style({
  margin: 0,
  padding: 0,
  background: 'transparent',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
});
