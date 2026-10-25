import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const scrollArea = style({
  'overflow': 'auto',
  '@supports': {
    'not selector(::-webkit-scrollbar)': {
      scrollbarWidth: 'thin',
      scrollbarColor: `${vars.color.textQuaternary} transparent`,
    },
  },
});

globalStyle(`${scrollArea}::-webkit-scrollbar`, {
  width: '6px',
  height: '6px',
});

globalStyle(`${scrollArea}::-webkit-scrollbar-track`, {
  background: 'transparent',
});

globalStyle(`${scrollArea}::-webkit-scrollbar-thumb`, {
  background: vars.color.textQuaternary,
  borderRadius: '9999px',
});

globalStyle(`${scrollArea}::-webkit-scrollbar-thumb:hover`, {
  background: vars.color.textTertiary,
});
