export const fonts = {
  fontFamilySans:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", Roboto, Helvetica, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"',
  fontFamilySerif:
    '"Noto Serif CJK SC", "Source Han Serif SC", "Source Han Serif", "source-han-serif-sc", "Songti SC", STSong, "华文宋体", serif',
  fontFamilyKai:
    '"楷体", KaiTi, STKaiti, "Kaiti SC", "LXGW WenKai", "霞鹜文楷", "Noto Serif CJK SC", serif',
  fontMono:
    '"SF Mono", SFMono-Regular, ui-monospace, "DejaVu Sans Mono", Menlo, Consolas, "PingFang SC", "Noto Sans SC", monospace',
};

export const lightArticleColors = {
  text: '#171717',
  textSecondary: '#404040',
  textTertiary: '#737373',
  textQuaternary: '#a3a3a3',
  bg: '#ffffff',
  bgSecondary: '#fafafa',
  bgTertiary: '#f5f5f5',
  fill: 'rgb(0 0 0 / 0.07)',
  fillSecondary: 'rgb(0 0 0 / 0.045)',
  fillTertiary: 'rgb(0 0 0 / 0.03)',
  fillQuaternary: 'rgb(0 0 0 / 0.02)',
  border: '#e5e5e5',
  borderSubtle: '#f0f0f0',
  ring: 'rgb(0 0 0 / 0.08)',
  accent: '#2563eb',
  accentLight: 'color-mix(in oklab, var(--rc-accent) 10%, transparent)',
  link: '#2563eb',
  codeText: '#171717',
  codeBg: '#f5f5f5',
  codeHeaderBg: '#f5f5f5',
  hrBorder: '#e5e5e5',
  quoteBorder: '#e5e5e5',
  quoteBg: '#f5f5f5',
  alertInfo: '#2563eb',
  alertWarning: '#b45309',
  alertTip: '#15803d',
  alertCaution: '#dc2626',
  alertImportant: '#7c3aed',
};

export const lightCommentColors = {
  ...lightArticleColors,
  quoteBg: '#fafafa',
};

export const darkColors = {
  text: '#ededed',
  textSecondary: '#c4c4c4',
  textTertiary: '#8f8f8f',
  textQuaternary: '#5c5c5c',
  bg: '#0a0a0a',
  bgSecondary: '#121212',
  bgTertiary: '#1a1a1a',
  fill: 'rgb(255 255 255 / 0.09)',
  fillSecondary: 'rgb(255 255 255 / 0.06)',
  fillTertiary: 'rgb(255 255 255 / 0.04)',
  fillQuaternary: 'rgb(255 255 255 / 0.025)',
  border: '#262626',
  borderSubtle: '#1c1c1c',
  ring: 'rgb(255 255 255 / 0.1)',
  accent: '#60a5fa',
  accentLight: 'color-mix(in oklab, var(--rc-accent) 16%, transparent)',
  link: '#60a5fa',
  codeText: '#ededed',
  codeBg: '#1a1a1a',
  codeHeaderBg: '#1a1a1a',
  hrBorder: '#262626',
  quoteBorder: '#262626',
  quoteBg: '#1a1a1a',
  alertInfo: '#60a5fa',
  alertWarning: '#fbbf24',
  alertTip: '#4ade80',
  alertCaution: '#f87171',
  alertImportant: '#a78bfa',
};

// Shared layout tokens (merge overrides per layout)
const sharedSpacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};
const sharedBorderRadius = { sm: '4px', md: '8px', lg: '12px' };
const sharedBoxShadow = {
  xs: '0 0 0 1px var(--rc-ring), 0 1px 2px rgb(0 0 0 / 0.05)',
  topBar:
    '0 0 0 1px var(--rc-ring), 0 4px 12px rgb(0 0 0 / 0.06), 0 12px 32px -8px rgb(0 0 0 / 0.12)',
  modal: '0 0 0 1px rgb(0 0 0 / 0.06), 0 16px 48px -12px rgb(0 0 0 / 0.25)',
  menu: '0 0 0 1px var(--rc-ring), 0 4px 12px rgb(0 0 0 / 0.06), 0 12px 32px -8px rgb(0 0 0 / 0.12)',
};
export const darkBoxShadow = {
  xs: '0 0 0 1px var(--rc-ring), 0 1px 2px rgb(0 0 0 / 0.4)',
  topBar:
    '0 0 0 1px var(--rc-ring), 0 8px 24px rgb(0 0 0 / 0.5), 0 16px 40px -8px rgb(0 0 0 / 0.6)',
  modal: '0 0 0 1px rgb(255 255 255 / 0.08), 0 16px 48px -12px rgb(0 0 0 / 0.7)',
  menu: '0 0 0 1px var(--rc-ring), 0 8px 24px rgb(0 0 0 / 0.5), 0 16px 40px -8px rgb(0 0 0 / 0.6)',
};
const baseTypography = {
  fontFamilySans: fonts.fontFamilySans,
  fontFamilySerif: fonts.fontFamilySerif,
  fontFamilyKai: fonts.fontFamilyKai,
  fontMono: fonts.fontMono,
  fontSize2xs: '0.625em',
  fontSizeXs: '0.75em',
  fontSizeSm: '0.8125em',
  fontSizeMd: '0.875em',
  fontSizeLg: '1.25em',
  fontSizeBase: '16px',
  fontSizeSmall: '14px',
  fontSizeCode: '0.8125em',
  fontSizeCaption: '0.8125em',
  lineHeight: '1.75',
  lineHeightTight: '1.35',
  lineHeightCompact: '1.6',
  lineHeightCode: '1.7',
};
const proseFlow = { paragraph: '1.25em', list: '0.375em', block: '2em', heading: '2em' };
const compactFlow = { paragraph: '0.6em', list: '0.25em', block: '1em', heading: '1em' };

export const articleLayout = {
  layout: { maxWidth: '700px' },
  boxShadow: sharedBoxShadow,
  spacing: sharedSpacing,
  flow: proseFlow,
  typography: {
    ...baseTypography,
    fontFamily: fonts.fontFamilySans,
  },
  borderRadius: sharedBorderRadius,
};

export const noteLayout = {
  layout: { maxWidth: '700px' },
  boxShadow: sharedBoxShadow,
  spacing: sharedSpacing,
  flow: { ...proseFlow, paragraph: '0.5em' },
  typography: {
    ...baseTypography,
    fontFamily: fonts.fontFamilySerif,
    lineHeight: '1.85',
  },
  borderRadius: sharedBorderRadius,
};

export const commentLayout = {
  layout: { maxWidth: 'none' },
  boxShadow: sharedBoxShadow,
  spacing: { xs: '2px', sm: '4px', md: '10px', lg: '16px', xl: '20px' },
  flow: compactFlow,
  typography: {
    ...baseTypography,
    fontFamily: fonts.fontFamilySans,
    fontSizeBase: '14px',
    fontSizeSmall: '12px',
    fontSizeCode: '0.9286em',
    fontSizeCaption: '0.9286em',
    lineHeight: '1.6',
    lineHeightTight: '1.3',
  },
  borderRadius: { sm: '3px', md: '6px', lg: '12px' },
};

export const chatLayout = {
  layout: { maxWidth: 'none' },
  boxShadow: sharedBoxShadow,
  spacing: sharedSpacing,
  flow: { ...compactFlow, paragraph: '0.75em' },
  typography: {
    ...baseTypography,
    fontFamily: fonts.fontFamilySans,
    fontSizeBase: '15px',
    fontSizeSmall: '13px',
    fontSizeCode: '0.8667em',
    fontSizeCaption: '0.8667em',
    lineHeight: '1.65',
    lineHeightTight: '1.3',
  },
  borderRadius: sharedBorderRadius,
};
