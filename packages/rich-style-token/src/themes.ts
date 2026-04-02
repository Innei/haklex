export const fonts = {
  fontFamilySans:
    '"PingFang SC", "Microsoft YaHei", "Segoe UI", Roboto, Helvetica, "noto sans sc", "hiragino sans gb", -apple-system, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Not Color Emoji',
  fontFamilySerif:
    '"Noto Serif CJK SC", "Source Han Serif SC", "Source Han Serif", "source-han-serif-sc", "Songti SC", STSong, "华文宋体", serif',
  fontFamilyKai:
    '"楷体", KaiTi, STKaiti, "Kaiti SC", "LXGW WenKai", "霞鹜文楷", "Noto Serif CJK SC", serif',
  fontMono:
    '"SF Mono", SFMono-Regular, ui-monospace, "DejaVu Sans Mono", Menlo, Consolas, monospace',
};

// Neutral palette (Tailwind neutral) + blue accent
export const lightArticleColors = {
  text: '#000',
  textSecondary: '#262626', // neutral-800
  textTertiary: '#737373', // neutral-500
  textQuaternary: '#a3a3a3', // neutral-400
  bg: '#ffffff',
  bgSecondary: '#fafafa', // neutral-50
  bgTertiary: '#f5f5f5', // neutral-100
  fill: '#e8e8e8', // interactive fill 1 — list item selected/hover
  fillSecondary: '#eeeeee', // interactive fill 2 — button/control hover
  fillTertiary: '#f5f5f5', // interactive fill 3 — large area hover (card, table row)
  fillQuaternary: '#fafafa', // interactive fill 4 — most subtle feedback
  border: '#f5f5f5', // neutral-100 - lighter, less prominent
  accent: '#2563eb',
  accentLight: '#2563eb20',
  link: '#2563eb',
  codeText: '#404040', // neutral-700
  codeBg: '#f5f5f5', // neutral-100
  hrBorder: '#e5e5e5', // neutral-200 - one step darker than border
  quoteBorder: '#2563eb',
  quoteBg: '#f5f5f5', // neutral-100
  alertInfo: '#006bb7',
  alertWarning: '#cc5500',
  alertTip: '#11cc00',
  alertCaution: '#cc0011',
  alertImportant: '#5500cc',
};

export const lightCommentColors = {
  ...lightArticleColors,
  quoteBorder: '#a3a3a3', // neutral-400
  quoteBg: '#fafafa', // neutral-50
};

export const darkColors = {
  text: '#fafafa',
  textSecondary: '#a3a3a3', // neutral-400
  textTertiary: '#737373', // neutral-500
  textQuaternary: '#525252', // neutral-600
  bg: '#0a0a0a', // neutral-950
  bgSecondary: '#171717', // neutral-900
  bgTertiary: '#262626', // neutral-800
  fill: '#2a2a2a', // interactive fill 1 — list item selected/hover
  fillSecondary: '#222222', // interactive fill 2 — button/control hover
  fillTertiary: '#1a1a1a', // interactive fill 3 — large area hover
  fillQuaternary: '#141414', // interactive fill 4 — most subtle feedback
  border: '#262626', // neutral-800 - lighter/less prominent
  accent: '#60a5fa',
  accentLight: '#60a5fa20',
  link: '#60a5fa',
  codeText: '#d4d4d4', // neutral-300
  codeBg: '#262626', // neutral-800
  hrBorder: '#262626', // neutral-800 - same as border
  quoteBorder: '#60a5fa',
  quoteBg: '#262626', // neutral-800
  alertInfo: '#7db9e5',
  alertWarning: '#da864a',
  alertTip: '#54da48',
  alertCaution: '#e16973',
  alertImportant: '#9966e0',
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
  lineHeight: '1.7',
  lineHeightTight: '1.4',
};

export const articleLayout = {
  layout: { maxWidth: '700px' },
  boxShadow: sharedBoxShadow,
  spacing: sharedSpacing,
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
  typography: {
    ...baseTypography,
    fontFamily: fonts.fontFamilySerif,
    lineHeight: '1.8',
  },
  borderRadius: sharedBorderRadius,
};

export const commentLayout = {
  layout: { maxWidth: 'none' },
  boxShadow: sharedBoxShadow,
  spacing: { xs: '2px', sm: '4px', md: '10px', lg: '16px', xl: '20px' },
  typography: {
    ...baseTypography,
    fontFamily: fonts.fontFamilySans,
    fontSizeBase: '14px',
    fontSizeSmall: '12px',
    lineHeight: '1.5',
    lineHeightTight: '1.3',
  },
  borderRadius: { sm: '3px', md: '6px', lg: '12px' },
};
