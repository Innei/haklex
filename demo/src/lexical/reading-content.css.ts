import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const readingContent = style({
  width: '100%',
  marginInline: 'auto',
  padding: `12px ${vars.spacing.md}`,
});
