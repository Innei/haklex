import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const editClassNames = {
  titleRow: 'rich-steps-edit-title-row',
  titleInput: 'rich-steps-edit-title-input',
  actions: 'rich-steps-edit-actions',
  action: 'rich-steps-edit-action',
  editable: 'rich-steps-edit-content',
} as const;

export const titleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5em',
  minHeight: '1.75em',
});

export const titleInput = style({
  flex: 1,
  minWidth: 0,
  margin: 0,
  padding: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  font: 'inherit',
  fontSize: '1.0625em',
  fontWeight: 600,
  lineHeight: '1.75em',
  color: vars.color.text,
  selectors: {
    '&::placeholder': {
      color: vars.color.textTertiary,
      fontWeight: 400,
    },
  },
});

export const actions = style({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  opacity: 0,
  transition: 'opacity 0.15s',
});

globalStyle(`li:hover > ${titleRow} > ${actions}, li:focus-within > ${titleRow} > ${actions}`, {
  opacity: 1,
});

export const action = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  padding: 0,
  border: 'none',
  borderRadius: vars.borderRadius.sm,
  background: 'transparent',
  color: vars.color.textTertiary,
  cursor: 'pointer',
  selectors: {
    '&:hover:not(:disabled)': {
      background: vars.color.fillTertiary,
      color: vars.color.text,
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'default',
    },
  },
});

export const editable = style({
  outline: 'none',
  minHeight: '1.5em',
});
