import { chromeRadius, chromeText, focusRing, vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const semanticClassNames = {
  root: 'rich-dynamic-root',
  host: 'rich-dynamic-host',
  placeholder: 'rich-dynamic-placeholder',
  error: 'rich-dynamic-error',
  settingsButton: 'rich-dynamic-settings-button',
  editPanel: 'rich-dynamic-edit-panel',
  editTextarea: 'rich-dynamic-edit-textarea',
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

export const editPanel = style({});

export const editTextarea = style({
  ...chromeText.mono,
  boxSizing: 'border-box',
  display: 'block',
  width: '100%',
  minHeight: 96,
  padding: '6px 8px',
  lineHeight: '18px',
  resize: 'vertical',
  border: 'none',
  borderRadius: chromeRadius.md,
  backgroundColor: vars.color.bg,
  color: vars.color.text,
  boxShadow: `0 0 0 1px ${vars.color.ring}`,
  outline: 'none',
  selectors: {
    '&::placeholder': {
      color: vars.color.textTertiary,
    },
    '&:focus': {
      boxShadow: focusRing,
    },
    '&[aria-invalid="true"]': {
      boxShadow: `0 0 0 1px ${vars.color.alertCaution}`,
    },
  },
});

export const footerNote = style({
  ...chromeText.label,
  fontWeight: 400,
  color: vars.color.textTertiary,
});
