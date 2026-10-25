import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

import { paragraph } from './shared.css';

export const detailsClassNames = {
  details: 'rich-details',
  summary: 'rich-details-summary',
  summaryText: 'rich-details-summary-text',
  chevron: 'rich-details-chevron',
  content: 'rich-details-content',
} as const;

export const details = style({
  margin: `${vars.spacing.md} 0`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.md,
  backgroundColor: 'transparent',
  interpolateSize: 'allow-keywords',
});

export const summary = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.spacing.sm,
  cursor: 'pointer',
  userSelect: 'none',
  padding: '0.5em 0.875em',
  color: vars.color.text,
  fontWeight: 500,
  fontSize: '1em',
  lineHeight: vars.typography.lineHeight,
  listStyle: 'none',
  outline: 'none',
  borderRadius: vars.borderRadius.md,
  transition: 'background-color 120ms ease-out, box-shadow 120ms ease-out',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.fillTertiary,
    },
    '&:focus-visible': {
      boxShadow: `inset 0 0 0 1px ${vars.color.accent}, 0 0 0 3px ${vars.color.accentLight}`,
    },
    '&::-webkit-details-marker': {
      display: 'none',
    },
    '&::marker': {
      display: 'none',
      content: '""',
    },
  },
});

export const summaryText = style({
  flex: '1',
  minWidth: 0,
});

export const chevron = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.25rem',
  height: '1.25rem',
  position: 'relative',
  top: '0.25rem',
  flexShrink: 0,
  color: vars.color.textTertiary,
  transformOrigin: 'center',
  transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease',
});

export const content = style({
  padding: `0 0.875em 0.75em calc(0.875em + 1.25rem + ${vars.spacing.sm})`,
  color: vars.color.textSecondary,
});

globalStyle(`${summary}:hover ${chevron}`, {
  color: vars.color.textSecondary,
});

globalStyle(`${details}[open] ${chevron}`, {
  color: vars.color.textSecondary,
  transform: 'rotate(90deg)',
});

globalStyle(`${details}::details-content`, {
  display: 'block',
  height: 0,
  overflow: 'hidden',
  opacity: 0,
  contentVisibility: 'hidden',
  transition:
    'height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), content-visibility 0.4s cubic-bezier(0.4, 0, 0.2, 1) allow-discrete',
} as any);

globalStyle(`${details}[open]::details-content`, {
  height: 'auto',
  opacity: 1,
  contentVisibility: 'visible',
} as any);

globalStyle(`${content} > ${paragraph}:first-child`, {
  marginTop: 0,
});

globalStyle(`${content} > ${paragraph}:last-child`, {
  marginBottom: 0,
});

export const detailsStyles = {
  details,
  summary,
  summaryText,
  chevron,
  content,
} as const;
