import { chromeText, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const floating = style({
  position: 'absolute',
  zIndex: 3,
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 12,
  boxShadow: '0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px rgb(0 0 0 / 0.06)',
  pointerEvents: 'auto',
});

export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
});

export const inlineToolbar = style({
  display: 'flex',
  justifyContent: 'center',
  padding: '6px 8px',
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
  flexShrink: 0,
});

export const toolButton = style({
  position: 'relative',
  selectors: {
    '&[aria-pressed="true"]': {
      background: vars.color.accentLight,
      color: vars.color.accent,
    },
  },
});

export const toolKey = style({
  position: 'absolute',
  right: 3,
  bottom: 2,
  fontSize: 9,
  lineHeight: '10px',
  color: vars.color.textQuaternary,
  pointerEvents: 'none',
  selectors: {
    '[aria-pressed="true"] > &': { color: vars.color.accent, opacity: 0.7 },
  },
});

globalStyle(`${toolbar} ${toolButton}`, { width: 36, height: 36 });

export const separator = style({
  width: 1,
  height: 18,
  margin: '0 4px',
  flexShrink: 0,
  backgroundColor: vars.color.border,
});

export const panel = style({
  top: 12,
  right: 12,
  width: 232,
  maxHeight: 'calc(100% - 24px)',
  overflowY: 'auto',
  padding: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const row = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const rowLabel = style({
  ...chromeText.label,
  color: vars.color.textTertiary,
});

export const options = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 4,
});

export const swatch = style({
  width: 24,
  height: 24,
  padding: 0,
  borderRadius: 6,
  border: '1px solid rgb(0 0 0 / 0.08)',
  cursor: 'pointer',
  selectors: {
    '&[aria-pressed="true"]': {
      boxShadow: `0 0 0 2px ${vars.color.bg}, 0 0 0 3.5px ${vars.color.accent}`,
    },
  },
});

export const transparentSwatch = style({
  background: `linear-gradient(135deg, transparent 45%, #e03131 45%, #e03131 55%, transparent 55%), ${vars.color.bg}`,
});

export const range = style({
  width: '100%',
  accentColor: vars.color.textTertiary,
});

export const zoom = style({
  left: 12,
  bottom: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  padding: 4,
});

export const zoomValue = style({
  ...chromeText.label,
  minWidth: 44,
  border: 'none',
  background: 'none',
  color: vars.color.textSecondary,
  fontVariantNumeric: 'tabular-nums',
  cursor: 'pointer',
});

globalStyle(`${floating} svg`, { width: 16, height: 16 });

export const zoomTop = style({
  left: 12,
  top: 12,
  bottom: 'auto',
});

export const dock = style({
  left: 8,
  right: 8,
  bottom: 8,
  padding: 4,
  overflowX: 'auto',
  scrollbarWidth: 'none',
});

globalStyle(`${dock} ${toolbar}`, { flexWrap: 'nowrap' });

globalStyle(`${dock} button`, { flexShrink: 0, minWidth: 40, minHeight: 40 });

export const sheet = style({
  position: 'absolute',
  zIndex: 3,
  left: 0,
  right: 0,
  bottom: 64,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  maxHeight: '60%',
  padding: '8px 16px 16px',
  overflowY: 'auto',
  background: vars.color.bg,
  borderTop: `1px solid ${vars.color.border}`,
  borderRadius: '16px 16px 0 0',
  boxShadow: '0 -4px 16px rgb(0 0 0 / 0.06)',
  pointerEvents: 'auto',
});

export const grabber = style({
  width: 36,
  height: 4,
  margin: '0 auto 4px',
  borderRadius: 2,
  background: vars.color.border,
});

export const sheetMore = style({
  alignSelf: 'flex-start',
  padding: 0,
  border: 'none',
  background: 'none',
  color: vars.color.accent,
  font: 'inherit',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
});
