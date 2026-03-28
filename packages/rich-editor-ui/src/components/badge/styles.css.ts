import { vars } from '@haklex/rich-style-token/styles';
import { recipe } from '@vanilla-extract/recipes';

export const badge = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    lineHeight: 1,
  },
  variants: {
    variant: {
      neutral: {
        backgroundColor: vars.color.fillTertiary,
        color: vars.color.textTertiary,
      },
      success: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        color: '#16a34a',
      },
      error: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#dc2626',
      },
      warning: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        color: '#d97706',
      },
      info: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        color: '#2563eb',
      },
    },
    size: {
      sm: { fontSize: '11px', padding: '2px 6px', gap: '3px' },
      md: { fontSize: '12px', padding: '3px 8px', gap: '4px' },
    },
  },
  defaultVariants: { variant: 'neutral', size: 'sm' },
});
