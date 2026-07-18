import { vars } from '@haklex/rich-style-token/styles';
import { createVar, globalStyle, style, styleVariants } from '@vanilla-extract/css';

const fallbackAccent = createVar();

export const semanticClassNames = {
  ratioContainer: 'embed-static-ratio-container',
  ratioInner: 'embed-static-ratio-inner',
  iframe: 'embed-static-iframe',
  gist: 'embed-static-gist',
  gistIframe: 'embed-static-gist__iframe',
  sourceLink: 'embed-static-source-link',
  githubFile: 'embed-static-github-file',
  githubFileCode: 'embed-static-github-file__code',
  githubFileCodeLong: 'embed-static-github-file__code--long',
  githubFileLine: 'embed-static-github-file__line',
  githubFileLineNum: 'embed-static-github-file__line-num',
  shiki: 'embed-static-shiki',
  fallback: 'embed-static-fallback',
  fallbackGeneric: 'embed-static-fallback--generic',
  fallbackTweet: 'embed-static-fallback--tweet',
  fallbackYoutube: 'embed-static-fallback--youtube',
  fallbackAppleMusic: 'embed-static-fallback--apple-music',
  fallbackSpotify: 'embed-static-fallback--spotify',
  fallbackCodesandbox: 'embed-static-fallback--codesandbox',
  fallbackBilibili: 'embed-static-fallback--bilibili',
  fallbackGithubFile: 'embed-static-fallback--github-file',
  fallbackGithubGist: 'embed-static-fallback--github-gist',
  fallbackThinking: 'embed-static-fallback--thinking',
  fallbackBadge: 'embed-static-fallback__badge',
  fallbackDot: 'embed-static-fallback__dot',
  fallbackLink: 'embed-static-fallback__link',
  tweet: 'embed-static-tweet',
  loading: 'embed-static-loading',
} as const;

export const semanticFallbackModifierClass = {
  'generic': semanticClassNames.fallbackGeneric,
  'tweet': semanticClassNames.fallbackTweet,
  'youtube': semanticClassNames.fallbackYoutube,
  'apple-music': semanticClassNames.fallbackAppleMusic,
  'spotify': semanticClassNames.fallbackSpotify,
  'codesandbox': semanticClassNames.fallbackCodesandbox,
  'bilibili': semanticClassNames.fallbackBilibili,
  'github-file': semanticClassNames.fallbackGithubFile,
  'github-gist': semanticClassNames.fallbackGithubGist,
  'thinking': semanticClassNames.fallbackThinking,
} as const;

export const ratioContainer = style({
  margin: '8px 0',
  display: 'flex',
  justifyContent: 'center',
});

export const ratioInner = style({
  position: 'relative',
  height: 0,
  width: '100%',
});

export const iframe = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  border: 'none',
  borderRadius: 8,
});

export const gist = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const gistIframe = style({
  width: '100%',
  height: 300,
  border: 'none',
  overflow: 'auto',
});

export const sourceLink = style({
  display: 'inline-flex',
  alignItems: 'flex-start',
  gap: 8,
  marginTop: 8,
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeMd,
  lineHeight: 1.4,
  textDecoration: 'none',
  wordBreak: 'break-all',
  selectors: {
    '&:hover': {
      color: vars.color.text,
    },
  },
});

globalStyle(`${sourceLink} svg`, {
  flexShrink: 0,
  marginTop: 2,
});

export const githubFile = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
});

export const githubFileCode = style({
  width: '100%',
  overflow: 'auto',
});

export const githubFileCodeLong = style({
  maxHeight: '50vh',
});

globalStyle(`${githubFileCode} pre`, {
  margin: 0,
  padding: 16,
  background: vars.color.codeBg,
  borderRadius: 8,
  fontSize: vars.typography.fontSizeSm,
  lineHeight: 1.5,
  fontFamily: vars.typography.fontMono,
  color: vars.color.text,
});

export const githubFileLine = style({
  display: 'block',
});

export const githubFileLineNum = style({
  display: 'inline-block',
  width: '4ch',
  textAlign: 'right',
  marginRight: 16,
  color: `color-mix(in srgb, ${vars.color.textSecondary} 60%, transparent)`,
  userSelect: 'none',
});

export const shiki = style({
  counterReset: 'shiki-line var(--start-line, 0)',
});

globalStyle(`${shiki} pre`, {
  margin: 0,
  padding: 16,
  borderRadius: 8,
  fontSize: vars.typography.fontSizeSm,
  lineHeight: 1.5,
  fontFamily: vars.typography.fontMono,
  overflowX: 'auto',
});

globalStyle(`${shiki} code`, {
  fontFamily: 'inherit',
  display: 'flex',
  flexDirection: 'column',
});

globalStyle(`${shiki} .line`, {
  display: 'flex',
  lineHeight: 1.5,
});

globalStyle(`${shiki} .line::before`, {
  counterIncrement: 'shiki-line',
  content: 'counter(shiki-line)',
  flexShrink: 0,
  width: '4ch',
  textAlign: 'right',
  marginRight: 16,
  color: `color-mix(in srgb, ${vars.color.textSecondary} 60%, transparent)`,
  userSelect: 'none',
});

export const fallback = style({
  vars: { [fallbackAccent]: '115, 115, 115' },
  display: 'flex',
  alignItems: 'center',
  gap: 0,
  padding: '0 14px',
  height: 48,
  border: `1px solid color-mix(in srgb, rgb(${fallbackAccent}) 25%, transparent)`,
  borderRadius: 12,
  backgroundColor: `color-mix(in srgb, rgb(${fallbackAccent}) 8%, transparent)`,
  fontFamily: vars.typography.fontFamilySans,
  fontSize: vars.typography.fontSizeMd,
  margin: '8px 0',
});

export const fallbackType = styleVariants({
  'generic': {},
  'tweet': { vars: { [fallbackAccent]: '29, 155, 240' } },
  'youtube': { vars: { [fallbackAccent]: '255, 0, 0' } },
  'apple-music': { vars: { [fallbackAccent]: '250, 36, 60' } },
  'spotify': { vars: { [fallbackAccent]: '29, 185, 84' } },
  'codesandbox': { vars: { [fallbackAccent]: '163, 163, 163' } },
  'bilibili': { vars: { [fallbackAccent]: '0, 161, 214' } },
  'github-file': { vars: { [fallbackAccent]: '110, 84, 148' } },
  'github-gist': { vars: { [fallbackAccent]: '110, 84, 148' } },
  'thinking': { vars: { [fallbackAccent]: '139, 92, 246' } },
});

export const fallbackBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  flexShrink: 0,
  fontWeight: 500,
  fontSize: vars.typography.fontSizeMd,
  color: vars.color.textSecondary,
  whiteSpace: 'nowrap',
  userSelect: 'none',
  paddingRight: 14,
});

export const fallbackDot = style({
  width: 8,
  height: 8,
  borderRadius: '50%',
  flexShrink: 0,
  backgroundColor: `rgb(${fallbackAccent})`,
});

export const fallbackLink = style({
  flex: 1,
  minWidth: 0,
  fontSize: vars.typography.fontSizeMd,
  fontFamily: vars.typography.fontMono,
  color: vars.color.textSecondary,
  textDecoration: 'none',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': {
      color: vars.color.text,
      textDecoration: 'underline',
    },
  },
});

export const tweet = style({
  display: 'flex',
  justifyContent: 'center',
  margin: '8px 0',
  width: '100%',
});

export const loading = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 200,
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeMd,
});
