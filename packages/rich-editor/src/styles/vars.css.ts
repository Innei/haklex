import { createTheme, createThemeContract } from '@vanilla-extract/css'

export const vars = createThemeContract({
  color: {
    text: null,
    textSecondary: null,
    bg: null,
    bgSecondary: null,
    border: null,
    accent: null,
    accentLight: null,
    link: null,
    codeText: null,
    codeBg: null,
    quoteBorder: null,
    quoteBg: null,
    alertInfo: null,
    alertWarning: null,
    alertTip: null,
    alertCaution: null,
    alertImportant: null,
  },
  spacing: {
    xs: null,
    sm: null,
    md: null,
    lg: null,
    xl: null,
  },
  typography: {
    fontFamily: null,
    fontMono: null,
    fontSizeBase: null,
    fontSizeSmall: null,
    fontSizeLarge: null,
    lineHeight: null,
    lineHeightTight: null,
  },
  borderRadius: {
    sm: null,
    md: null,
    lg: null,
  },
})

export const articleTheme = createTheme(vars, {
  color: {
    text: '#1a1a1a',
    textSecondary: '#6b7280',
    bg: '#ffffff',
    bgSecondary: '#f9fafb',
    border: '#e5e7eb',
    accent: '#33A6B8',
    accentLight: '#33A6B833',
    link: '#33A6B8',
    codeText: '#e83e8c',
    codeBg: '#f3f4f6',
    quoteBorder: '#33A6B8',
    quoteBg: '#f0f9fb',
    alertInfo: '#3b82f6',
    alertWarning: '#f59e0b',
    alertTip: '#22c55e',
    alertCaution: '#ef4444',
    alertImportant: '#a855f7',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono:
      '"SF Mono", SFMono-Regular, ui-monospace, "DejaVu Sans Mono", Menlo, Consolas, monospace',
    fontSizeBase: '16px',
    fontSizeSmall: '14px',
    fontSizeLarge: '18px',
    lineHeight: '1.7',
    lineHeightTight: '1.4',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
})

export const commentTheme = createTheme(vars, {
  color: {
    text: '#1a1a1a',
    textSecondary: '#6b7280',
    bg: '#ffffff',
    bgSecondary: '#f9fafb',
    border: '#e5e7eb',
    accent: '#33A6B8',
    accentLight: '#33A6B833',
    link: '#33A6B8',
    codeText: '#e83e8c',
    codeBg: '#f3f4f6',
    quoteBorder: '#9ca3af',
    quoteBg: '#f9fafb',
    alertInfo: '#3b82f6',
    alertWarning: '#f59e0b',
    alertTip: '#22c55e',
    alertCaution: '#ef4444',
    alertImportant: '#a855f7',
  },
  spacing: {
    xs: '2px',
    sm: '4px',
    md: '10px',
    lg: '16px',
    xl: '20px',
  },
  typography: {
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono:
      '"SF Mono", SFMono-Regular, ui-monospace, "DejaVu Sans Mono", Menlo, Consolas, monospace',
    fontSizeBase: '14px',
    fontSizeSmall: '12px',
    fontSizeLarge: '15px',
    lineHeight: '1.5',
    lineHeightTight: '1.3',
  },
  borderRadius: {
    sm: '3px',
    md: '6px',
    lg: '8px',
  },
})
