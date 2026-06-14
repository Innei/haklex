import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const contentWrapper = style({
  position: 'relative',
  maxWidth: vars.layout.maxWidth,
  margin: '0 auto',
  flex: 1,
  minHeight: 0,
  width: '100%',
});

export const content = style({
  // flow-root: contain floated images so they cannot overflow
  // past the editable area into the actions footer
  display: 'flow-root',
  outline: 'none',
  minHeight: '100px',
  width: '100%',
  maxWidth: '100%',
  padding: `var(--ce-padding-top, 12px) ${vars.spacing.md} 12px ${vars.spacing.md}`,
});

export const placeholder = style({
  position: 'absolute',
  top: 'var(--ce-padding-top, 12px)',
  left: vars.spacing.md,
  color: vars.color.textSecondary,
  pointerEvents: 'none',
  userSelect: 'none',
});
