import { chromeRadius, vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const menuItemDestructive = style({
  color: vars.color.alertCaution,
  selectors: {
    '&[data-highlighted]': {
      color: vars.color.alertCaution,
      backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 8%, transparent)`,
    },
  },
});

export const resizeHandle = style({
  'position': 'fixed',
  'zIndex': 20,
  'opacity': 0,
  'transition': 'opacity 0.15s, background-color 0.15s',
  ':hover': {
    opacity: 1,
  },
});

export const resizeHandleActive = style({
  opacity: 1,
});

export const rowColHandle = style({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  position: 'absolute',
  zIndex: 30,
  opacity: 0,
  pointerEvents: 'none',
  transition: 'opacity 0.15s',
});

export const rowColHandleVisible = style({
  opacity: 1,
  pointerEvents: 'auto',
});

export const handleBtn = style({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 16,
  'height': 16,
  'borderRadius': chromeRadius.sm,
  'border': 'none',
  'background': 'transparent',
  'color': vars.color.textQuaternary,
  'cursor': 'pointer',
  'padding': 0,
  'transition': 'background-color 120ms ease-out, color 120ms ease-out',
  ':hover': {
    background: vars.color.fillSecondary,
    color: vars.color.textSecondary,
  },
});
