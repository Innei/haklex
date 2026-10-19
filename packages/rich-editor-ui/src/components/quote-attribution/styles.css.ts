import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const semanticClassNames = {
  overlay: 'rich-quote-attribution-overlay',
  panel: 'rich-quote-attribution-panel',
  input: 'rich-quote-attribution-input',
} as const;

// A fixed-positioned rectangle anchored to the active quote's bounding box.
// `pointer-events: none` lets clicks pass through the empty area while the
// inner panel still receives them.
export const overlay = style({
  position: 'fixed',
  zIndex: 50,
  pointerEvents: 'none',
});

export const panel = style({
  position: 'absolute',
  bottom: '4px',
  left: '18px',
  maxWidth: '60%',
  display: 'flex',
  justifyContent: 'flex-start',
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
  textAlign: 'start',
  fontStyle: 'normal',
  fontFamily: vars.typography.fontFamily,
  fontSize: '13px',
  color: vars.color.textTertiary,
  outline: 'none',
  transition: 'border-color 120ms ease, background-color 120ms ease',
  selectors: {
    '&::placeholder': {
      color: vars.color.textQuaternary,
    },
    '&:hover': {
      borderBottomColor: vars.color.textQuaternary,
    },
    '&:focus': {
      borderBottomColor: vars.color.textTertiary,
    },
  },
});
