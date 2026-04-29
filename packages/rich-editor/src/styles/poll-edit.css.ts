import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const editContainer = style({
  borderTop: `1px solid ${vars.color.hrBorder}`,
  borderBottom: `1px solid ${vars.color.hrBorder}`,
  padding: `${vars.spacing.md} 0`,
  margin: `${vars.spacing.lg} 0`,
});

export const editMeta = style({
  fontSize: '0.7rem',
  color: vars.color.textTertiary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: `0 0 ${vars.spacing.sm}`,
});

export const editQuestion = style({
  width: '100%',
  fontSize: '1rem',
  fontWeight: 600,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  padding: `${vars.spacing.xs} 0`,
  marginBottom: vars.spacing.xs,
  color: vars.color.text,
  fontFamily: 'inherit',
  selectors: {
    '&::placeholder': {
      color: vars.color.textTertiary,
      fontWeight: 400,
    },
  },
});

export const editOptionList = style({
  listStyle: 'none',
  padding: 0,
  margin: 0,
});

export const editOptionRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  padding: `${vars.spacing.xs} 0`,
});

export const editReorderColumn = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flexShrink: 0,
});

export const editReorderButton = style({
  width: 18,
  height: 14,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: vars.color.textTertiary,
  padding: 0,
  fontSize: '0.65rem',
  lineHeight: 1,
  borderRadius: 2,
  transition: 'color 120ms ease, background 120ms ease',
  selectors: {
    '&:hover:not(:disabled)': {
      color: vars.color.text,
      background: vars.color.fillTertiary,
    },
    '&:disabled': {
      opacity: 0.3,
      cursor: 'default',
    },
  },
});

export const editOptionInput = style({
  flex: 1,
  fontSize: '0.875rem',
  border: '1px solid transparent',
  borderBottom: `1px solid ${vars.color.hrBorder}`,
  outline: 'none',
  background: 'transparent',
  padding: `${vars.spacing.xs} 0`,
  color: vars.color.text,
  fontFamily: 'inherit',
  selectors: {
    '&:focus-visible': {
      borderBottomColor: vars.color.text,
    },
    '&::placeholder': {
      color: vars.color.textTertiary,
    },
  },
});

export const editRemoveButton = style({
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: vars.color.textTertiary,
  fontSize: '1rem',
  padding: '2px 6px',
  borderRadius: 2,
  transition: 'color 120ms ease',
  selectors: {
    '&:hover': {
      color: vars.color.text,
    },
  },
});

export const editAddOption = style({
  marginTop: vars.spacing.sm,
  border: `1px dashed ${vars.color.hrBorder}`,
  background: 'transparent',
  borderRadius: vars.borderRadius.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.md}`,
  fontSize: '0.8125rem',
  color: vars.color.textTertiary,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'color 120ms ease, border-color 120ms ease',
  selectors: {
    '&:hover': {
      color: vars.color.text,
      borderColor: vars.color.textSecondary,
    },
  },
});

export const editAdvancedSummary = style({
  marginTop: vars.spacing.md,
  fontSize: '0.75rem',
  color: vars.color.textTertiary,
  cursor: 'pointer',
  userSelect: 'none',
  listStyle: 'none',
  selectors: {
    '&::-webkit-details-marker': { display: 'none' },
    '&::marker': { display: 'none', content: '""' },
  },
});

export const editAdvancedGrid = style({
  display: 'grid',
  gridTemplateColumns: '120px 1fr',
  gap: vars.spacing.sm,
  marginTop: vars.spacing.sm,
  fontSize: '0.75rem',
  color: vars.color.textSecondary,
  alignItems: 'center',
});

export const editAdvancedLabel = style({
  color: vars.color.textTertiary,
});

export const editAdvancedInput = style({
  fontSize: '0.8125rem',
  border: `1px solid ${vars.color.hrBorder}`,
  borderRadius: vars.borderRadius.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  background: vars.color.bg,
  color: vars.color.text,
  fontFamily: 'inherit',
  outline: 'none',
  selectors: {
    '&:focus-visible': {
      borderColor: vars.color.text,
    },
  },
});

export const editModeRow = style({
  marginTop: vars.spacing.sm,
  display: 'flex',
  gap: vars.spacing.md,
  fontSize: '0.75rem',
  color: vars.color.textSecondary,
});

export const editModeLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  cursor: 'pointer',
});

export const pollEditClasses = {
  container: editContainer,
  meta: editMeta,
  question: editQuestion,
  optionList: editOptionList,
  optionRow: editOptionRow,
  reorderColumn: editReorderColumn,
  reorderButton: editReorderButton,
  optionInput: editOptionInput,
  removeButton: editRemoveButton,
  addOption: editAddOption,
  advancedSummary: editAdvancedSummary,
  advancedGrid: editAdvancedGrid,
  advancedLabel: editAdvancedLabel,
  advancedInput: editAdvancedInput,
  modeRow: editModeRow,
  modeLabel: editModeLabel,
} as const;
