import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const HIDDEN_HIGHLIGHT = 'agent-stream-hidden';
export const FADE_HIGHLIGHTS = [
  'agent-stream-fade-1',
  'agent-stream-fade-2',
  'agent-stream-fade-3',
] as const;
const FADE_COLORS = [vars.color.textQuaternary, vars.color.textTertiary, vars.color.textSecondary];

globalStyle(`::highlight(${HIDDEN_HIGHLIGHT})`, {
  color: 'transparent',
  textDecorationColor: 'transparent',
});

FADE_HIGHLIGHTS.forEach((name, index) => {
  globalStyle(`::highlight(${name})`, {
    color: FADE_COLORS[index],
  });
});

export const caret = style({
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 5,
  width: 2,
  marginLeft: 1,
  borderRadius: 1,
  backgroundColor: vars.color.accent,
  pointerEvents: 'none',
  opacity: 0,
  transition: 'opacity 240ms ease',
});

export const caretVisible = style({
  opacity: 1,
});

export const caretLabel = style({
  position: 'absolute',
  bottom: '100%',
  left: 0,
  marginBottom: 2,
  paddingInline: 5,
  borderRadius: '3px 3px 3px 0',
  backgroundColor: vars.color.accent,
  color: vars.color.bg,
  fontSize: 10,
  fontWeight: 600,
  lineHeight: '16px',
  whiteSpace: 'nowrap',
});
