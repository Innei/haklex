import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const scrollArea = style({
  'overflow': 'auto',
  'scrollbarWidth': 'thin',
  'scrollbarColor': `color-mix(in oklab, ${vars.color.text} 18%, transparent) transparent`,
  '::-webkit-scrollbar': {
    width: '6px',
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '::-webkit-scrollbar-thumb': {
    background: `color-mix(in oklab, ${vars.color.text} 18%, transparent)`,
    borderRadius: '3px',
  },
});
