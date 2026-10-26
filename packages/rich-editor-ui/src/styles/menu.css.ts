import {
  chromeMotion,
  chromeRadius,
  chromeText,
  chromeTypography,
  vars,
} from '@haklex/rich-style-token/styles';
import type { StyleRule } from '@vanilla-extract/css';
import { globalStyle, style } from '@vanilla-extract/css';

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
  color: vars.color.text,
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

export function applyItemSvgStyles(itemClass: string) {
  globalStyle(`${itemClass} svg:not(kbd svg)`, {
    pointerEvents: 'none',
    flexShrink: 0,
    width: '16px',
    height: '16px',
    color: vars.color.textSecondary,
    transition: `color ${chromeMotion.state} ease`,
  });

  globalStyle(`${itemClass}[data-highlighted] svg:not(kbd svg)`, {
    color: 'inherit',
  });
}

export const destructive = style({
  selectors: {
    '&&': {
      color: vars.color.alertCaution,
    },
    '&&[data-highlighted]': {
      backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 8%, transparent)`,
    },
  },
});

globalStyle(`${destructive}${destructive} svg:not(kbd svg)`, {
  color: vars.color.alertCaution,
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
