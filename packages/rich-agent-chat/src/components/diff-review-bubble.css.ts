import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const diffReviewRoot = style({
  margin: '8px 0',
  border: `1px solid ${vars.color.border}`,
  borderRadius: 8,
  overflow: 'hidden',
  fontSize: '13px',
  flexShrink: 0,
});

export const diffReviewHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  background: vars.color.fillTertiary,
  borderBottom: `1px solid ${vars.color.border}`,
  fontSize: '12px',
  color: vars.color.textTertiary,
});

export const diffReviewActions = style({
  display: 'flex',
  gap: 6,
});

export const diffReviewActionBtn = style({
  'padding': '3px 10px',
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': 4,
  'background': 'transparent',
  'color': vars.color.textSecondary,
  'fontSize': '11px',
  'cursor': 'pointer',
  'transition': 'background 120ms ease',
  ':hover': {
    background: vars.color.fillSecondary,
  },
});

export const diffReviewAcceptBtn = style([
  diffReviewActionBtn,
  {
    'borderColor': 'rgb(34, 197, 94)',
    'color': 'rgb(34, 197, 94)',
    ':hover': {
      background: 'rgba(34, 197, 94, 0.1)',
    },
  },
]);

export const diffReviewRejectBtn = style([
  diffReviewActionBtn,
  {
    'borderColor': 'rgb(239, 68, 68)',
    'color': 'rgb(239, 68, 68)',
    ':hover': {
      background: 'rgba(239, 68, 68, 0.1)',
    },
  },
]);

export const diffHunkRow = style({
  padding: '4px 12px',
  lineHeight: 1.6,
  fontFamily: vars.typography.fontMono,
  fontSize: '12px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
});

export const diffHunkInsert = style({
  background: 'rgba(34, 197, 94, 0.12)',
  color: vars.color.text,
});

export const diffHunkDelete = style({
  background: 'rgba(239, 68, 68, 0.12)',
  color: vars.color.text,
  textDecoration: 'line-through',
  opacity: 0.7,
});

export const diffHunkEqual = style({
  color: vars.color.textTertiary,
});

export const diffStatusBadge = style({
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: '11px',
  fontWeight: 500,
});
