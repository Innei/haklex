import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const semanticClassNames = {
  panel: 'rich-quote-attribution-panel',
  row: 'rich-quote-attribution-row',
  input: 'rich-quote-attribution-input',
} as const;

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '320px',
  padding: '12px',
  fontSize: '13px',
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: vars.color.bgSecondary,
  borderRadius: vars.borderRadius.md,
  minWidth: 0,
});

export const input = style({
  flex: 1,
  appearance: 'none',
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.color.text,
  fontFamily: vars.typography.fontFamily,
  fontSize: '13px',
  padding: 0,
  outline: 'none',
  minWidth: 0,
  selectors: {
    '&::placeholder': {
      color: vars.color.textSecondary,
    },
  },
});
