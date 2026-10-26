import { globalStyle, style } from '@vanilla-extract/css';

export const canvas = style({
  position: 'relative',
  width: '100%',
  overflowAnchor: 'none',
});
export const slot = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  display: 'flow-root',
});
export const editable = style({
  display: 'flow-root',
  width: '100%',
  outline: 'none',
});
globalStyle(
  `${slot}[data-restoring] details::details-content, ${slot}[data-restoring] .rich-details-chevron`,
  {
    transition: 'none !important',
  },
);
