import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const overlayContainer = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 10,
});

export const batchPanel = style({
  pointerEvents: 'auto',
  position: 'absolute',
  left: 0,
  right: 0,
  overflow: 'hidden',
  borderRadius: vars.borderRadius.md,
});

export const batchHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '3px 10px',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '11px',
  background: `color-mix(in srgb, ${vars.color.text} 3%, ${vars.color.bg})`,
  borderBottom: `1px solid color-mix(in srgb, ${vars.color.text} 6%, transparent)`,
  borderRadius: `${vars.borderRadius.md} ${vars.borderRadius.md} 0 0`,
});

export const batchHeaderLabel = style({
  color: vars.color.textTertiary,
});

export const batchHeaderActions = style({
  display: 'flex',
  gap: '4px',
});

export const batchHeaderReject = style({
  all: 'unset',
  cursor: 'pointer',
  padding: '1px 8px',
  borderRadius: '3px',
  fontSize: '11px',
  color: vars.color.textTertiary,
  transition: 'color 100ms ease, background 100ms ease',
  selectors: {
    '&:hover': {
      color: vars.color.alertCaution,
      background: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
    },
  },
});

export const batchHeaderAccept = style({
  all: 'unset',
  cursor: 'pointer',
  padding: '1px 8px',
  borderRadius: '3px',
  fontSize: '11px',
  color: vars.color.alertTip,
  transition: 'color 100ms ease, background 100ms ease',
  selectors: {
    '&:hover': {
      background: `color-mix(in srgb, ${vars.color.alertTip} 10%, transparent)`,
    },
  },
});

export const oldBlock = style({
  background: `color-mix(in srgb, ${vars.color.alertCaution} 6%, ${vars.color.bg})`,
  borderLeft: `2px solid ${vars.color.alertCaution}`,
  padding: '6px 10px',
  textDecoration: 'line-through',
  textDecorationColor: `color-mix(in srgb, ${vars.color.alertCaution} 40%, transparent)`,
  color: vars.color.textTertiary,
});

export const newBlock = style({
  background: `color-mix(in srgb, ${vars.color.alertTip} 6%, ${vars.color.bg})`,
  borderLeft: `2px solid ${vars.color.alertTip}`,
  padding: '6px 10px',
});

export const mergedBlock = style({
  background: vars.color.bg,
  padding: '6px 10px',
});

export const floatingBar = style({
  pointerEvents: 'auto',
  position: 'sticky',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '6px 16px',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '12px',
  background: `color-mix(in srgb, ${vars.color.text} 4%, ${vars.color.bg})`,
  borderTop: `1px solid color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
  borderRadius: `${vars.borderRadius.md} ${vars.borderRadius.md} 0 0`,
  backdropFilter: 'blur(8px)',
  zIndex: 20,
});

export const floatingBarBtn = style({
  all: 'unset',
  cursor: 'pointer',
  padding: '3px 12px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 500,
  transition: 'color 100ms ease, background 100ms ease',
});

export const floatingBarAccept = style([
  floatingBarBtn,
  {
    color: vars.color.alertTip,
    background: `color-mix(in srgb, ${vars.color.alertTip} 10%, transparent)`,
    selectors: {
      '&:hover': {
        background: `color-mix(in srgb, ${vars.color.alertTip} 18%, transparent)`,
      },
    },
  },
]);

export const floatingBarReject = style([
  floatingBarBtn,
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

export const floatingBarLabel = style({
  color: vars.color.textTertiary,
  marginRight: '4px',
});

export const rendererFrame = style({
  overflow: 'hidden',
});

globalStyle(`${rendererFrame} > :first-child`, {
  marginTop: 0,
});

globalStyle(`${rendererFrame} > :last-child`, {
  marginBottom: 0,
});
