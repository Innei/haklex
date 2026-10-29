import { chromeRadius, chromeText, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const popup = style({
  overflow: 'hidden',
});

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 'min(520px, calc(100vh - 96px))',
  ...chromeText.control,
  fontFamily: vars.typography.fontFamilySans,
  color: vars.color.text,
});

export const tabs = style({
  padding: '8px 12px',
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 12,
  overflowY: 'auto',
  minHeight: 0,
});

export const notice = style({
  ...chromeText.label,
  fontWeight: 400,
  margin: 0,
  padding: 12,
  color: vars.color.textSecondary,
});

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minWidth: 0,
});

export const fieldLabel = style({
  ...chromeText.label,
  color: vars.color.textSecondary,
});

export const select = style({
  width: '100%',
});

export const seriesKey = style({
  width: 92,
  flexShrink: 0,
});

export const seriesLabel = style({
  flex: 1,
});

export const pair = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
});

export const seriesRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

export const swatchButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: 28,
  height: 28,
  padding: 0,
  border: 0,
  borderRadius: chromeRadius.md,
  background: 'transparent',
  cursor: 'pointer',
  selectors: {
    '&:hover, &[aria-expanded="true"]': { background: vars.color.fillSecondary },
  },
});

export const swatch = style({
  display: 'block',
  width: 12,
  height: 12,
  borderRadius: 3,
});

export const palette = style({
  display: 'flex',
  gap: 4,
  paddingLeft: 34,
});

export const paletteOption = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  padding: 0,
  border: `2px solid transparent`,
  borderRadius: chromeRadius.md,
  background: 'transparent',
  cursor: 'pointer',
  selectors: {
    '&[aria-pressed="true"]': { borderColor: vars.color.text },
  },
});

export const actions = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
});

export const tableScroll = style({
  overflow: 'auto',
  maxHeight: 300,
  border: `1px solid ${vars.color.border}`,
  borderRadius: chromeRadius.md,
});

export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
});

globalStyle(`${table} th, ${table} td`, {
  padding: 0,
  borderBottom: `1px solid ${vars.color.border}`,
  borderRight: `1px solid ${vars.color.border}`,
});

globalStyle(`${table} th`, { background: vars.color.bgSecondary });

globalStyle(`${table} tr > :last-child`, { borderRight: 0, width: 32 });

globalStyle(`${table} tbody tr:last-child td`, { borderBottom: 0 });

export const cell = style({
  boxSizing: 'border-box',
  width: '100%',
  height: 30,
  padding: '0 8px',
  border: 0,
  background: 'transparent',
  color: vars.color.text,
  font: 'inherit',
  outline: 'none',
  selectors: {
    '&:focus': { boxShadow: `inset 0 0 0 2px ${vars.color.accent}` },
  },
});

export const cellNumber = style({ textAlign: 'right', fontVariantNumeric: 'tabular-nums' });

export const headCell = style({
  fontSize: 12,
  fontWeight: 500,
  color: vars.color.textSecondary,
});
