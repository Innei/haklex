import {
  assignVars,
  createGlobalTheme,
  createGlobalThemeContract,
  createTheme,
  globalStyle,
} from '@vanilla-extract/css';

import {
  articleLayout,
  commentLayout,
  darkBoxShadow,
  darkColors,
  lightArticleColors,
  lightCommentColors,
  noteLayout,
} from './themes';

export const vars = createGlobalThemeContract({
  color: {
    /** 默认值: '#000' */
    text: 'rc-text',
    /** 默认值: '#262626' */
    textSecondary: 'rc-text-secondary',
    /** 默认值: '#737373' */
    textTertiary: 'rc-text-tertiary',
    /** 默认值: '#a3a3a3' */
    textQuaternary: 'rc-text-quaternary',
    /** 默认值: '#ffffff' */
    bg: 'rc-bg',
    /** 默认值: '#fafafa' */
    bgSecondary: 'rc-bg-secondary',
    /** 默认值: '#f5f5f5' */
    bgTertiary: 'rc-bg-tertiary',
    /** 默认值: '#e8e8e8' — 交互态填充色 1 (list selected/hover) */
    fill: 'rc-fill',
    /** 默认值: '#eeeeee' — 交互态填充色 2 (button hover) */
    fillSecondary: 'rc-fill-secondary',
    /** 默认值: '#f5f5f5' — 交互态填充色 3 (large area hover) */
    fillTertiary: 'rc-fill-tertiary',
    /** 默认值: '#fafafa' — 交互态填充色 4 (most subtle) */
    fillQuaternary: 'rc-fill-quaternary',
    /** 默认值: '#f5f5f5' */
    border: 'rc-border',
    /** 默认值: '#2563eb' */
    accent: 'rc-accent',
    /** 默认值: '#2563eb20' */
    accentLight: 'rc-accent-light',
    /** 默认值: '#2563eb' */
    link: 'rc-link',
    /** 默认值: '#404040' */
    codeText: 'rc-code-text',
    /** 默认值: '#f5f5f5' */
    codeBg: 'rc-code-bg',
    /** 默认值: '#e5e5e5' */
    hrBorder: 'rc-hr-border',
    /** 默认值: '#2563eb' */
    quoteBorder: 'rc-quote-border',
    /** 默认值: '#f5f5f5' */
    quoteBg: 'rc-quote-bg',
    /** 默认值: '#006bb7' */
    alertInfo: 'rc-alert-info',
    /** 默认值: '#cc5500' */
    alertWarning: 'rc-alert-warning',
    /** 默认值: '#11cc00' */
    alertTip: 'rc-alert-tip',
    /** 默认值: '#cc0011' */
    alertCaution: 'rc-alert-caution',
    /** 默认值: '#5500cc' */
    alertImportant: 'rc-alert-important',
  },
  spacing: {
    /** 默认值: '4px' */
    xs: 'rc-space-xs',
    /** 默认值: '8px' */
    sm: 'rc-space-sm',
    /** 默认值: '16px' */
    md: 'rc-space-md',
    /** 默认值: '24px' */
    lg: 'rc-space-lg',
    /** 默认值: '32px' */
    xl: 'rc-space-xl',
  },
  typography: {
    /** 默认值: '"PingFang SC", "Microsoft YaHei", "Segoe UI", Roboto, Helvetica, "noto sans sc", "hiragino sans gb", -apple-system, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Not Color Emoji' */
    fontFamily: 'rc-font-family',
    /** 默认值: '"PingFang SC", "Microsoft YaHei", "Segoe UI", Roboto, Helvetica, "noto sans sc", "hiragino sans gb", -apple-system, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Not Color Emoji' */
    fontFamilySans: 'rc-font-family-sans',
    /** 默认值: '"Noto Serif CJK SC", "Source Han Serif SC", "Source Han Serif", "source-han-serif-sc", "Songti SC", STSong, "华文宋体", serif' */
    fontFamilySerif: 'rc-font-family-serif',
    /** 默认值: '"SF Mono", SFMono-Regular, ui-monospace, "DejaVu Sans Mono", Menlo, Consolas, monospace' */
    fontMono: 'rc-font-mono',
    /** 默认值: '0.625em' */
    fontSize2xs: 'rc-font-size-2xs',
    /** 默认值: '0.75em' */
    fontSizeXs: 'rc-font-size-xs',
    /** 默认值: '0.8125em' */
    fontSizeSm: 'rc-font-size-sm',
    /** 默认值: '0.875em' */
    fontSizeMd: 'rc-font-size-md',
    /** 默认值: '1.25em' */
    fontSizeLg: 'rc-font-size-lg',
    /** 默认值: '16px' */
    fontSizeBase: 'rc-font-size-base',
    /** 默认值: '14px' */
    fontSizeSmall: 'rc-font-size-small',
    /** 默认值: '1.7' */
    lineHeight: 'rc-line-height',
    /** 默认值: '1.4' */
    lineHeightTight: 'rc-line-height-tight',
  },
  borderRadius: {
    /** 默认值: '4px' */
    sm: 'rc-radius-sm',
    /** 默认值: '8px' */
    md: 'rc-radius-md',
    /** 默认值: '12px' */
    lg: 'rc-radius-lg',
  },
  layout: {
    /** 默认值: '700px' */
    maxWidth: 'rc-max-width',
  },
  boxShadow: {
    /** 默认值: '0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)' */
    topBar: 'rc-shadow-top-bar',
    /** 默认值: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)' */
    modal: 'rc-shadow-modal',
    /** 默认值: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.08)' */
    menu: 'rc-shadow-menu',
  },
});

// :root default (light article)
createGlobalTheme(':root', vars, {
  color: lightArticleColors,
  ...articleLayout,
});

// Global dark fallback (for elements without a variant theme class)
const darkGlobalConfig = {
  color: darkColors,
  ...articleLayout,
  boxShadow: darkBoxShadow,
} as const;
createGlobalTheme(':root.dark', vars, darkGlobalConfig);
createGlobalTheme('[data-theme="dark"]', vars, darkGlobalConfig);

// Three variant theme classes (light colors only; dark handled by CSS override)
export const articleTheme = createTheme(vars, {
  color: lightArticleColors,
  ...articleLayout,
});

export const noteTheme = createTheme(vars, {
  color: lightArticleColors,
  ...noteLayout,
});

export const commentTheme = createTheme(vars, {
  color: lightCommentColors,
  ...commentLayout,
});

// Per-variant dark override (higher specificity for variant-specific color tweaks)
const darkColorOverrides = assignVars(vars.color, darkColors);
const darkShadowOverrides = assignVars(vars.boxShadow, darkBoxShadow);
for (const themeClass of [articleTheme, noteTheme, commentTheme]) {
  globalStyle(`.dark .${themeClass}, [data-theme="dark"] .${themeClass}`, {
    vars: { ...darkColorOverrides, ...darkShadowOverrides },
  });
  globalStyle(`.dark.${themeClass}, [data-theme="dark"].${themeClass}`, {
    vars: { ...darkColorOverrides, ...darkShadowOverrides },
  });
}
