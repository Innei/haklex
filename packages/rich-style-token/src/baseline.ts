import { vars } from './vars.css';

const resetText = {
  letterSpacing: 'normal',
  wordSpacing: 'normal',
  fontFeatureSettings: 'normal',
  fontVariant: 'normal',
  fontStyle: 'normal',
  fontWeight: 400,
  textTransform: 'none',
  textIndent: 0,
  color: vars.color.text,
} as const;

export const chromeTypography = {
  ...resetText,
  fontFamily: vars.typography.fontFamilySans,
  fontSize: vars.typography.fontSizeSmall,
  lineHeight: vars.typography.lineHeightCompact,
} as const;

export const contentTypography = {
  ...resetText,
  fontFamily: vars.typography.fontFamily,
} as const;
