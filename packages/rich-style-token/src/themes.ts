export const fonts = {
  fontFamilySans:
    '"PingFang SC", "Microsoft YaHei", "Segoe UI", Roboto, Helvetica, "noto sans sc", "hiragino sans gb", -apple-system, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Not Color Emoji',
  fontFamilySerif:
    '"Noto Serif CJK SC", "Source Han Serif SC", "Source Han Serif", "source-han-serif-sc", "Songti SC", STSong, "华文宋体", serif',
  fontMono:
    '"SF Mono", SFMono-Regular, ui-monospace, "DejaVu Sans Mono", Menlo, Consolas, monospace',
};

// Zinc palette (aligned with web app) + blue accent
export const lightArticleColors = {
  text: '#000',
  textSecondary: '#27272a', // zinc-800
  textTertiary: '#71717a', // zinc-500
  textQuaternary: '#a1a1aa', // zinc-400
  bg: '#ffffff',
  bgSecondary: '#fafafa', // zinc-50
  bgTertiary: '#f4f4f5', // zinc-100
  fill: '#e8e8ec', // interactive fill 1 — list item selected/hover
  fillSecondary: '#eeeeef', // interactive fill 2 — button/control hover
  fillTertiary: '#f4f4f6', // interactive fill 3 — large area hover (card, table row)
  fillQuaternary: '#f9f9fa', // interactive fill 4 — most subtle feedback
  border: '#f4f4f5', // zinc-100 - lighter, less prominent
  accent: '#2563eb',
  accentLight: '#2563eb20',
  link: '#2563eb',
  codeText: '#3f3f46', // zinc-700
  codeBg: '#f4f4f5', // zinc-100
  hrBorder: '#e4e4e7', // zinc-200 - one step darker than border
  quoteBorder: '#2563eb',
  quoteBg: '#eff6ff',
  alertInfo: '#006bb7',
  alertWarning: '#cc5500',
  alertTip: '#11cc00',
  alertCaution: '#cc0011',
  alertImportant: '#5500cc',
};

export const lightCommentColors = {
  ...lightArticleColors,
  quoteBorder: '#a1a1aa', // zinc-400
  quoteBg: '#fafafa', // zinc-50
};

export const darkColors = {
  text: '#fafafa',
  textSecondary: '#a1a1aa', // zinc-400
  textTertiary: '#71717a', // zinc-500
  textQuaternary: '#52525b', // zinc-600
  bg: '#09090b', // zinc-950
  bgSecondary: '#18181b', // zinc-900
  bgTertiary: '#27272a', // zinc-800
  fill: '#2a2a2f', // interactive fill 1 — list item selected/hover
  fillSecondary: '#222226', // interactive fill 2 — button/control hover
  fillTertiary: '#1b1b1f', // interactive fill 3 — large area hover
  fillQuaternary: '#131316', // interactive fill 4 — most subtle feedback
  border: '#27272a', // zinc-800 - lighter/less prominent
  accent: '#60a5fa',
  accentLight: '#60a5fa20',
  link: '#60a5fa',
  codeText: '#e4e4e7', // zinc-200
  codeBg: '#27272a', // zinc-800
  hrBorder: '#27272a', // zinc-800 - same as border
  quoteBorder: '#60a5fa',
  quoteBg: '#1e3a5f',
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
