import { chromeMotion, chromeRadius, chromeText, vars } from '@haklex/rich-style-token/styles';
import { createVar, globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

const tone = createVar();
const surface = createVar();
const edge = createVar();
const actionFill = createVar();
const actionFillHover = createVar();

const toned = (color: string) => ({
  vars: {
    [tone]: color,
    [surface]: `color-mix(in oklab, ${color} 4%, transparent)`,
    [edge]: `color-mix(in oklab, ${color} 32%, transparent)`,
    [actionFill]: `color-mix(in oklab, ${color} 12%, transparent)`,
    [actionFillHover]: `color-mix(in oklab, ${color} 18%, transparent)`,
  },
});

export const alert = recipe({
  base: {
    ...chromeText.control,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '8px 12px',
    boxSizing: 'border-box',
    borderRadius: chromeRadius.md,
    fontFamily: vars.typography.fontFamilySans,
    backgroundColor: surface,
    border: `1px solid ${edge}`,
    color: vars.color.text,
  },
  variants: {
    variant: {
      info: toned(vars.color.alertInfo),
      success: toned(vars.color.alertTip),
      warning: toned(vars.color.alertWarning),
      error: toned(vars.color.alertCaution),
      neutral: {
        vars: {
          [tone]: vars.color.textSecondary,
          [surface]: vars.color.fillTertiary,
          [edge]: vars.color.border,
          [actionFill]: vars.color.fillSecondary,
          [actionFillHover]: vars.color.fill,
        },
      },
    },
  },
  defaultVariants: { variant: 'info' },
});

export const alertContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  flex: 1,
  minWidth: 0,
});

export const alertTitle = style({
  ...chromeText.control,
  fontWeight: 600,
});

export const alertIcon = style({
  display: 'block',
  width: '16px',
  height: '16px',
  flexShrink: 0,
  marginTop: '2px',
  color: tone,
});

export const alertAction = style({
  flexShrink: 0,
  marginLeft: 'auto',
  alignSelf: 'center',
});

globalStyle(`${alertAction} button`, {
  color: tone,
  backgroundColor: actionFill,
  border: 'none',
  transition: `background-color ${chromeMotion.state} ease`,
});

globalStyle(`${alertAction} button:hover:not(:disabled)`, {
  color: tone,
  backgroundColor: actionFillHover,
});
