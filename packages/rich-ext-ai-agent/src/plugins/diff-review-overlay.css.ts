import { style } from '@vanilla-extract/css';

export const overlayContainer = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 10,
});

export const diffPanel = style({
  pointerEvents: 'none',
  borderLeft: '3px solid rgb(34, 197, 94)',
  background: 'rgba(34, 197, 94, 0.04)',
});

export const diffPanelDelete = style({
  pointerEvents: 'none',
  opacity: 0.7,
});
