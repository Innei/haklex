import { chromeRadius, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

const _sheetPopup = style({});
globalStyle(`${_sheetPopup}${_sheetPopup}`, {
  maxWidth: 'min(calc(100% - 2rem), 35rem)',
});
export { _sheetPopup as sheetPopup };

export const sheet = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  minWidth: 0,
  padding: '0.25rem 1.5rem 1.25rem',
  color: vars.color.text,
  fontFamily: vars.typography.fontFamilySans,
});

export const rows = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  maxHeight: '50vh',
  overflowY: 'auto',
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '8px 8px 8px 10px',
  border: `1px solid ${vars.color.border}`,
  borderRadius: chromeRadius.md,
});

export const rowFailed = style({
  borderColor: `color-mix(in oklab, ${vars.color.alertCaution} 55%, transparent)`,
});

export const thumb = style({
  width: 80,
  height: 56,
  flexShrink: 0,
  borderRadius: chromeRadius.sm,
  objectFit: 'cover',
  backgroundColor: vars.color.fillSecondary,
});

export const rowBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  flex: 1,
  minWidth: 0,
});

export const rowTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minWidth: 0,
});

export const fileName = style({
  overflow: 'hidden',
  fontSize: 14,
  fontWeight: 500,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const badge = style({
  flexShrink: 0,
  padding: '1px 7px',
  borderRadius: 999,
  backgroundColor: vars.color.accentLight,
  color: vars.color.accent,
  fontSize: 11,
  fontWeight: 600,
});

export const meta = style({
  color: vars.color.textTertiary,
  fontSize: 12,
  fontVariantNumeric: 'tabular-nums',
});

export const gpsTag = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  color: vars.color.alertWarning,
  fontSize: 12,
});

export const errorText = style({
  color: vars.color.alertCaution,
  fontSize: 12,
});

export const gpsPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: '10px 12px',
  border: `1px solid color-mix(in oklab, ${vars.color.alertWarning} 35%, transparent)`,
  borderRadius: chromeRadius.md,
  backgroundColor: `color-mix(in oklab, ${vars.color.alertWarning} 10%, transparent)`,
  fontSize: 13,
});

export const gpsHeading = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontWeight: 600,
});

export const gpsCoords = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  paddingLeft: 24,
  color: vars.color.textTertiary,
  fontSize: 12,
  fontVariantNumeric: 'tabular-nums',
});

export const gpsToggle = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 28,
  paddingLeft: 24,
  cursor: 'pointer',
});

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  paddingTop: 4,
});

export const hint = style({
  flex: 1,
  color: vars.color.textTertiary,
  fontSize: 12,
});

export const iconButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  padding: 0,
  border: 'none',
  borderRadius: chromeRadius.sm,
  backgroundColor: 'transparent',
  color: vars.color.textTertiary,
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.fillSecondary,
      color: vars.color.text,
    },
  },
});
