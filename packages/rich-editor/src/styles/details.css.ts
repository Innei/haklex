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
  border: 'none',
  backgroundColor: 'transparent',
  interpolateSize: 'allow-keywords',
});

export const summary = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.spacing.sm,
  cursor: 'pointer',
  userSelect: 'none',
  padding: `${vars.spacing.xs} 0`,
  color: vars.color.text,
  fontWeight: 500,
  fontSize: '1em',
  lineHeight: vars.typography.lineHeight,
  listStyle: 'none',
  outline: 'none',
  borderRadius: vars.borderRadius.sm,
  transition: 'opacity 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
  selectors: {
    '&:hover': {
      opacity: '0.82',
    },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${vars.color.accentLight}`,
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
  marginTop: vars.spacing.xs,
  padding: `${vars.spacing.sm} ${vars.spacing.xl}`,
  color: vars.color.textSecondary,
  backgroundColor: `color-mix(in srgb, ${vars.color.accent} 6%, ${vars.color.bgSecondary})`,
  borderRadius: vars.borderRadius.md,
});

globalStyle(`${summary}:hover ${chevron}`, {
  color: vars.color.textSecondary,
});

globalStyle(`${details}[open] ${chevron}`, {
  color: vars.color.accent,
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
