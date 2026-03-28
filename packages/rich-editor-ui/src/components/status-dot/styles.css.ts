import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

const pulse = keyframes({
  '0%': { transform: 'scale(1)', opacity: 1 },
  '50%': { transform: 'scale(1.8)', opacity: 0 },
  '100%': { transform: 'scale(1.8)', opacity: 0 },
});

export const statusDotWrapper = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const dot = recipe({
  base: {
    borderRadius: '50%',
    flexShrink: 0,
  },
  variants: {
    status: {
      idle: { backgroundColor: '#a3a3a3' },
      active: { backgroundColor: '#3b82f6' },
      success: { backgroundColor: '#22c55e' },
      error: { backgroundColor: '#ef4444' },
      warning: { backgroundColor: '#f59e0b' },
    },
    size: {
      sm: { width: '8px', height: '8px' },
      md: { width: '12px', height: '12px' },
    },
  },
  defaultVariants: { status: 'idle', size: 'sm' },
});

export const pulseRing = recipe({
  base: {
    position: 'absolute',
    borderRadius: '50%',
    animation: `${pulse} 1.5s ease-in-out infinite`,
  },
  variants: {
    status: {
      idle: { backgroundColor: '#a3a3a3' },
      active: { backgroundColor: '#3b82f6' },
      success: { backgroundColor: '#22c55e' },
      error: { backgroundColor: '#ef4444' },
      warning: { backgroundColor: '#f59e0b' },
    },
    size: {
      sm: { width: '8px', height: '8px' },
      md: { width: '12px', height: '12px' },
    },
  },
  defaultVariants: { status: 'idle', size: 'sm' },
});
