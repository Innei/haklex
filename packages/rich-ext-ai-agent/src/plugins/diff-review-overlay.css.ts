import { globalStyle, style } from '@vanilla-extract/css';

// Wraps each RichRenderer inside a diff row. Resets the first/last block's outer
// margin so the colored row hugs its content without extra vertical gaps.
export const rendererFrame = style({
  overflow: 'hidden',
});

globalStyle(`${rendererFrame} > :first-child`, {
  marginTop: 0,
});

globalStyle(`${rendererFrame} > :last-child`, {
  marginBottom: 0,
});
