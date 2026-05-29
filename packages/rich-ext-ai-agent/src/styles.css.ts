import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

// ── AI diff: Cursor-style inline rows ──────────────────────────────
// Full-width colored rows in the document flow. Color is an overlay only —
// inner block typography (font-size, line-height, indent) is left untouched so
// a replaced heading still looks like a heading, a paragraph like body text.

export const diffInlineRoot = style({
  position: 'relative',
  margin: '16px 0',
});

export const diffInlineStack = style({
  display: 'grid',
  gap: '1px',
  borderRadius: '5px',
  overflow: 'hidden',
  background: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
});

export const diffInlineRow = style({
  padding: '3px 12px',
});

export const diffRowInsert = style({
  background: `color-mix(in srgb, ${vars.color.alertTip} 12%, ${vars.color.bg})`,
  boxShadow: `inset 3px 0 0 ${vars.color.alertTip}`,
});

export const diffRowDelete = style({
  background: `color-mix(in srgb, ${vars.color.alertCaution} 11%, ${vars.color.bg})`,
  boxShadow: `inset 3px 0 0 ${vars.color.alertCaution}`,
  color: vars.color.textTertiary,
  textDecoration: 'line-through',
  textDecorationColor: `color-mix(in srgb, ${vars.color.alertCaution} 45%, transparent)`,
});

// Floating Accept/Reject bar anchored to the hunk's top-right corner.
export const diffInlineBar = style({
  position: 'absolute',
  top: '-12px',
  right: 0,
  zIndex: 3,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
  padding: '3px',
  borderRadius: '8px',
  background: vars.color.bg,
  border: `1px solid color-mix(in srgb, ${vars.color.text} 12%, transparent)`,
  boxShadow: `0 3px 12px color-mix(in srgb, ${vars.color.text} 14%, transparent)`,
});

export const diffInlineBarBtn = style({
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  cursor: 'pointer',
  padding: '3px 9px',
  borderRadius: '6px',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '11px',
  fontWeight: 500,
  lineHeight: 1.2,
  transition: 'background 120ms ease, color 120ms ease',
});

export const diffInlineBarAccept = style([
  diffInlineBarBtn,
  {
    color: vars.color.alertTip,
    selectors: {
      '&:hover': {
        background: `color-mix(in srgb, ${vars.color.alertTip} 12%, transparent)`,
      },
    },
  },
]);

export const diffInlineBarReject = style([
  diffInlineBarBtn,
  {
    color: vars.color.textTertiary,
    selectors: {
      '&:hover': {
        color: vars.color.alertCaution,
        background: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
      },
    },
  },
]);

// ── Global review bar (sticky, bottom) ─────────────────────────────

export const diffGlobalBar = style({
  position: 'sticky',
  bottom: '8px',
  zIndex: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '10px',
  margin: '10px 12px 12px',
  padding: '8px 10px 8px 12px',
  border: `1px solid color-mix(in srgb, ${vars.color.text} 12%, transparent)`,
  borderRadius: '8px',
  background: `color-mix(in srgb, ${vars.color.bg} 88%, transparent)`,
  boxShadow: `0 8px 28px color-mix(in srgb, ${vars.color.text} 10%, transparent)`,
  backdropFilter: 'blur(10px)',
});

export const diffGlobalMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0,
});

export const diffGlobalTitle = style({
  color: vars.color.text,
  fontFamily: 'system-ui, sans-serif',
  fontSize: '12px',
  fontWeight: 650,
  lineHeight: 1.2,
});

export const diffGlobalCount = style({
  color: vars.color.textTertiary,
  fontFamily: 'system-ui, sans-serif',
  fontSize: '12px',
  lineHeight: 1.2,
  fontVariantNumeric: 'tabular-nums',
});

export const diffGlobalActions = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  gap: '6px',
});

// ── Agent action bar (chat composer) ───────────────────────────────

export const actionBar = style({
  display: 'flex',
  gap: '8px',
  padding: '8px 12px',
  borderBottom: `1px solid ${vars.color.border}`,
  alignItems: 'center',
  fontSize: '13px',
});
