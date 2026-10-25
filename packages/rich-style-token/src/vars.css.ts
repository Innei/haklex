import {
  assignVars,
  createGlobalTheme,
  createGlobalThemeContract,
  createTheme,
  globalStyle,
} from '@vanilla-extract/css';

import { withHostFallback } from './host';
import {
  articleLayout,
  chatLayout,
  commentLayout,
  darkBoxShadow,
  darkColors,
  lightArticleColors,
  lightCommentColors,
  noteLayout,
} from './themes';

export const vars = createGlobalThemeContract({
  color: {
    /** 默认值: '#171717' */
    text: 'rc-text',
    /** 默认值: '#404040' */
    textSecondary: 'rc-text-secondary',
    /** 默认值: '#737373' */
    textTertiary: 'rc-text-tertiary',
    /** 默认值: '#a3a3a3' — 仅用于图标、占位、禁用态，不做可读文字 */
    textQuaternary: 'rc-text-quaternary',
    /** 默认值: '#ffffff' */
    bg: 'rc-bg',
    /** 默认值: '#fafafa' */
    bgSecondary: 'rc-bg-secondary',
    /** 默认值: '#f5f5f5' */
    bgTertiary: 'rc-bg-tertiary',
    /** 默认值: 'rgb(0 0 0 / 0.07)' — 交互态填充色 1 (list selected/hover) */
    fill: 'rc-fill',
    /** 默认值: 'rgb(0 0 0 / 0.045)' — 交互态填充色 2 (button hover) */
    fillSecondary: 'rc-fill-secondary',
    /** 默认值: 'rgb(0 0 0 / 0.03)' — 交互态填充色 3 (large area hover) */
    fillTertiary: 'rc-fill-tertiary',
    /** 默认值: 'rgb(0 0 0 / 0.02)' — 交互态填充色 4 (most subtle) */
    fillQuaternary: 'rc-fill-quaternary',
    /** 默认值: '#e5e5e5' */
    border: 'rc-border',
    /** 默认值: '#f0f0f0' — 最弱的分隔线（表格行线等） */
    borderSubtle: 'rc-border-subtle',
    /** 默认值: 'rgb(0 0 0 / 0.08)' — 弹层外轮廓 */
    ring: 'rc-ring',
    /** 默认值: '#2563eb' */
    accent: 'rc-accent',
    /** 默认值: 'color-mix(in oklab, var(--rc-accent) 10%, transparent)' */
    accentLight: 'rc-accent-light',
    /** 默认值: '#2563eb' */
    link: 'rc-link',
    /** 默认值: '#171717' */
    codeText: 'rc-code-text',
    /** 默认值: '#f5f5f5' */
    codeBg: 'rc-code-bg',
    /** 默认值: '#f5f5f5' */
    codeHeaderBg: 'rc-code-header-bg',
    /** 默认值: '#e5e5e5' */
    hrBorder: 'rc-hr-border',
    /** 默认值: '#e5e5e5' */
    quoteBorder: 'rc-quote-border',
    /** 默认值: '#f5f5f5' */
    quoteBg: 'rc-quote-bg',
    /** 默认值: '#2563eb' */
    alertInfo: 'rc-alert-info',
    /** 默认值: '#b45309' */
    alertWarning: 'rc-alert-warning',
    /** 默认值: '#15803d' */
    alertTip: 'rc-alert-tip',
    /** 默认值: '#dc2626' */
    alertCaution: 'rc-alert-caution',
    /** 默认值: '#7c3aed' */
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
  flow: {
    /** 默认值: '1.25em' — 段落之间 */
    paragraph: 'rc-flow-paragraph',
    /** 默认值: '0.375em' — 列表项之间 */
    list: 'rc-flow-list',
    /** 默认值: '2em' — 代码、表格、图片等块级节点上下 */
    block: 'rc-flow-block',
    /** 默认值: '2em' — 标题上方（按正文字号计） */
    heading: 'rc-flow-heading',
  },
  typography: {
    /** 默认值: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", Roboto, Helvetica, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"' */
    fontFamily: 'rc-font-family',
    /** 默认值: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", Roboto, Helvetica, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"' */
    fontFamilySans: 'rc-font-family-sans',
    /** 默认值: '"Noto Serif CJK SC", "Source Han Serif SC", "Source Han Serif", "source-han-serif-sc", "Songti SC", STSong, "华文宋体", serif' */
    fontFamilySerif: 'rc-font-family-serif',
    /** 默认值: '"楷体", KaiTi, STKaiti, "Kaiti SC", "LXGW WenKai", "霞鹜文楷", "Noto Serif CJK SC", serif' */
    fontFamilyKai: 'rc-font-family-kai',
    /** 默认值: '"SF Mono", SFMono-Regular, ui-monospace, "DejaVu Sans Mono", Menlo, Consolas, "PingFang SC", "Noto Sans SC", monospace' */
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
    /** 默认值: '0.8125em' — 代码块正文 */
    fontSizeCode: 'rc-font-size-code',
    /** 默认值: '0.8125em' — 图注、表头等说明文字 */
    fontSizeCaption: 'rc-font-size-caption',
    /** 默认值: '1.75' */
    lineHeight: 'rc-line-height',
    /** 默认值: '1.35' */
    lineHeightTight: 'rc-line-height-tight',
    /** 默认值: '1.6' — 表格、评论、对话 */
    lineHeightCompact: 'rc-line-height-compact',
    /** 默认值: '1.7' */
    lineHeightCode: 'rc-line-height-code',
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
    /** 默认值: '0 0 0 1px var(--rc-ring), 0 1px 2px rgb(0 0 0 / 0.05)' — 分段控件滑块、输入框 */
    xs: 'rc-shadow-xs',
    /** 默认值: '0 0 0 1px var(--rc-ring), 0 4px 12px rgb(0 0 0 / 0.06), 0 12px 32px -8px rgb(0 0 0 / 0.12)' */
    topBar: 'rc-shadow-top-bar',
    /** 默认值: '0 0 0 1px rgb(0 0 0 / 0.06), 0 16px 48px -12px rgb(0 0 0 / 0.25)' */
    modal: 'rc-shadow-modal',
    /** 默认值: '0 0 0 1px var(--rc-ring), 0 4px 12px rgb(0 0 0 / 0.06), 0 12px 32px -8px rgb(0 0 0 / 0.12)' */
    menu: 'rc-shadow-menu',
  },
});

const hostColors = (colors: typeof lightArticleColors) => withHostFallback(vars.color, colors);

const hostLayout = <L extends { typography: Record<string, string> }>(layout: L): L => ({
  ...layout,
  typography: {
    ...layout.typography,
    ...withHostFallback(vars.typography, {
      fontFamily: layout.typography.fontFamily,
      fontFamilySans: layout.typography.fontFamilySans,
      fontFamilySerif: layout.typography.fontFamilySerif,
      fontFamilyKai: layout.typography.fontFamilyKai,
      fontMono: layout.typography.fontMono,
    }),
  },
});

// :root default (light article)
createGlobalTheme(':root', vars, {
  color: hostColors(lightArticleColors),
  ...hostLayout(articleLayout),
});

// Global dark fallback: colors/shadows ONLY. Must not redefine typography —
// `[data-theme="dark"]` lands on the same element as the variant theme class
// with equal specificity, so a full createGlobalTheme here would let CSS
// bundle order decide whether note's serif font survives in dark mode.
const darkColorVars = assignVars(vars.color, hostColors(darkColors));
const darkShadowVars = assignVars(vars.boxShadow, darkBoxShadow);
globalStyle(':root.dark, [data-theme="dark"]', {
  vars: { ...darkColorVars, ...darkShadowVars },
});

// Three variant theme classes (light colors only; dark handled by CSS override)
export const articleTheme = createTheme(vars, {
  color: hostColors(lightArticleColors),
  ...hostLayout(articleLayout),
});

export const noteTheme = createTheme(vars, {
  color: hostColors(lightArticleColors),
  ...hostLayout(noteLayout),
});

export const commentTheme = createTheme(vars, {
  color: hostColors(lightCommentColors),
  ...hostLayout(commentLayout),
});

export const chatTheme = createTheme(vars, {
  color: hostColors(lightCommentColors),
  ...hostLayout(chatLayout),
});

// Per-variant dark override (higher specificity for variant-specific color tweaks)
for (const themeClass of [articleTheme, noteTheme, commentTheme, chatTheme]) {
  globalStyle(`.dark .${themeClass}, [data-theme="dark"] .${themeClass}`, {
    vars: { ...darkColorVars, ...darkShadowVars },
  });
  globalStyle(`.dark.${themeClass}, [data-theme="dark"].${themeClass}`, {
    vars: { ...darkColorVars, ...darkShadowVars },
  });
}
