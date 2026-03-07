import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';
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

const transition = 'color 0.15s ease, background-color 0.15s ease';
const transitionWithBorder =
  'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease';

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
    selectors: {
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
        borderColor: vars.color.border,
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
            backgroundColor: vars.color.accent,
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
        borderRadius: vars.borderRadius.md,
        whiteSpace: 'nowrap',
      },
      md: {
        fontSize: vars.typography.fontSizeXs,
        fontWeight: 500,
        padding: '4px 10px',
        borderRadius: vars.borderRadius.md,
        height: '28px',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      },
      lg: {
        gap: '0.45rem',
        fontSize: vars.typography.fontSizeXs,
        fontWeight: 600,
        padding: '0 0.875rem',
        borderRadius: vars.borderRadius.md,
        height: 36,
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
  },
  compoundVariants: [
    {
      variants: { icon: true, size: 'sm' },
      style: {
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
  },
});
