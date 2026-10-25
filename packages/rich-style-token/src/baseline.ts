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
  fontSize: '14px',
  lineHeight: '20px',
} as const;

export const contentTypography = {
  ...resetText,
  fontFamily: vars.typography.fontFamily,
} as const;
