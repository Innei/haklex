import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const sceneRoot = style({
  'position': 'relative',
  'width': '100%',
  'height': '100%',
  'overflow': 'hidden',
  'userSelect': 'none',
  'touchAction': 'none',
  'cursor': 'grab',
  'selectors': {
    '&[data-mode="inline"]': {
      touchAction: 'pan-x pan-y',
    },
    '&[data-panning="true"]': {
      cursor: 'grabbing',
    },
  },
  '@media': {
    '(pointer: coarse)': {
      selectors: {
        '&[data-mode="inline"]': {
          cursor: 'default',
        },
      },
    },
  },
});

export const sceneSvg = style({
  display: 'block',
  width: '100%',
  height: '100%',
});

export const toolbar = style({
  'position': 'absolute',
  'right': '8px',
  'bottom': '8px',
  'zIndex': 1,
  'display': 'flex',
  'alignItems': 'center',
  'gap': '2px',
  'padding': '3px',
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': '8px',
  'backgroundColor': `color-mix(in oklab, ${vars.color.bg} 92%, transparent)`,
  'color': vars.color.textTertiary,
  'fontFamily': vars.typography.fontFamilySans,
  'fontSize': '12px',
  'opacity': 0,
  'transition': 'opacity 0.15s ease',
  'selectors': {
    [`${sceneRoot}:hover &, ${sceneRoot}:focus-within &`]: {
      opacity: 1,
    },
  },
  '@media': {
    '(pointer: coarse)': {
      opacity: 1,
    },
  },
});

export const toolButton = style({
  'appearance': 'none',
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': '28px',
  'height': '28px',
  'padding': 0,
  'border': 'none',
  'borderRadius': '6px',
  'background': 'transparent',
  'color': 'inherit',
  'cursor': 'pointer',
  'transition': 'background-color 0.15s ease, color 0.15s ease',
  ':hover': {
    backgroundColor: vars.color.fill,
    color: vars.color.text,
  },
  '@media': {
    '(pointer: coarse)': {
      width: '36px',
      height: '36px',
    },
  },
});

export const zoomLabel = style({
  minWidth: '44px',
  textAlign: 'center',
  fontVariantNumeric: 'tabular-nums',
});

export const toolSeparator = style({
  width: '1px',
  height: '16px',
  margin: '0 2px',
  backgroundColor: vars.color.border,
});

globalStyle(`${toolButton} svg`, {
  width: '16px',
  height: '16px',
});
