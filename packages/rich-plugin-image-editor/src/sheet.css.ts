import { vars } from '@haklex/rich-style-token/styles';
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
  borderRadius: vars.borderRadius.md,
});

export const rowFailed = style({
  borderColor: 'rgba(239, 68, 68, 0.55)',
});

export const thumb = style({
  width: 80,
  height: 56,
  flexShrink: 0,
  borderRadius: vars.borderRadius.sm,
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
  color: '#737373',
  fontSize: 12,
  fontVariantNumeric: 'tabular-nums',
});

export const gpsTag = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  color: '#b45309',
  fontSize: 12,
});

export const errorText = style({
  color: '#dc2626',
  fontSize: 12,
});

export const gpsPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: '10px 12px',
  border: '1px solid rgba(245, 158, 11, 0.35)',
  borderRadius: vars.borderRadius.md,
  backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
  color: '#737373',
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
  color: '#737373',
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
  borderRadius: vars.borderRadius.sm,
  backgroundColor: 'transparent',
  color: '#737373',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.fillSecondary,
      color: vars.color.text,
    },
  },
});
