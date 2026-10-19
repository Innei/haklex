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

// Neutral palette (Tailwind neutral) + blue accent
export const lightArticleColors = {
  text: '#171717', // neutral-900
  textSecondary: '#404040', // neutral-700
  textTertiary: '#737373', // neutral-500
  textQuaternary: '#a3a3a3', // neutral-400
  bg: '#ffffff',
  bgSecondary: '#fafafa', // neutral-50
  bgTertiary: '#f5f5f5', // neutral-100
  fill: '#e8e8e8', // interactive fill 1 — list item selected/hover
  fillSecondary: '#eeeeee', // interactive fill 2 — button/control hover
  fillTertiary: '#f5f5f5', // interactive fill 3 — large area hover (card, table row)
  fillQuaternary: '#fafafa', // interactive fill 4 — most subtle feedback
  border: '#e8e8e8',
  borderSubtle: '#f0f0f0',
  accent: '#2563eb',
  accentLight: 'color-mix(in oklab, var(--rc-accent) 12%, transparent)',
  link: '#2563eb',
  codeText: '#404040', // neutral-700
  codeBg: '#f5f5f5', // neutral-100
  codeHeaderBg: '#f0f0f0',
  hrBorder: '#e8e8e8',
  quoteBorder: 'color-mix(in oklab, var(--rc-text) 18%, transparent)',
  quoteBg: '#f5f5f5', // neutral-100
  alertInfo: '#2f6db5',
  alertWarning: '#b7791f',
  alertTip: '#2f855a',
  alertCaution: '#c53030',
  alertImportant: '#6b46c1',
};

export const lightCommentColors = {
  ...lightArticleColors,
  quoteBg: '#fafafa', // neutral-50
};

export const darkColors = {
  text: '#ededed',
  textSecondary: '#c2c2c2',
  textTertiary: '#8a8a8a',
  textQuaternary: '#525252', // neutral-600
  bg: '#0a0a0a', // neutral-950
  bgSecondary: '#171717', // neutral-900
  bgTertiary: '#262626', // neutral-800
  fill: '#2a2a2a', // interactive fill 1 — list item selected/hover
  fillSecondary: '#222222', // interactive fill 2 — button/control hover
  fillTertiary: '#1a1a1a', // interactive fill 3 — large area hover
  fillQuaternary: '#141414', // interactive fill 4 — most subtle feedback
  border: '#2e2e2e',
  borderSubtle: '#1f1f1f',
  accent: '#60a5fa',
  accentLight: 'color-mix(in oklab, var(--rc-accent) 12%, transparent)',
  link: '#60a5fa',
  codeText: '#d4d4d4', // neutral-300
  codeBg: '#1a1a1a',
  codeHeaderBg: '#212121',
  hrBorder: '#2e2e2e',
  quoteBorder: 'color-mix(in oklab, var(--rc-text) 22%, transparent)',
  quoteBg: '#262626', // neutral-800
  alertInfo: '#7aa7e0',
  alertWarning: '#e0a458',
  alertTip: '#6cbf8f',
  alertCaution: '#ef7d7d',
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
  topBar: '0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
  modal: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  menu: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.08)',
};
export const darkBoxShadow = {
  topBar: '0 8px 30px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.3)',
  modal: '0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -4px rgba(0,0,0,0.35)',
  menu: '0 1px 4px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.4)',
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
