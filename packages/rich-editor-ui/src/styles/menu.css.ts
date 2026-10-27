import {
  chromeMotion,
  chromeRadius,
  chromeText,
  chromeTypography,
  iconTone,
  textLevel,
  toneDown,
  vars,
} from '@haklex/rich-style-token/styles';
import type { StyleRule } from '@vanilla-extract/css';
import { createVar, globalStyle, style } from '@vanilla-extract/css';

/** Default icon tone for a menu item; consumers can override it per item. */
const iconToneVar = createVar();

export const popupMotion: StyleRule = {
  'transformOrigin': 'var(--transform-origin)',
  'transition': `opacity ${chromeMotion.popupIn}, transform ${chromeMotion.popupIn}`,
  'selectors': {
    '&[data-starting-style]': {
      opacity: 0,
      transform: 'scale(0.97)',
    },
    '&[data-ending-style]': {
      opacity: 0,
      transform: 'scale(0.97)',
      transition: `opacity ${chromeMotion.popupOut}, transform ${chromeMotion.popupOut}`,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      selectors: {
        '&[data-starting-style], &[data-ending-style]': {
          transform: 'none',
        },
      },
    },
  },
};

export const popupBase: StyleRule = {
  ...chromeTypography,
  ...popupMotion,
  minWidth: '8rem',
  boxSizing: 'border-box',
  borderRadius: chromeRadius.lg,
  padding: '4px',
  backgroundColor: vars.color.bgElevated,
  boxShadow: vars.boxShadow.menu,
  outline: 'none',
  zIndex: 50,
  maxHeight: 'var(--available-height)',
  overflowX: 'hidden',
  overflowY: 'auto',
};

export const itemBase: StyleRule = {
  ...chromeText.item,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minHeight: '32px',
  boxSizing: 'border-box',
  padding: '0 8px',
  borderRadius: chromeRadius.md,
  outline: 'none',
  userSelect: 'none',
  cursor: 'default',
  color: textLevel[4],
  vars: { [iconToneVar]: iconTone(4) },
  transition: `background-color ${chromeMotion.state} ease, color ${chromeMotion.state} ease`,
  selectors: {
    '&[data-highlighted]': {
      backgroundColor: vars.color.fillSecondary,
    },
    '&[data-highlighted]:active': {
      backgroundColor: vars.color.fill,
    },
    '&[data-disabled]': {
      opacity: 0.5,
      pointerEvents: 'none',
    },
  },
};

/**
 * A menu item opts icons into the text level scale: `iconTone(4)` sits one step
 * below the label's `textLevel[4]`, so the glyph is quieter than the text by
 * default. The color travels as a custom property, which means consumers win by
 * declaring their own — and the `:where()` ancestor keeps the rule at element
 * specificity, so a class on the icon wins too. Icons that carry their own
 * semantic color (alert/banner types) simply out-specify it.
 *
 * Size follows the same "one step below the label" rule, in `em` so it tracks
 * the item's font-size instead of pinning a pixel value.
 */
export function applyItemSvgStyles(itemClass: string) {
  globalStyle(`:where(${itemClass}) svg:not(:where(kbd svg))`, {
    pointerEvents: 'none',
    flexShrink: 0,
    width: '0.875em',
    height: '0.875em',
    color: iconToneVar,
    transition: `color ${chromeMotion.state} ease`,
  });
}

export const destructive = style({
  selectors: {
    '&&': {
      color: vars.color.alertCaution,
      vars: { [iconToneVar]: toneDown(vars.color.alertCaution) },
    },
    '&&[data-highlighted]': {
      backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 8%, transparent)`,
    },
  },
});

export const shortcut = style({
  marginLeft: 'auto',
  paddingLeft: '16px',
});

export const separator = style({
  height: '1px',
  margin: '4px 0',
  backgroundColor: vars.color.borderSubtle,
});

export const label = style({
  ...chromeText.label,
  padding: '8px 8px 4px',
  color: vars.color.textTertiary,
});
