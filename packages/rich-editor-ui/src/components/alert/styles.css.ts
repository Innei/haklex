import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

export const alert = recipe({
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: vars.borderRadius.md,
    fontSize: '13px',
    lineHeight: '1.5',
    border: '1px solid transparent',
    color: vars.color.text,
  },
  variants: {
    variant: {
      info: {
        backgroundColor: `color-mix(in oklab, ${vars.color.alertInfo} 6%, transparent)`,
        borderColor: `color-mix(in oklab, ${vars.color.alertInfo} 18%, transparent)`,
      },
      warning: {
        backgroundColor: `color-mix(in oklab, ${vars.color.alertWarning} 6%, transparent)`,
        borderColor: `color-mix(in oklab, ${vars.color.alertWarning} 18%, transparent)`,
      },
      error: {
        backgroundColor: `color-mix(in oklab, ${vars.color.alertCaution} 6%, transparent)`,
        borderColor: `color-mix(in oklab, ${vars.color.alertCaution} 18%, transparent)`,
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
  display: 'block',
  width: '16px',
  height: '16px',
  flexShrink: 0,
  marginTop: '2px',
});

export const alertAction = style({
  flexShrink: 0,
  marginLeft: 'auto',
});
