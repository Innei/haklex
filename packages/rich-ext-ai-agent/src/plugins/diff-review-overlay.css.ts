import {
  chromeMotion,
  chromeRadius,
  chromeText,
  chromeTypography,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

import { REVIEW_CURRENT_ATTR } from './review-navigation';

// Wraps each RichRenderer inside a diff row. Resets the first/last block's outer
// margin so the colored row hugs its content without extra vertical gaps.
export const rendererFrame = style({
  overflow: 'hidden',
});

globalStyle(`${rendererFrame} > :first-child`, {
  marginTop: 0,
});

globalStyle(`${rendererFrame} > :last-child`, {
  marginBottom: 0,
});

export const hunkRoot = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  margin: '16px 0',
});

export const hunkBody = style({
  flex: 1,
  minWidth: 0,
  borderRadius: 5,
  outline: '2px solid transparent',
  outlineOffset: 2,
  transition: `outline-color ${chromeMotion.state}`,
});

globalStyle(`[${REVIEW_CURRENT_ATTR}="true"] ${hunkBody}`, {
  outlineColor: vars.color.accent,
});

export const hunkGutter = style({
  display: 'flex',
  gap: 2,
  flex: 'none',
  padding: 2,
  borderRadius: chromeRadius.md,
  background: vars.color.bgElevated,
  boxShadow: vars.boxShadow.menu,
});

export const hunkReject = style({
  selectors: {
    '&.re-ui-action-btn': {
      color: vars.color.alertCaution,
    },
    '&.re-ui-action-btn:hover:not(:disabled)': {
      color: vars.color.alertCaution,
      backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
    },
  },
});

export const hunkAccept = style({
  selectors: {
    '&.re-ui-action-btn': {
      color: vars.color.alertTip,
    },
    '&.re-ui-action-btn:hover:not(:disabled)': {
      color: vars.color.alertTip,
      backgroundColor: `color-mix(in srgb, ${vars.color.alertTip} 12%, transparent)`,
    },
  },
});

export const reviewBar = style({
  ...chromeTypography,
  position: 'sticky',
  bottom: 8,
  zIndex: 5,
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 6,
  width: 'fit-content',
  maxWidth: 'calc(100% - 24px)',
  margin: '10px auto 12px',
  padding: '6px 6px 6px 12px',
  borderRadius: chromeRadius.lg,
  background: vars.color.bgElevated,
  boxShadow: vars.boxShadow.menu,
});

export const reviewBarIcon = style({
  flex: 'none',
  color: vars.color.accent,
});

export const reviewBarTitle = style({
  ...chromeText.control,
  color: vars.color.text,
  fontWeight: 600,
  whiteSpace: 'nowrap',
});

export const reviewBarSeparator = style({
  flex: 'none',
  width: 1,
  height: 16,
  margin: '0 2px',
  background: vars.color.border,
});

export const reviewBarPosition = style({
  ...chromeText.control,
  minWidth: 40,
  textAlign: 'center',
  color: vars.color.textSecondary,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
});

export const reviewBarKbd = style({
  marginInlineStart: 2,
});
