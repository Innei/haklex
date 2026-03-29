import { vars } from '@haklex/rich-style-token/styles';
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

const transition = 'color 150ms ease, background-color 150ms ease';
const transitionWithBorder =
  'background-color 150ms ease, border-color 150ms ease, color 150ms ease';

export const actionButton = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    appearance: 'none',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition,
    outline: 'none',
    selectors: {
      '&:focus-visible': {
        boxShadow: `0 0 0 2px ${vars.color.accentLight}`,
      },
      '&:disabled': {
        opacity: 0.45,
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
        },
      },
      solid: {
        backgroundColor: vars.color.text,
        color: vars.color.bg,
        transition: transitionWithBorder,
        selectors: {
          '&:hover:not(:disabled)': {
            backgroundColor: `color-mix(in srgb, ${vars.color.text} 86%, transparent)`,
          },
        },
      },
      outline: {
        background: vars.color.bg,
        color: vars.color.textSecondary,
        border: `1px solid ${vars.color.border}`,
        transition: transitionWithBorder,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.color.fillSecondary,
            color: vars.color.text,
          },
        },
      },
      accent: {
        backgroundColor: vars.color.accent,
        color: '#fff',
        selectors: {
          '&:hover:not(:disabled)': {
            filter: 'brightness(0.9)',
          },
          '&:disabled': {
            opacity: 0.5,
            cursor: 'default',
            pointerEvents: 'none',
          },
        },
      },
    },
    size: {
      sm: {
        gap: '6px',
        fontSize: vars.typography.fontSizeSm,
        fontWeight: 500,
        padding: '4px 8px',
        borderRadius: vars.borderRadius.sm,
        height: '24px',
        whiteSpace: 'nowrap',
      },
      md: {
        gap: '6px',
        fontSize: vars.typography.fontSizeSm,
        fontWeight: 500,
        padding: '4px 10px',
        borderRadius: vars.borderRadius.md,
        height: '28px',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      },
      lg: {
        gap: '8px',
        fontSize: vars.typography.fontSizeSmall,
        fontWeight: 600,
        padding: '0 14px',
        borderRadius: vars.borderRadius.md,
        height: '36px',
        whiteSpace: 'nowrap',
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
      style: {
        fontSize: vars.typography.fontSizeSmall,
        width: '24px',
        height: '24px',
        padding: 0,
        gap: 0,
        color: `color-mix(in srgb, ${vars.color.textSecondary} 60%, transparent)`,
        selectors: {
          '&:hover:not(:disabled)': {
            color: vars.color.text,
            backgroundColor: vars.color.fillSecondary,
          },
          '&:disabled': {
            opacity: 0.3,
            pointerEvents: 'none',
          },
        },
      },
    },
    {
      variants: { icon: true, size: 'md' },
      style: {
        fontSize: vars.typography.fontSizeBase,
        padding: 6,
        borderRadius: vars.borderRadius.md,
        height: 'auto',
        width: 'auto',
        gap: 0,
        color: vars.color.textSecondary,
        selectors: {
          '&:hover:not(:disabled)': {
            color: vars.color.text,
            backgroundColor: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
          },
          '&:disabled': {
            opacity: 0.3,
            cursor: 'default',
          },
          '&:disabled:hover': {
            background: 'none',
            color: vars.color.textSecondary,
          },
        },
      },
    },
    {
      variants: { icon: true, size: 'lg' },
      style: {
        fontSize: '20px',
        padding: 8,
        borderRadius: vars.borderRadius.md,
        height: 'auto',
        width: 'auto',
        gap: 0,
        color: vars.color.textSecondary,
        selectors: {
          '&:hover:not(:disabled)': {
            color: vars.color.text,
            backgroundColor: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
          },
          '&:disabled': {
            opacity: 0.3,
            cursor: 'default',
          },
          '&:disabled:hover': {
            background: 'none',
            color: vars.color.textSecondary,
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
