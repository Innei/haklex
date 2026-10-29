import { chromeMotion, focusRing, vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

const resizerLine = `color-mix(in srgb, ${vars.color.accent} 50%, transparent)`;
const resizerLineActive = `color-mix(in srgb, ${vars.color.accent} 75%, transparent)`;

export const resizeHandle = style({
  'position': 'fixed',
  'zIndex': 20,
  'opacity': 0,
  'transition': `opacity ${chromeMotion.state}`,
  ':hover': {
    opacity: 1,
  },
});

export const resizeHandleActive = style({
  opacity: 1,
});

export const resizeHandleRight = style({
  width: 8,
  cursor: 'col-resize',
  background: `linear-gradient(to right, transparent 3px, ${resizerLine} 3px, ${resizerLine} 5px, transparent 5px)`,
  selectors: {
    '&[data-active="true"]': {
      background: `linear-gradient(to right, transparent 3px, ${resizerLineActive} 3px, ${resizerLineActive} 5px, transparent 5px)`,
    },
  },
});

export const resizeHandleBottom = style({
  height: 8,
  cursor: 'row-resize',
  background: `linear-gradient(to bottom, transparent 3px, ${resizerLine} 3px, ${resizerLine} 5px, transparent 5px)`,
  selectors: {
    '&[data-active="true"]': {
      background: `linear-gradient(to bottom, transparent 3px, ${resizerLineActive} 3px, ${resizerLineActive} 5px, transparent 5px)`,
    },
  },
});

export const floating = style({
  position: 'absolute',
  zIndex: 30,
  opacity: 0,
  pointerEvents: 'none',
  transition: `opacity ${chromeMotion.state}`,
  selectors: {
    '&[data-visible="true"]': {
      opacity: 1,
      pointerEvents: 'auto',
    },
  },
});

export const handleBtn = style({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 20,
  'height': 20,
  'padding': 0,
  'borderRadius': 6,
  'border': 'none',
  'background': vars.color.bgElevated,
  'boxShadow': vars.boxShadow.xs,
  'color': vars.color.textTertiary,
  'cursor': 'pointer',
  'transition': `background-color ${chromeMotion.state}, color ${chromeMotion.state}`,
  ':hover': {
    color: vars.color.textSecondary,
  },
  ':focus-visible': {
    outline: 'none',
    boxShadow: focusRing,
  },
  'selectors': {
    '&[data-popup-open]': {
      background: vars.color.text,
      color: vars.color.bg,
    },
  },
});

export const appendBar = style({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': '100%',
  'height': '100%',
  'padding': 0,
  'borderRadius': 6,
  'border': 'none',
  'background': vars.color.fillTertiary,
  'color': vars.color.textTertiary,
  'cursor': 'pointer',
  'transition': `background-color ${chromeMotion.state}, color ${chromeMotion.state}`,
  ':hover': {
    background: vars.color.fillSecondary,
    color: vars.color.textSecondary,
  },
  ':focus-visible': {
    outline: 'none',
    boxShadow: focusRing,
  },
});
