import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const semanticClassNames = {
  editor: 'rich-quote-attribution-editor',
  input: 'rich-quote-attribution-input',
} as const;

export const editor = style({
  position: 'absolute',
  bottom: '4px',
  right: '8px',
  maxWidth: '60%',
  display: 'flex',
  justifyContent: 'flex-end',
  pointerEvents: 'auto',
});

export const input = style({
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px dotted transparent',
  borderRadius: 0,
  padding: '0 2px',
  margin: 0,
  width: '100%',
  minWidth: 0,
  textAlign: 'right',
  fontStyle: 'italic',
  fontFamily: vars.typography.fontFamily,
  fontSize: '12px',
  color: vars.color.textSecondary,
  outline: 'none',
  transition: 'border-color 120ms ease, background-color 120ms ease',
  selectors: {
    '&::placeholder': {
      color: vars.color.textQuaternary,
      fontStyle: 'italic',
    },
    '&:hover': {
      borderBottomColor: vars.color.textQuaternary,
    },
    '&:focus': {
      borderBottomColor: vars.color.textTertiary,
    },
  },
});
