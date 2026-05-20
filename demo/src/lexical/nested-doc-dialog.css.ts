import { vars } from '@haklex/rich-editor/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const dialogPopup = style({});

globalStyle(`${dialogPopup}${dialogPopup}`, {
  display: 'flex',
  flexDirection: 'column',
  width: '700px',
  maxWidth: '90vw',
  height: 'min(800px, calc(100vh - 2rem))',
  maxHeight: 'min(800px, calc(100vh - 2rem))',
  overflow: 'hidden',
});

export const dialogBody = style({
  flex: 1,
  minHeight: 0,
  padding: '0 1.5rem 1.5rem',
  overflowY: 'auto',
  overflowX: 'hidden',
  background: vars.color.bg,
});
