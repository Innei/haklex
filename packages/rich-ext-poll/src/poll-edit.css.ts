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
  height: 16,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: vars.color.textTertiary,
  padding: 0,
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
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: vars.color.textTertiary,
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
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  marginTop: vars.spacing.sm,
  border: `1px dashed ${vars.color.hrBorder}`,
  background: 'transparent',
  borderRadius: vars.borderRadius.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.md}`,
  fontSize: '0.875rem',
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
  fontSize: '0.875rem',
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
  fontSize: '0.875rem',
  color: vars.color.textSecondary,
  alignItems: 'center',
});

export const editAdvancedLabel = style({
  color: vars.color.textTertiary,
});

export const editDateTimeField = style({
  display: 'grid',
  gridTemplateColumns: '16px minmax(0, 1fr)',
  alignItems: 'center',
  gap: vars.spacing.xs,
  minWidth: 0,
  minHeight: 32,
  border: `1px solid ${vars.color.hrBorder}`,
  borderRadius: vars.borderRadius.sm,
  padding: `0 ${vars.spacing.sm}`,
  background: vars.color.bg,
  color: vars.color.text,
  transition: 'border-color 120ms ease, box-shadow 120ms ease',
  selectors: {
    '&:focus-within': {
      borderColor: vars.color.text,
      boxShadow: `0 0 0 2px color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
    },
  },
});

export const editDateTimeIcon = style({
  color: vars.color.textTertiary,
  pointerEvents: 'none',
  flexShrink: 0,
});

export const editDateTimeInput = style({
  width: '100%',
  minWidth: 0,
  border: 'none',
  background: 'transparent',
  color: vars.color.text,
  fontFamily: 'inherit',
  fontSize: '0.875rem',
  lineHeight: 1.35,
  outline: 'none',
  colorScheme: 'light dark',
  selectors: {
    '&::-webkit-calendar-picker-indicator': {
      opacity: 0.55,
      cursor: 'pointer',
    },
    '&::-webkit-datetime-edit': {
      padding: 0,
    },
    '&::-webkit-datetime-edit-fields-wrapper': {
      padding: 0,
    },
  },
});

export const editSelectTrigger = style({
  width: '100%',
  minWidth: 0,
  height: 32,
  fontSize: '0.875rem',
  background: vars.color.bg,
  borderColor: vars.color.hrBorder,
  boxShadow: 'none',
  selectors: {
    '&:focus-visible': {
      borderColor: vars.color.text,
      boxShadow: `0 0 0 2px color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
    },
  },
});

export const editSelectContent = style({
  minWidth: 'var(--anchor-width)',
});

export const editModeRow = style({
  marginTop: vars.spacing.sm,
  display: 'grid',
  gridTemplateColumns: '120px max-content',
  gap: vars.spacing.sm,
  alignItems: 'center',
  fontSize: '0.875rem',
});

export const editModeControl = style({
  width: 'max-content',
  justifySelf: 'start',
  fontSize: '0.875rem',
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
  dateTimeField: editDateTimeField,
  dateTimeIcon: editDateTimeIcon,
  dateTimeInput: editDateTimeInput,
  selectTrigger: editSelectTrigger,
  selectContent: editSelectContent,
  modeRow: editModeRow,
  modeControl: editModeControl,
} as const;
