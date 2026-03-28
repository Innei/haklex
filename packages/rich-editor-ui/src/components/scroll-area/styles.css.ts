import { style } from '@vanilla-extract/css';

export const scrollArea = style({
  'overflow': 'auto',
  'scrollbarWidth': 'thin',
  'scrollbarColor': 'rgba(0,0,0,0.15) transparent',
  '::-webkit-scrollbar': {
    width: '6px',
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '::-webkit-scrollbar-thumb': {
    background: 'rgba(0,0,0,0.15)',
    borderRadius: '3px',
  },
});
