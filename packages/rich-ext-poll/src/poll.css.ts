import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

const tintIdle = vars.color.fillTertiary;
const tintActive = vars.color.fillSecondary;

export const pollContainer = style({
  borderTop: `1px solid ${vars.color.hrBorder}`,
  borderBottom: `1px solid ${vars.color.hrBorder}`,
  padding: `${vars.spacing.lg} 0`,
  margin: `${vars.spacing.lg} 0`,
  fontFamily: 'inherit',
});

export const pollMeta = style({
  fontSize: '0.7rem',
  color: vars.color.textTertiary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: `0 0 ${vars.spacing.xs}`,
});

export const pollQuestion = style({
  fontSize: '1rem',
  fontWeight: 600,
  color: vars.color.text,
  margin: `0 0 ${vars.spacing.md}`,
  lineHeight: 1.5,
});

export const pollOptionList = style({
  listStyle: 'none',
  padding: 0,
  margin: 0,
});

export const pollOption = style({
  position: 'relative',
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  borderRadius: vars.borderRadius.sm,
  fontSize: '0.875rem',
  color: vars.color.textSecondary,
  transition: 'color 120ms ease',
});

export const pollOptionInteractive = style({
  cursor: 'pointer',
  userSelect: 'none',
  selectors: {
    '&:hover': {
      backgroundColor: tintIdle,
    },
  },
});

export const pollOptionSelected = style({
  fontWeight: 600,
  color: vars.color.text,
});

export const pollOptionDisabled = style({
  cursor: 'default',
});

export const pollTint = style({
  position: 'absolute',
  inset: '0 auto 0 0',
  background: tintIdle,
  borderRadius: vars.borderRadius.sm,
  width: 0,
  pointerEvents: 'none',
  transition: 'width 320ms cubic-bezier(0.4, 0, 0.2, 1), background 200ms ease',
});

export const pollTintActive = style({
  background: tintActive,
});

export const pollOptionRow = style({
  position: 'relative',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: vars.spacing.sm,
});

export const pollOptionLabel = style({
  flex: 1,
  minWidth: 0,
});

export const pollOptionPct = style({
  fontVariantNumeric: 'tabular-nums',
  fontSize: '0.8125rem',
  color: vars.color.textTertiary,
  flexShrink: 0,
});

export const pollOptionPctActive = style({
  color: vars.color.text,
});

export const pollHint = style({
  fontSize: '0.75rem',
  color: vars.color.textTertiary,
  opacity: 0,
  transition: 'opacity 120ms ease',
  flexShrink: 0,
});

globalStyle(`${pollOption}:hover ${pollHint}`, {
  opacity: 1,
});

export const pollSubmit = style({
  marginTop: vars.spacing.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.md}`,
  border: `1px solid ${vars.color.hrBorder}`,
  borderRadius: vars.borderRadius.sm,
  background: 'transparent',
  fontSize: '0.8125rem',
  color: vars.color.textTertiary,
  cursor: 'not-allowed',
  fontFamily: 'inherit',
  transition: 'color 120ms ease, border-color 120ms ease',
});

export const pollSubmitActive = style({
  color: vars.color.text,
  borderColor: vars.color.text,
  cursor: 'pointer',
});

export const pollFooter = style({
  fontSize: '0.75rem',
  color: vars.color.textTertiary,
  marginTop: vars.spacing.md,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: vars.spacing.sm,
});

export const pollErrorMessage = style({
  fontSize: '0.75rem',
  color: vars.color.textTertiary,
  marginTop: vars.spacing.sm,
});

export const pollSkeleton = style({
  height: '1.25rem',
  borderRadius: vars.borderRadius.sm,
  background: tintIdle,
  margin: `${vars.spacing.xs} 0`,
});

export const pollClasses = {
  container: pollContainer,
  meta: pollMeta,
  question: pollQuestion,
  optionList: pollOptionList,
  option: pollOption,
  optionInteractive: pollOptionInteractive,
  optionSelected: pollOptionSelected,
  optionDisabled: pollOptionDisabled,
  tint: pollTint,
  tintActive: pollTintActive,
  optionRow: pollOptionRow,
  optionLabel: pollOptionLabel,
  optionPct: pollOptionPct,
  optionPctActive: pollOptionPctActive,
  hint: pollHint,
  submit: pollSubmit,
  submitActive: pollSubmitActive,
  footer: pollFooter,
  errorMessage: pollErrorMessage,
  skeleton: pollSkeleton,
} as const;
