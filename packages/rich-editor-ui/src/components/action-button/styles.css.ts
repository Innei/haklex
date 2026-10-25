import {
  chromeHeight,
  chromeMotion,
  chromeRadius,
  chromeText,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

export const semanticClassNames = {
  actionBar: 're-ui-action-bar',
  actionButton: 're-ui-action-btn',
  actionButtonEnd: 're-ui-action-btn--end',
  actionButtonDanger: 're-ui-action-btn--danger',
  actionButtonIcon: 're-ui-action-btn--icon',
} as const;

export const actionBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '4px',
});

const transition = `color ${chromeMotion.state} ease, background-color ${chromeMotion.state} ease, opacity ${chromeMotion.state} ease`;

const primary = {
  backgroundColor: vars.color.text,
  color: vars.color.bg,
  selectors: {
    '&:hover:not(:disabled)': {
      opacity: 0.86,
    },
    '&:active:not(:disabled)': {
      opacity: 0.78,
    },
  },
};

const iconSquare = (size: string, fontSize: string) => ({
  width: size,
  height: size,
  padding: 0,
  gap: 0,
  fontSize,
  color: vars.color.textSecondary,
});

export const actionButton = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    appearance: 'none',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontFamily: vars.typography.fontFamilySans,
    whiteSpace: 'nowrap',
    borderRadius: chromeRadius.md,
    transition,
    outline: 'none',
    selectors: {
      '&:focus-visible': {
        boxShadow: focusRing,
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    variant: {
      ghost: {
        color: 'inherit',
        selectors: {
          '&:hover:not(:disabled)': {
            backgroundColor: vars.color.fillSecondary,
          },
          '&:active:not(:disabled), &[aria-pressed="true"], &[aria-pressed="true"]:hover:not(:disabled)':
            {
              backgroundColor: vars.color.fill,
              color: vars.color.text,
            },
        },
      },
      solid: primary,
      outline: {
        background: vars.color.bg,
        color: vars.color.text,
        border: `1px solid ${vars.color.border}`,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.color.fillSecondary,
          },
          '&:active:not(:disabled), &[aria-pressed="true"], &[aria-pressed="true"]:hover:not(:disabled)':
            {
              background: vars.color.fill,
            },
        },
      },
      accent: primary,
    },
    size: {
      sm: {
        ...chromeText.label,
        gap: '4px',
        padding: '0 8px',
        height: chromeHeight.sm,
      },
      md: {
        ...chromeText.control,
        fontWeight: 500,
        gap: '6px',
        padding: '0 10px',
        height: chromeHeight.md,
      },
      lg: {
        ...chromeText.item,
        fontWeight: 500,
        gap: '8px',
        padding: '0 14px',
        height: chromeHeight.lg,
      },
    },
    icon: {
      true: {},
      false: {},
    },
    end: {
      true: { marginLeft: 'auto' },
      false: {},
    },
    danger: {
      true: {},
      false: {},
    },
    rounded: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: { icon: true, size: 'sm' },
      style: iconSquare(chromeHeight.sm, '14px'),
    },
    {
      variants: { icon: true, size: 'md' },
      style: iconSquare(chromeHeight.md, '16px'),
    },
    {
      variants: { icon: true, size: 'lg' },
      style: iconSquare(chromeHeight.lg, '18px'),
    },
    {
      variants: { icon: true, variant: 'ghost' },
      style: {
        selectors: {
          '&:hover:not(:disabled)': {
            color: vars.color.text,
          },
        },
      },
    },
    {
      variants: { rounded: true, icon: true },
      style: { borderRadius: '50%' },
    },
    {
      variants: { danger: true },
      style: {
        selectors: {
          '&:hover:not(:disabled)': {
            color: vars.color.alertCaution,
            backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
          },
        },
      },
    },
  ],
  defaultVariants: {
    variant: 'ghost',
    size: 'sm',
    icon: false,
    end: false,
    danger: false,
    rounded: false,
  },
});

globalStyle(`.${semanticClassNames.actionButtonIcon} svg`, {
  width: '1em',
  height: '1em',
});
