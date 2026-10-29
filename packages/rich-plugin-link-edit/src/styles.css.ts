import { chromeRadius, chromeText, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const semanticClassNames = {
  panel: 'rich-link-edit-panel',
  preview: 'rich-link-edit-preview',
  actions: 'rich-link-edit-actions',
  cmdHover: 'rich-link-edit-cmd-hover',
} as const;

export const panel = style({
  maxWidth: 'calc(100vw - 16px)',
});

export const preview = style({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: 12,
  minWidth: 0,
});

export const tile = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  flexShrink: 0,
  borderRadius: chromeRadius.md,
  backgroundColor: vars.color.fillSecondary,
  color: vars.color.textTertiary,
});

globalStyle(`${tile} svg`, {
  width: 16,
  height: 16,
});

export const meta = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  flex: 1,
});

const ellipsis = {
  minWidth: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
} as const;

export const title = style({
  ...chromeText.control,
  ...ellipsis,
  fontWeight: 600,
  color: vars.color.text,
});

export const muted = style({
  fontWeight: 400,
  color: vars.color.textTertiary,
});

export const url = style({
  ...chromeText.label,
  ...ellipsis,
  fontWeight: 400,
  color: vars.color.textTertiary,
});

export const actions = style({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  minWidth: 0,
  padding: '6px 6px 6px 12px',
  borderTop: `1px solid ${vars.color.borderSubtle}`,
});

export const spacer = style({
  flex: 1,
});

export const formFooter = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 6,
  padding: '0 12px 12px',
});

export const saveKey = style({
  marginRight: '-4px',
});

export const cmdHover = style({});

globalStyle(`${cmdHover} a`, {
  cursor: 'pointer',
  textDecorationLine: 'underline',
});
