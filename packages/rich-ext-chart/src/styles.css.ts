import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

import { chartVars } from './palette.css';

const COMPACT_QUERY = '(max-width: 520px)';

export const root = style({
  margin: '1.5em 0',
  containerType: 'inline-size',
  fontSize: 14,
  lineHeight: 1.5,
  color: vars.color.text,
});

export const head = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 10,
});

export const title = style({
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 1.4,
  color: vars.color.text,
});

export const subtitle = style({
  marginTop: 2,
  fontSize: 13,
  color: vars.color.textTertiary,
});

export const toggle = style({
  flex: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  height: 26,
  padding: '0 8px',
  border: 0,
  borderRadius: 6,
  background: 'transparent',
  color: vars.color.textTertiary,
  font: 'inherit',
  fontSize: 12,
  cursor: 'pointer',
  selectors: {
    '&:hover, &[aria-pressed="true"]': {
      background: vars.color.fillSecondary,
      color: vars.color.text,
    },
    '&:focus-visible': { outline: `2px solid ${vars.color.accent}`, outlineOffset: 1 },
  },
});

export const key = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px 14px',
  margin: '-2px 0 8px',
  fontSize: 12,
  color: vars.color.textSecondary,
});

export const keyItem = style({ display: 'inline-flex', alignItems: 'center', gap: 6 });

export const keySwatch = style({ width: 10, height: 10, borderRadius: 2 });

export const keyLine = style({ width: 12, height: 2, borderRadius: 1 });

export const wide = style({
  '@container': { [COMPACT_QUERY]: { display: 'none' } },
});

export const compact = style({
  'display': 'none',
  '@container': { [COMPACT_QUERY]: { display: 'block' } },
});

export const plot = style({ position: 'relative' });

export const svg = style({
  display: 'block',
  width: '100%',
  height: 'auto',
  overflow: 'visible',
  fontFamily: 'inherit',
  fontVariantNumeric: 'tabular-nums',
  userSelect: 'none',
});

export const tick = style({ fontSize: 11, fill: vars.color.textTertiary });

export const xLabel = style({ fontSize: 12, fill: vars.color.textTertiary });

export const valueLabel = style({ fontSize: 11, fill: vars.color.textTertiary });

export const valueLabelStrong = style({ fontSize: 11, fontWeight: 600, fill: vars.color.text });

export const endLabel = style({ fontSize: 12 });

export const gridLine = style({
  stroke: chartVars.grid,
  strokeWidth: 1,
  shapeRendering: 'crispEdges',
});

export const baseLine = style({
  stroke: chartVars.axis,
  strokeWidth: 1,
  shapeRendering: 'crispEdges',
});

export const tooltip = style({
  position: 'absolute',
  zIndex: 2,
  minWidth: 132,
  padding: '8px 10px',
  borderRadius: 8,
  fontSize: 12,
  lineHeight: 1.5,
  pointerEvents: 'none',
  background: vars.color.bg,
  border: `1px solid ${vars.color.hrBorder}`,
  boxShadow: vars.boxShadow.menu,
  whiteSpace: 'nowrap',
});

export const tooltipTitle = style({ marginBottom: 4, color: vars.color.textTertiary });

export const tooltipRow = style({
  display: 'grid',
  gridTemplateColumns: '12px auto 1fr',
  alignItems: 'center',
  gap: 8,
});

export const tooltipKey = style({ width: 12, height: 2, borderRadius: 1 });

export const tooltipValue = style({
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.text,
});

export const tooltipLabel = style({ color: vars.color.textTertiary });

export const caption = style({ marginTop: 10, fontSize: 12, color: vars.color.textTertiary });

export const captionSource = style({ fontWeight: 500, color: vars.color.textSecondary });

export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
  fontVariantNumeric: 'tabular-nums',
});

globalStyle(`${table} th, ${table} td`, {
  padding: '7px 10px',
  borderBottom: `1px solid ${vars.color.hrBorder}`,
  textAlign: 'right',
});
globalStyle(`${table} th`, { fontWeight: 500, fontSize: 12, color: vars.color.textTertiary });
globalStyle(`${table} th:first-child, ${table} td:first-child`, { textAlign: 'left' });
globalStyle(`${table} tbody tr:hover td`, { background: vars.color.bgSecondary });

export const empty = style({
  position: 'relative',
  height: 220,
  display: 'grid',
  placeItems: 'center',
});

export const emptyLines = style({
  position: 'absolute',
  inset: '20px 0 30px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

export const emptyLine = style({ height: 1, background: chartVars.grid });

export const emptyMessage = style({
  position: 'relative',
  padding: '6px 14px',
  textAlign: 'center',
  background: vars.color.bg,
  fontSize: 14,
  fontWeight: 500,
  color: vars.color.textSecondary,
});

export const emptyHint = style({
  display: 'block',
  fontFamily: vars.typography.fontMono,
  fontSize: 12,
  fontWeight: 400,
  color: vars.color.textTertiary,
});
