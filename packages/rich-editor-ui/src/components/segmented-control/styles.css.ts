import { vars } from '@haklex/rich-style-token/styles'
import { recipe } from '@vanilla-extract/recipes'

export const container = recipe({
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '0.5rem',
    backgroundColor: vars.color.bgTertiary,
    padding: '0.25rem',
  },
  variants: {
    size: {
      sm: {
        height: '2rem',
        fontSize: vars.typography.fontSizeXs,
      },
      md: {
        height: '2.5rem',
        fontSize: vars.typography.fontSizeMd,
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
})

export const indicator = recipe({
  base: {
    position: 'absolute',
    top: '0.25rem',
    bottom: '0.25rem',
    borderRadius: '0.375rem',
    backgroundColor: vars.color.bg,
    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
    transition: 'all 300ms cubic-bezier(0.25, 1, 0.5, 1)',
    pointerEvents: 'none',
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
})

export const item = recipe({
  base: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    borderRadius: '0.375rem',
    fontWeight: 500,
    outline: 'none',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'color 200ms',
    color: vars.color.textSecondary,
    selectors: {
      '&:focus-visible': {
        outline: `2px solid ${vars.color.accent}`,
        outlineOffset: '1px',
      },
    },
  },
  variants: {
    size: {
      sm: {
        padding: '0 0.75rem',
      },
      md: {
        padding: '0 1rem',
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
        opacity: 0.4,
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
})
