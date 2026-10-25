import { chromeRadius, vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

const toned = (color: string) => ({
  backgroundColor: `color-mix(in oklab, ${color} 10%, transparent)`,
  color,
});

export const badge = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    borderRadius: chromeRadius.sm,
    fontFamily: vars.typography.fontFamilySans,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  variants: {
    variant: {
      neutral: {
        backgroundColor: vars.color.fillSecondary,
        color: vars.color.textSecondary,
      },
      success: toned(vars.color.alertTip),
      error: toned(vars.color.alertCaution),
      warning: toned(vars.color.alertWarning),
      info: toned(vars.color.alertInfo),
    },
    size: {
      sm: { height: '18px', fontSize: '11px', lineHeight: '16px', padding: '0 6px', gap: '4px' },
      md: { height: '20px', fontSize: '12px', lineHeight: '16px', padding: '0 6px', gap: '4px' },
    },
  },
  defaultVariants: { variant: 'neutral', size: 'sm' },
});

export const badgeDot = style({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: 'currentColor',
  flexShrink: 0,
});
