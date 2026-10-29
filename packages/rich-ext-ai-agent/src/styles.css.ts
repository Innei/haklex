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

// ── Agent action bar (chat composer) ───────────────────────────────

export const actionBar = style({
  display: 'flex',
  gap: '8px',
  padding: '8px 12px',
  borderBottom: `1px solid ${vars.color.border}`,
  alignItems: 'center',
  fontSize: '13px',
});
