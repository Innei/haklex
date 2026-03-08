import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle } from '@vanilla-extract/css';

import { richContent } from './shared.css';

// ─── Details / Collapse ─────────────────────────────────
globalStyle(`${richContent} .rich-details`, {
  margin: `${vars.spacing.md} 0`,
  border: 'none',
  backgroundColor: 'transparent',
  interpolateSize: 'allow-keywords',
});

// ─── Summary ────────────────────────────────────────────
globalStyle(`${richContent} .rich-details-summary`, {
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
});

globalStyle(`${richContent} .rich-details-summary:hover`, {
  opacity: '0.82',
});

globalStyle(`${richContent} .rich-details-summary:focus-visible`, {
  boxShadow: `0 0 0 2px ${vars.color.accentLight}`,
});

globalStyle(`${richContent} .rich-details-summary::-webkit-details-marker`, {
  display: 'none',
});

globalStyle(`${richContent} .rich-details-summary::marker`, {
  display: 'none',
  content: '""',
});

globalStyle(`${richContent} .rich-details-summary-text`, {
  flex: '1',
  minWidth: 0,
});

// ─── Chevron ────────────────────────────────────────────
globalStyle(`${richContent} .rich-details-chevron`, {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.25rem',
  height: '1.25rem',
  position: 'relative',
  top: '0.125rem',
  flexShrink: 0,
  color: vars.color.textTertiary,
  transformOrigin: 'center',
  transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease',
});

globalStyle(`${richContent} .rich-details-summary:hover .rich-details-chevron`, {
  color: vars.color.textSecondary,
});

globalStyle(`${richContent} .rich-details[open] .rich-details-chevron`, {
  color: vars.color.accent,
  transform: 'rotate(90deg)',
});

// ─── ::details-content Transition ───────────────────────
globalStyle(`${richContent} .rich-details::details-content`, {
  display: 'block',
  height: 0,
  overflow: 'hidden',
  opacity: 0,
  contentVisibility: 'hidden',
  transition:
    'height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), content-visibility 0.4s cubic-bezier(0.4, 0, 0.2, 1) allow-discrete',
} as any);

globalStyle(`${richContent} .rich-details[open]::details-content`, {
  height: 'auto',
  opacity: 1,
  contentVisibility: 'visible',
} as any);

// ─── Content body ───────────────────────────────────────
globalStyle(`${richContent} .rich-details-content`, {
  marginTop: vars.spacing.xs,
  padding: `${vars.spacing.sm} ${vars.spacing.xl}`,
  color: vars.color.textSecondary,
  backgroundColor: `color-mix(in srgb, ${vars.color.accent} 6%, ${vars.color.bgSecondary})`,
  borderRadius: vars.borderRadius.md,
});

globalStyle(`${richContent} .rich-details-content > .rich-paragraph:first-child`, {
  marginTop: 0,
});

globalStyle(`${richContent} .rich-details-content > .rich-paragraph:last-child`, {
  marginBottom: 0,
});
