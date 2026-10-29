import {
  chromeHeight,
  chromeMotion,
  chromeRadius,
  chromeText,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { recipe } from '@vanilla-extract/recipes';

export const container = recipe({
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'stretch',
    boxSizing: 'border-box',
    borderRadius: chromeRadius.md,
    backgroundColor: vars.color.fillSecondary,
    padding: '2px',
    fontFamily: vars.typography.fontFamilySans,
  },
  variants: {
    size: {
      sm: {
        ...chromeText.label,
        height: chromeHeight.md,
      },
      md: {
        ...chromeText.control,
        fontWeight: 500,
        height: chromeHeight.lg,
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
      false: {},
    },
  },
  defaultVariants: {
    size: 'sm',
    fullWidth: false,
  },
});

export const indicator = recipe({
  base: {
    'position': 'absolute',
    'top': '2px',
    'bottom': '2px',
    'borderRadius': '6px',
    'backgroundColor': vars.color.bg,
    'boxShadow': vars.boxShadow.xs,
    'transition': `left ${chromeMotion.layout}, width ${chromeMotion.layout}`,
    'pointerEvents': 'none',
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
  },
  variants: {
    ready: {
      true: {},
      false: {
        opacity: 0,
      },
    },
  },
  defaultVariants: {
    ready: true,
  },
});

export const item = recipe({
  base: {
    position: 'relative',
    zIndex: 10,
    flex: '1 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    borderRadius: '6px',
    font: 'inherit',
    fontWeight: 500,
    outline: 'none',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: `color ${chromeMotion.state} ease`,
    color: vars.color.textSecondary,
    selectors: {
      '&:hover': {
        color: vars.color.text,
      },
      '&:focus-visible': {
        boxShadow: focusRing,
      },
    },
  },
  variants: {
    size: {
      sm: {
        padding: '0 10px',
      },
      md: {
        padding: '0 12px',
      },
    },
    active: {
      true: {
        color: vars.color.text,
      },
      false: {},
    },
    disabled: {
      true: {
        pointerEvents: 'none',
        opacity: 0.5,
      },
      false: {},
    },
    fullWidth: {
      true: {
        flex: 1,
      },
      false: {},
    },
  },
  defaultVariants: {
    size: 'sm',
    active: false,
    disabled: false,
    fullWidth: false,
  },
});
