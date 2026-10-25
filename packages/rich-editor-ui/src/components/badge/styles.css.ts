import { vars } from '@haklex/rich-style-token/styles';
import { recipe } from '@vanilla-extract/recipes';

export const badge = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    fontFamily: vars.typography.fontFamilySans,
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
        backgroundColor: `color-mix(in oklab, ${vars.color.alertTip} 10%, transparent)`,
        color: vars.color.alertTip,
      },
      error: {
        backgroundColor: `color-mix(in oklab, ${vars.color.alertCaution} 10%, transparent)`,
        color: vars.color.alertCaution,
      },
      warning: {
        backgroundColor: `color-mix(in oklab, ${vars.color.alertWarning} 10%, transparent)`,
        color: vars.color.alertWarning,
      },
      info: {
        backgroundColor: `color-mix(in oklab, ${vars.color.alertInfo} 10%, transparent)`,
        color: vars.color.alertInfo,
      },
    },
    size: {
      sm: { fontSize: '11px', padding: '2px 6px', gap: '3px' },
      md: { fontSize: '12px', padding: '3px 8px', gap: '4px' },
    },
  },
  defaultVariants: { variant: 'neutral', size: 'sm' },
});
