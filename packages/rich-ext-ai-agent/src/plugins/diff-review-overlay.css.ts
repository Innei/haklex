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

export const deleteOverlay = style({
  position: 'absolute',
  left: 0,
  right: 0,
  background: 'rgba(239, 68, 68, 0.08)',
  borderLeft: '3px solid rgb(239, 68, 68)',
  pointerEvents: 'none',
});

export const insertMarker = style({
  position: 'absolute',
  left: 0,
  right: 0,
  background: 'rgb(34, 197, 94)',
  pointerEvents: 'none',
  borderRadius: 1,
});

export const replaceOverlay = style({
  position: 'absolute',
  left: 0,
  right: 0,
  background: 'rgba(239, 68, 68, 0.08)',
  borderLeft: '3px solid rgb(239, 68, 68)',
  pointerEvents: 'none',
});

export const diffPanel = style({
  position: 'absolute',
  left: 0,
  right: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
  borderLeft: '3px solid rgb(34, 197, 94)',
  background: 'rgba(34, 197, 94, 0.04)',
});

export const diffPanelDelete = style({
  position: 'absolute',
  left: 0,
  right: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
});
