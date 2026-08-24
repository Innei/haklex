import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const dropCaret = style({
  position: 'fixed',
  width: '2px',
  borderRadius: '1px',
  background: vars.color.text,
  pointerEvents: 'none',
  zIndex: 40,
});

export const draggingSource = style({
  opacity: 0.4,
});
