import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const root = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  minHeight: 0,
  overflow: 'hidden',
  fontFamily: vars.typography.fontFamilySans,
});

export const canvas = style({
  position: 'relative',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
  touchAction: 'none',
  userSelect: 'none',
  outline: 'none',
  backgroundColor: vars.color.bg,
  backgroundImage: `radial-gradient(${vars.color.border} 1px, transparent 1px)`,
});

export const layer = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  overflow: 'visible',
  pointerEvents: 'none',
});

export const accentStroke = vars.color.accent;
