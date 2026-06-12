import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const semanticClassNames = {
  root: 'rich-dynamic-root',
  host: 'rich-dynamic-host',
  placeholder: 'rich-dynamic-placeholder',
  error: 'rich-dynamic-error',
  settingsButton: 'rich-dynamic-settings-button',
  editPanel: 'rich-dynamic-edit-panel',
  editField: 'rich-dynamic-edit-field',
  editFieldIcon: 'rich-dynamic-edit-field-icon',
  editInput: 'rich-dynamic-edit-input',
  editTextarea: 'rich-dynamic-edit-textarea',
  editError: 'rich-dynamic-edit-error',
} as const;

export const root = style({
  position: 'relative',
  margin: '1.25rem 0',
});

export const host = style({
  width: '100%',
});

export const overlay = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  borderRadius: vars.borderRadius.md,
  border: `1px dashed ${vars.color.border}`,
  backgroundColor: vars.color.bgSecondary,
  color: vars.color.textTertiary,
  fontFamily: vars.typography.fontFamilySans,
  fontSize: vars.typography.fontSizeSm,
});

export const retryButton = style({
  appearance: 'none',
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.color.bg,
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeSm,
  padding: '4px 12px',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.fillSecondary,
    },
  },
});

export const errorUrl = style({
  maxWidth: '80%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeXs,
  color: vars.color.textQuaternary,
});

export const settingsButton = style({
  position: 'absolute',
  top: '8px',
  right: '8px',
  zIndex: 1,
  appearance: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.color.bg,
  color: vars.color.textSecondary,
  cursor: 'pointer',
  opacity: 0,
  transition: 'opacity 0.15s ease',
  selectors: {
    [`${root}:hover &, &:focus-visible, &[data-popup-open]`]: {
      opacity: 1,
    },
  },
});

export const editPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '340px',
  padding: '12px',
  fontFamily: vars.typography.fontFamilySans,
});

export const editField = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 10px',
  backgroundColor: vars.color.bgSecondary,
  borderRadius: '6px',
  minWidth: 0,
});

export const editFieldIcon = style({
  flexShrink: 0,
  color: vars.color.textSecondary,
});

export const editInput = style({
  flex: 1,
  appearance: 'none',
  border: 'none',
  backgroundColor: 'transparent',
  color: 'inherit',
  fontSize: vars.typography.fontSizeSm,
  padding: 0,
  outline: 'none',
  minWidth: 0,
  selectors: {
    '&::placeholder': {
      color: vars.color.textSecondary,
    },
  },
});

export const editTextarea = style({
  width: '100%',
  minHeight: '72px',
  resize: 'vertical',
  appearance: 'none',
  border: 'none',
  backgroundColor: vars.color.bgSecondary,
  borderRadius: '6px',
  color: 'inherit',
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeXs,
  padding: '6px 10px',
  outline: 'none',
  selectors: {
    '&::placeholder': {
      color: vars.color.textSecondary,
      fontFamily: vars.typography.fontFamilySans,
    },
  },
});

export const editError = style({
  color: vars.color.alertCaution,
  fontSize: vars.typography.fontSizeSm,
});
