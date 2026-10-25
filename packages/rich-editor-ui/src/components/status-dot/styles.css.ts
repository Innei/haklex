import { vars } from '@haklex/rich-style-token/styles';
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
      idle: { backgroundColor: vars.color.textQuaternary },
      active: { backgroundColor: vars.color.alertInfo },
      success: { backgroundColor: vars.color.alertTip },
      error: { backgroundColor: vars.color.alertCaution },
      warning: { backgroundColor: vars.color.alertWarning },
    },
    size: {
      sm: { width: '8px', height: '8px' },
      md: { width: '10px', height: '10px' },
    },
  },
  defaultVariants: { status: 'idle', size: 'sm' },
});

export const pulseRing = recipe({
  base: {
    'position': 'absolute',
    'borderRadius': '50%',
    '@media': {
      '(prefers-reduced-motion: no-preference)': {
        animation: `${pulse} 1.5s ease-in-out infinite`,
      },
    },
  },
  variants: {
    status: {
      idle: { backgroundColor: vars.color.textQuaternary },
      active: { backgroundColor: vars.color.alertInfo },
      success: { backgroundColor: vars.color.alertTip },
      error: { backgroundColor: vars.color.alertCaution },
      warning: { backgroundColor: vars.color.alertWarning },
    },
    size: {
      sm: { width: '8px', height: '8px' },
      md: { width: '10px', height: '10px' },
    },
  },
  defaultVariants: { status: 'idle', size: 'sm' },
});
