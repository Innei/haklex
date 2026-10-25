import { chromeMotion, chromeRadius, focusRing, vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const handleContainer = style({
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  zIndex: 30,
  opacity: 0,
  pointerEvents: 'none',
  transition: `opacity ${chromeMotion.state} ease`,
});

export const handleContainerVisible = style({
  opacity: 1,
  pointerEvents: 'auto',
});

export const grip = style({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 20,
  'height': 24,
  'borderRadius': chromeRadius.sm,
  'border': 'none',
  'background': 'transparent',
  'color': vars.color.textQuaternary,
  'cursor': 'grab',
  'padding': 0,
  'outline': 'none',
  'transition': `background-color ${chromeMotion.state} ease, color ${chromeMotion.state} ease`,
  ':hover': {
    background: vars.color.fillSecondary,
    color: vars.color.textSecondary,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
  'selectors': {
    '&[data-popup-open]': {
      background: vars.color.fill,
      color: vars.color.text,
    },
  },
});

export const gapLine = style({
  position: 'absolute',
  zIndex: 30,
  height: 1,
  backgroundColor: vars.color.textQuaternary,
  pointerEvents: 'none',
});

export const gapPlus = style({
  'position': 'absolute',
  'zIndex': 31,
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 20,
  'height': 20,
  'padding': 0,
  'border': 'none',
  'borderRadius': '6px',
  'backgroundColor': vars.color.bgElevated,
  'boxShadow': vars.boxShadow.xs,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'outline': 'none',
  'transform': 'translateY(-50%)',
  'transition': `color ${chromeMotion.state} ease`,
  ':hover': {
    color: vars.color.text,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
});

export const draggingBlock = style({
  opacity: 0.35,
});

export const dragPreview = style({
  position: 'fixed',
  top: -10000,
  left: -10000,
  zIndex: 40,
  pointerEvents: 'none',
  margin: 0,
  boxSizing: 'border-box',
  opacity: 0.9,
  backgroundColor: vars.color.bgElevated,
  border: 'none',
  borderRadius: chromeRadius.md,
  boxShadow: vars.boxShadow.menu,
});

export const dropIndicator = style({
  position: 'absolute',
  height: 0,
  borderTop: `2px solid ${vars.color.accent}`,
  borderRadius: 1,
  transform: 'translateY(-1px)',
  zIndex: 30,
  pointerEvents: 'none',
});

export const blockSelected = style({
  boxShadow: `0 0 0 2px ${vars.color.accentLight}`,
  backgroundColor: vars.color.accentLight,
  borderRadius: chromeRadius.sm,
  transition: `box-shadow ${chromeMotion.state} ease, background-color ${chromeMotion.state} ease`,
});

export const dragCountBadge = style({
  position: 'absolute',
  top: -8,
  right: -8,
  minWidth: 20,
  height: 20,
  boxSizing: 'border-box',
  borderRadius: 10,
  backgroundColor: vars.color.text,
  color: vars.color.bg,
  fontFamily: vars.typography.fontFamilySans,
  fontSize: 12,
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 6px',
  boxShadow: vars.boxShadow.xs,
});
