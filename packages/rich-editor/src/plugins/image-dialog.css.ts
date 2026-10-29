import {
  chromeMotion,
  chromeRadius,
  chromeText,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const popup = style({});

globalStyle(`${popup} > div:has(> h2)`, {
  paddingLeft: 20,
});

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  outline: 'none',
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: '16px 20px',
  maxHeight: 'min(60vh, 520px)',
  overflowY: 'auto',
});

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 20px 16px',
  borderTop: `1px solid ${vars.color.borderSubtle}`,
});

export const hint = style({
  ...chromeText.label,
  fontWeight: 400,
  color: vars.color.textTertiary,
});

export const footerHint = style([hint, { flex: 1, minWidth: 0 }]);

export const errorHint = style([footerHint, { color: vars.color.alertCaution }]);

export const hiddenInput = style({ display: 'none' });

export const dropzone = style({
  'display': 'flex',
  'flexDirection': 'column',
  'alignItems': 'center',
  'justifyContent': 'center',
  'gap': 10,
  'minHeight': 180,
  'padding': 16,
  'boxSizing': 'border-box',
  'borderRadius': chromeRadius.lg,
  'border': `1.5px dashed ${vars.color.border}`,
  'backgroundColor': vars.color.bgSecondary,
  'outline': 'none',
  'transition': `border-color ${chromeMotion.state} ease, background-color ${chromeMotion.state} ease`,
  ':focus-visible': {
    boxShadow: focusRing,
  },
  'selectors': {
    '&[data-drag-active]': {
      borderColor: vars.color.accent,
      backgroundColor: vars.color.accentLight,
    },
  },
});

export const dropIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: chromeRadius.lg,
  backgroundColor: vars.color.bgElevated,
  boxShadow: vars.boxShadow.xs,
  color: vars.color.textSecondary,
});

export const dropTitle = style({
  ...chromeText.item,
  fontWeight: 500,
  color: vars.color.text,
});

export const pasteHint = style([
  hint,
  {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
]);

export const divider = style([
  hint,
  {
    'display': 'flex',
    'alignItems': 'center',
    'gap': 10,
    '::before': { content: '""', flex: 1, height: 1, backgroundColor: vars.color.borderSubtle },
    '::after': { content: '""', flex: 1, height: 1, backgroundColor: vars.color.borderSubtle },
  },
]);

export const urlRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

export const urlInput = style({ flex: 1, minWidth: 0 });

export const urlThumb = style({
  flex: 'none',
  width: 40,
  height: 28,
  borderRadius: chromeRadius.sm,
  objectFit: 'cover',
  backgroundColor: vars.color.fillTertiary,
});

export const rows = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 8,
  borderRadius: chromeRadius.md,
  boxShadow: `0 0 0 1px ${vars.color.border}`,
});

export const rowFailed = style({
  boxShadow: `0 0 0 1px ${vars.color.alertCaution}`,
});

export const thumb = style({
  flex: 'none',
  width: 64,
  height: 44,
  borderRadius: 6,
  objectFit: 'cover',
  backgroundColor: vars.color.fillTertiary,
});

export const rowBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flex: 1,
  minWidth: 0,
});

export const rowTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  minWidth: 0,
});

export const fileName = style({
  ...chromeText.control,
  fontWeight: 500,
  color: vars.color.text,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const editedTag = style({
  flex: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  height: 18,
  padding: '0 6px',
  borderRadius: chromeRadius.sm,
  fontSize: 11,
  fontWeight: 500,
  backgroundColor: vars.color.accentLight,
  color: vars.color.accent,
});

export const meta = style([
  hint,
  { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
]);

export const locationRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginTop: 4,
});

export const locationIcon = style({
  flex: 'none',
  color: vars.color.alertWarning,
});

export const errorText = style([hint, { color: vars.color.alertCaution }]);

export const addMore = style({ alignSelf: 'flex-start' });

globalStyle(`${popup}:not([role="dialog"]) ${body}, ${popup}:not([role="dialog"]) ${footer}`, {
  paddingLeft: 4,
  paddingRight: 4,
});
