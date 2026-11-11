import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const textEditor = style({
  position: 'absolute',
  zIndex: 2,
  margin: 0,
  padding: 0,
  border: 'none',
  outline: 'none',
  resize: 'none',
  overflow: 'hidden',
  background: 'transparent',
  whiteSpace: 'pre',
  transformOrigin: 'center',
  pointerEvents: 'auto',
  userSelect: 'text',
});

export const frameNameEditor = style({
  position: 'absolute',
  zIndex: 2,
  minWidth: 80,
  padding: '0 4px',
  border: `1px solid ${vars.color.accent}`,
  borderRadius: 4,
  outline: 'none',
  font: 'inherit',
  fontSize: 13,
  color: vars.color.text,
  background: vars.color.bg,
  pointerEvents: 'auto',
});
