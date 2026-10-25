import { keyframes } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

export const spinner = recipe({
  base: {
    display: 'inline-block',
    boxSizing: 'border-box',
    borderRadius: '50%',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, currentColor 20%, transparent)',
    borderTopColor: 'currentColor',
    animation: `${spin} 0.7s linear infinite`,
    flexShrink: 0,
  },
  variants: {
    size: {
      sm: { width: '12px', height: '12px', borderWidth: '1.5px' },
      md: { width: '16px', height: '16px', borderWidth: '2px' },
      lg: { width: '20px', height: '20px', borderWidth: '2px' },
    },
  },
  defaultVariants: { size: 'sm' },
});
