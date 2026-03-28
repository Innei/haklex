import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

export const alert = recipe({
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    lineHeight: '1.5',
    borderLeft: '3px solid',
  },
  variants: {
    variant: {
      info: {
        backgroundColor: 'rgba(59, 130, 246, 0.06)',
        borderLeftColor: '#3b82f6',
        color: '#1e40af',
      },
      warning: {
        backgroundColor: 'rgba(245, 158, 11, 0.06)',
        borderLeftColor: '#f59e0b',
        color: '#92400e',
      },
      error: {
        backgroundColor: 'rgba(239, 68, 68, 0.06)',
        borderLeftColor: '#ef4444',
        color: '#991b1b',
      },
    },
  },
  defaultVariants: { variant: 'info' },
});

export const alertContent = style({
  flex: 1,
  minWidth: 0,
});

export const alertIcon = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,
  marginTop: '2px',
});

export const alertAction = style({
  flexShrink: 0,
  marginLeft: 'auto',
});
