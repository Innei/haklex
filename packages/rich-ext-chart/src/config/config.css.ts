import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const popup = style({
  width: 'min(340px, calc(100vw - 32px))',
  padding: 0,
  overflow: 'hidden',
});

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 'min(520px, calc(100vh - 96px))',
  fontFamily: vars.typography.fontFamilySans,
  fontSize: 13,
  color: vars.color.text,
});

export const tabs = style({
  padding: 6,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  padding: 14,
  overflowY: 'auto',
  minHeight: 0,
});

export const notice = style({
  padding: 14,
  fontSize: 12,
  lineHeight: 1.5,
  color: vars.color.textSecondary,
});

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  minWidth: 0,
});

export const fieldLabel = style({
  fontSize: 12,
  color: vars.color.textTertiary,
});

export const pair = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
});

const control = {
  boxSizing: 'border-box',
  height: 32,
  minWidth: 0,
  padding: '0 10px',
  border: `1px solid ${vars.color.border}`,
  borderRadius: 6,
  background: vars.color.bg,
  color: vars.color.text,
  font: 'inherit',
  outline: 'none',
  selectors: {
    '&:focus-visible': { borderColor: vars.color.accent },
  },
} as const;

export const input = style(control);

export const select = style({ ...control, padding: '0 8px' });

export const check = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: vars.color.textSecondary,
  cursor: 'pointer',
});

export const checkbox = style({ width: 16, height: 16, margin: 0 });

export const seriesRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

export const seriesKey = style({
  ...control,
  width: 92,
  flexShrink: 0,
  padding: '0 8px',
  fontFamily: vars.typography.fontMono,
  fontSize: 12,
});

export const seriesLabel = style({ ...control, flex: 1, padding: '0 8px' });

export const swatchButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: 28,
  height: 28,
  padding: 0,
  border: 0,
  borderRadius: 6,
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
  borderRadius: 6,
  background: 'transparent',
  cursor: 'pointer',
  selectors: {
    '&[aria-pressed="true"]': { borderColor: vars.color.text },
  },
});

export const iconButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: 28,
  height: 28,
  padding: 0,
  border: 0,
  borderRadius: 6,
  background: 'transparent',
  color: vars.color.textTertiary,
  cursor: 'pointer',
  selectors: {
    '&:hover:not(:disabled)': { background: vars.color.fillSecondary, color: vars.color.text },
    '&:disabled': { opacity: 0.4, cursor: 'default' },
  },
});

export const addButton = style({
  height: 30,
  border: `1px dashed ${vars.color.border}`,
  borderRadius: 6,
  background: 'transparent',
  color: vars.color.textSecondary,
  font: 'inherit',
  fontSize: 12,
  cursor: 'pointer',
  selectors: {
    '&:hover:not(:disabled)': { background: vars.color.fillSecondary, color: vars.color.text },
    '&:disabled': { opacity: 0.5, cursor: 'default' },
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
  borderRadius: 6,
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
