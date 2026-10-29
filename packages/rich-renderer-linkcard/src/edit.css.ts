import { chromeRadius, chromeText, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const semanticClassNames = {
  editWrapper: 'rich-link-card-edit-wrapper',
  editPanel: 'rich-link-card-edit-panel',
  editPreview: 'rich-link-card-edit-preview',
  editActions: 'rich-link-card-edit-actions',
} as const;

export const editWrapper = style({
  display: 'block',
});

export const editPanel = style({
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
  overflow: 'hidden',
  borderRadius: chromeRadius.md,
  backgroundColor: vars.color.fillSecondary,
  color: vars.color.textTertiary,
});

globalStyle(`${tile} svg`, {
  width: 16,
  height: 16,
});

globalStyle(`${tile} img`, {
  width: 16,
  height: 16,
  objectFit: 'contain',
});

export const meta = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
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

export const kindSwitch = style({
  width: 112,
  flexShrink: 0,
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
