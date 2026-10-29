import { chromeText, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const shell = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: 0,
  fontFamily: vars.typography.fontFamilySans,
  color: vars.color.text,
});

export const header = style({
  'display': 'grid',
  'gridTemplateColumns': 'minmax(0, 1fr) auto minmax(0, 1fr)',
  'alignItems': 'center',
  'gap': 8,
  'minHeight': 48,
  'flexShrink': 0,
  'boxSizing': 'border-box',
  'padding': '0 8px 0 16px',
  'borderBottom': `1px solid ${vars.color.borderSubtle}`,
  '@media': {
    '(max-width: 640px)': {
      gridTemplateColumns: 'minmax(0, 1fr) auto',
    },
  },
});

export const headerLead = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minWidth: 0,
});

export const headerIcon = style({
  display: 'inline-flex',
  flexShrink: 0,
  color: vars.color.textTertiary,
});

globalStyle(`${headerIcon} svg`, {
  width: 16,
  height: 16,
});

export const headerTitle = style({
  ...chromeText.item,
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const headerCenter = style({
  'display': 'flex',
  'justifyContent': 'center',
  '@media': {
    '(max-width: 640px)': {
      gridColumn: '1 / -1',
      gridRow: 2,
      paddingBottom: 8,
    },
  },
});

export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 2,
});

export const divider = style({
  width: 1,
  height: 16,
  margin: '0 4px',
  backgroundColor: vars.color.border,
});

export const body = style({
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
});

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 52,
  flexShrink: 0,
  boxSizing: 'border-box',
  padding: '0 16px',
  borderTop: `1px solid ${vars.color.borderSubtle}`,
});

export const footerStatus = style({
  ...chromeText.label,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flex: 1,
  minWidth: 0,
  fontWeight: 400,
  color: vars.color.textTertiary,
});

export const dirtyDot = style({
  width: 8,
  height: 8,
  borderRadius: '50%',
  flexShrink: 0,
  backgroundColor: vars.color.alertWarning,
});
