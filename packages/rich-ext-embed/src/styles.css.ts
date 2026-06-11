import { vars } from '@haklex/rich-style-token/styles';
import { createVar, style, styleVariants } from '@vanilla-extract/css';

const embedAccent = createVar();

export const semanticClassNames = {
  wrapper: 'rich-embed-link-wrapper',
  embed: 'rich-embed',
  embedGeneric: 'rich-embed--generic',
  embedTweet: 'rich-embed--tweet',
  embedYoutube: 'rich-embed--youtube',
  embedCodesandbox: 'rich-embed--codesandbox',
  embedBilibili: 'rich-embed--bilibili',
  embedGithubFile: 'rich-embed--github-file',
  embedGithubGist: 'rich-embed--github-gist',
  embedThinking: 'rich-embed--thinking',
  badge: 'rich-embed__badge',
  dot: 'rich-embed__dot',
  divider: 'rich-embed__divider',
  input: 'rich-embed__input',
} as const;

export const semanticEmbedModifierClass = {
  'generic': semanticClassNames.embedGeneric,
  'tweet': semanticClassNames.embedTweet,
  'youtube': semanticClassNames.embedYoutube,
  'codesandbox': semanticClassNames.embedCodesandbox,
  'bilibili': semanticClassNames.embedBilibili,
  'github-file': semanticClassNames.embedGithubFile,
  'github-gist': semanticClassNames.embedGithubGist,
  'thinking': semanticClassNames.embedThinking,
} as const;

export const wrapper = style({
  margin: '8px 0',
});

export const embed = style({
  vars: { [embedAccent]: '115, 115, 115' },
  display: 'flex',
  alignItems: 'center',
  gap: 0,
  padding: '0 14px',
  height: 48,
  border: `1px solid color-mix(in srgb, rgb(${embedAccent}) 25%, transparent)`,
  borderRadius: 12,
  backgroundColor: `color-mix(in srgb, rgb(${embedAccent}) 12%, transparent)`,
  fontFamily: vars.typography.fontFamilySans,
  fontSize: vars.typography.fontSizeMd,
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  selectors: {
    '&:focus-within': {
      borderColor: `color-mix(in srgb, rgb(${embedAccent}) 50%, transparent)`,
    },
  },
});

export const embedType = styleVariants({
  'generic': {},
  'tweet': { vars: { [embedAccent]: '29, 155, 240' } },
  'youtube': { vars: { [embedAccent]: '255, 0, 0' } },
  'codesandbox': { vars: { [embedAccent]: '163, 163, 163' } },
  'bilibili': { vars: { [embedAccent]: '0, 161, 214' } },
  'github-file': { vars: { [embedAccent]: '110, 84, 148' } },
  'github-gist': { vars: { [embedAccent]: '110, 84, 148' } },
  'thinking': { vars: { [embedAccent]: '139, 92, 246' } },
});

export const badge = style({
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
  fontFamily: vars.typography.fontFamilySans,
});

export const dot = style({
  width: 8,
  height: 8,
  borderRadius: '50%',
  flexShrink: 0,
  backgroundColor: `rgb(${embedAccent})`,
});

export const divider = style({
  width: 1,
  height: 20,
  backgroundColor: vars.color.border,
  flexShrink: 0,
});

export const input = style({
  flex: 1,
  minWidth: 0,
  height: '100%',
  fontSize: vars.typography.fontSizeMd,
  fontFamily: vars.typography.fontMono,
  color: vars.color.text,
  background: 'transparent',
  border: 'none',
  padding: '0 14px',
  outline: 'none',
  selectors: {
    '&::placeholder': {
      color: `color-mix(in srgb, ${vars.color.textSecondary} 60%, transparent)`,
    },
  },
});
