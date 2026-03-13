import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const katexClassNames = {
  inline: 'rich-katex-inline',
  block: 'rich-katex-block',
  fallback: 'rich-katex-fallback',
} as const;

export const inline = style({
  display: 'inline',
  padding: '0 2px',
  verticalAlign: 'middle',
});

export const block = style({
  display: 'block',
  textAlign: 'center',
  padding: `${vars.spacing.md} 0`,
  overflowX: 'auto',
  margin: `${vars.spacing.md} 0`,
});

export const fallback = style({
  fontFamily: vars.typography.fontMono,
  fontSize: '0.9em',
  color: vars.color.codeText,
  backgroundColor: vars.color.codeBg,
  padding: '2px 6px',
  borderRadius: vars.borderRadius.sm,
});

export const katexStyles = {
  inline,
  block,
  fallback,
} as const;
