import { createGlobalThemeContract } from '@vanilla-extract/css'

export const vars = createGlobalThemeContract({
  color: {
    text: 'rc-text',
    textSecondary: 'rc-text-secondary',
    bg: 'rc-bg',
    bgSecondary: 'rc-bg-secondary',
    border: 'rc-border',
    accent: 'rc-accent',
    accentLight: 'rc-accent-light',
    link: 'rc-link',
    codeText: 'rc-code-text',
    codeBg: 'rc-code-bg',
    quoteBorder: 'rc-quote-border',
    quoteBg: 'rc-quote-bg',
    alertInfo: 'rc-alert-info',
    alertWarning: 'rc-alert-warning',
    alertTip: 'rc-alert-tip',
    alertCaution: 'rc-alert-caution',
    alertImportant: 'rc-alert-important',
  },
  spacing: {
    xs: 'rc-space-xs',
    sm: 'rc-space-sm',
    md: 'rc-space-md',
    lg: 'rc-space-lg',
    xl: 'rc-space-xl',
  },
  typography: {
    fontFamily: 'rc-font-family',
    fontMono: 'rc-font-mono',
    fontSizeBase: 'rc-font-size-base',
    fontSizeSmall: 'rc-font-size-small',
    fontSizeLarge: 'rc-font-size-large',
    lineHeight: 'rc-line-height',
    lineHeightTight: 'rc-line-height-tight',
  },
  borderRadius: {
    sm: 'rc-radius-sm',
    md: 'rc-radius-md',
    lg: 'rc-radius-lg',
  },
})
