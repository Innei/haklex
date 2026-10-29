import { chromeText, vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minWidth: 0,
});

export const label = style({
  ...chromeText.label,
  color: vars.color.textSecondary,
  fontFamily: vars.typography.fontFamilySans,
});

const helper = {
  ...chromeText.label,
  fontWeight: 400,
  margin: 0,
  fontFamily: vars.typography.fontFamilySans,
};

export const hint = style({
  ...helper,
  color: vars.color.textTertiary,
});

export const error = style({
  ...helper,
  color: vars.color.alertCaution,
});
