import {
  chromeMotion,
  chromeRadius,
  chromeText,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const trigger = style({
  'display': 'flex',
  'alignItems': 'center',
  'gap': '6px',
  'cursor': 'pointer',
  'border': 'none',
  'background': 'none',
  ...chromeText.control,
  'fontWeight': 500,
  'padding': 0,
  'borderRadius': chromeRadius.sm,
  'color': vars.color.textSecondary,
  'fontFamily': vars.typography.fontFamilySans,
  'width': '100%',
  'textAlign': 'left',
  'outline': 'none',
  'transition': `color ${chromeMotion.state} ease`,
  ':hover': {
    color: vars.color.text,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
});

export const chevron = style({
  transition: `transform ${chromeMotion.layout}`,
  width: '16px',
  height: '16px',
  flexShrink: 0,
  selectors: {
    '[data-panel-open] &': {
      transform: 'rotate(90deg)',
    },
  },
});

export const panel = style({
  'overflow': 'hidden',
  'interpolateSize': 'allow-keywords',
  'height': 'var(--collapsible-panel-height)',
  'transition': `height ${chromeMotion.layout}`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
  'selectors': {
    '&[data-closed]': {
      height: 0,
    },
    '&[data-starting-style]': {
      height: 0,
    },
    '&[data-ending-style]': {
      height: 0,
    },
  },
});

export const panelContent = style({
  paddingTop: '4px',
  paddingLeft: '22px',
});

globalStyle(`${trigger}[data-no-chevron] ~ ${panel} > ${panelContent}`, {
  paddingLeft: 0,
});
