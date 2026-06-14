import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const tableWrapper = style({
  display: 'block',
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  overflowX: 'auto',
  overscrollBehaviorX: 'contain',
});

export const table = style({
  width: '100%',
  captionSide: 'bottom',
  borderCollapse: 'collapse',
  fontSize: vars.typography.fontSizeSmall,
});

export const tableHead = style({
  height: '2.5rem',
  padding: `0 ${vars.spacing.lg}`,
  verticalAlign: 'middle',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  color: vars.color.textSecondary,
  lineHeight: '1.5',
});

export const tableCell = style({
  padding: vars.spacing.lg,
  verticalAlign: 'middle',
  lineHeight: '1.5',
});

// Header row — bottom border only
globalStyle(`${table} tr:has(${tableHead})`, {
  borderBottom: `1px solid ${vars.color.border}`,
});

// Body rows — alternating background (even accounts for header row at position 1)
globalStyle(`${table} tr:has(${tableCell}):nth-child(even)`, {
  backgroundColor: vars.color.bgSecondary,
});

// Clear alternating bg on non-hovered even rows when any row is hovered
globalStyle(`${table}:has(tr:hover) tr:has(${tableCell}):nth-child(even):not(:hover)`, {
  backgroundColor: 'transparent',
});

// Body row hover
globalStyle(`${table} tr:has(${tableCell})`, {
  transition: 'background-color 0.15s',
});

globalStyle(`${table} tr:has(${tableCell}):hover`, {
  backgroundColor: vars.color.fillTertiary,
});

// Reset paragraph margins inside cells
globalStyle(`${table} .rich-paragraph`, {
  margin: 0,
  padding: 0,
  lineHeight: 'inherit',
});
