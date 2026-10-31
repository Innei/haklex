import { vars } from '@haklex/rich-style-token/styles';
import { createGlobalVar, globalStyle, style } from '@vanilla-extract/css';

import { paragraph } from './shared.css';

const progress = createGlobalVar('--rc-details-progress', {
  syntax: '<number>',
  inherits: true,
  initialValue: '0',
});
const contentProgress = createGlobalVar('--rc-details-content-progress', {
  syntax: '<number>',
  inherits: true,
  initialValue: '0',
});

// The guide hands off from horizontal to vertical while content responds immediately.
// Each details resets both timelines so nested disclosures stay independent.
const horizontalPhase = `clamp(0, calc(${progress} / 0.42), 1)`;
const verticalPhase = `clamp(0, calc((${progress} - 0.42) / 0.58), 1)`;
const horizontalProgress = `calc(${horizontalPhase} * ${horizontalPhase} * (3 - 2 * ${horizontalPhase}))`;
const verticalProgress = `calc(${verticalPhase} * ${verticalPhase} * (3 - 2 * ${verticalPhase}))`;
const restoring = ':is([data-restoring], [data-recycler-restoring])';

export const detailsClassNames = {
  details: 'rich-details',
  summary: 'rich-details-summary',
  summaryText: 'rich-details-summary-text',
  chevron: 'rich-details-chevron',
  content: 'rich-details-content',
} as const;

export const details = style({
  'vars': { [progress]: '0', [contentProgress]: '0' },
  'margin': `${vars.spacing.md} 0`,
  'border': 'none',
  'backgroundColor': 'transparent',
  'transition':
    '--rc-details-progress 640ms linear, --rc-details-content-progress 370ms cubic-bezier(0.4, 0, 0.2, 1)',
  'selectors': {
    '&[open]': { vars: { [progress]: '1', [contentProgress]: '1' } },
    [`${restoring} &`]: { transition: 'none' },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none' },
  },
});

export const summary = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.spacing.sm,
  cursor: 'pointer',
  userSelect: 'none',
  padding: '0.75em 0',
  color: vars.color.text,
  fontWeight: 500,
  fontSize: '1em',
  lineHeight: vars.typography.lineHeight,
  listStyle: 'none',
  outline: 'none',
  transition: 'box-shadow 120ms ease-out',
  selectors: {
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
    '&::after': {
      content: '""',
      flex: '1 1 2.5rem',
      minWidth: '1.5rem',
      height: 1,
      marginLeft: '0.75rem',
      alignSelf: 'center',
      backgroundColor: vars.color.border,
      transform: `scaleX(calc(1 - ${horizontalProgress}))`,
      transformOrigin: 'left center',
      pointerEvents: 'none',
    },
  },
});

export const summaryText = style({
  flex: '0 1 auto',
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
  transform: `rotate(calc(${contentProgress} * 90deg))`,
  transition: 'color 0.2s ease',
});

export const content = style({
  position: 'relative',
  minHeight: 0,
  overflow: 'hidden',
  padding: `calc(0.875em * ${contentProgress}) 0 calc(1.25em * ${contentProgress}) calc(1.25rem + ${vars.spacing.sm})`,
  color: vars.color.textSecondary,
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: '1.25em',
      left: 'calc(0.625rem - 0.5px)',
      width: 1,
      backgroundColor: vars.color.border,
      transform: `scaleY(${verticalProgress})`,
      transformOrigin: 'center top',
      pointerEvents: 'none',
    },
  },
});

globalStyle(`${summary}:hover > ${chevron}`, {
  color: vars.color.textSecondary,
});

globalStyle(`${details}[open] > ${summary} > ${chevron}`, {
  color: vars.color.textSecondary,
});

// Grid preserves height animation where intrinsic-size arithmetic is unavailable.
globalStyle(`${details}::details-content`, {
  display: 'grid',
  gridTemplateRows: '0fr',
  overflow: 'hidden',
  opacity: contentProgress,
  contentVisibility: 'hidden',
  transition:
    'grid-template-rows 370ms cubic-bezier(0.4, 0, 0.2, 1), content-visibility 640ms allow-discrete',
} as any);

globalStyle(`${details}[open]::details-content`, {
  gridTemplateRows: '1fr',
  contentVisibility: 'visible',
} as any);

globalStyle(`${details}::details-content, ${details}[open]::details-content`, {
  '@supports': {
    '(height: calc-size(auto, size * 0.5))': {
      display: 'block',
      height: `calc-size(auto, size * ${contentProgress})`,
      transition: 'content-visibility 640ms allow-discrete',
      transitionDelay: '0ms',
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none !important' },
  },
} as any);

globalStyle(`${restoring} ${details}::details-content`, {
  transition: 'none !important',
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
