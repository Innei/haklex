import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const semanticClassNames = {
  card: 'rr-file-card',
  cardIcon: 'rr-file-card-icon',
  cardMeta: 'rr-file-card-meta',
  cardName: 'rr-file-card-name',
  cardSub: 'rr-file-card-sub',
  cardAction: 'rr-file-card-action',
  cardProgress: 'rr-file-card-progress',
  cardProgressFill: 'rr-file-card-progress-fill',
  chip: 'rr-file-chip',
  chipIcon: 'rr-file-chip-icon',
  chipName: 'rr-file-chip-name',
  editTrigger: 'rr-file-edit-trigger',
  editPanel: 'rr-file-edit-panel',
  editField: 'rr-file-edit-field',
  editInput: 'rr-file-edit-input',
  editError: 'rr-file-edit-error',
} as const;

const hoverBorder = `color-mix(in srgb, ${vars.color.border}, ${vars.color.text} 25%)`;

export const card = style({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  width: '100%',
  maxWidth: '35rem',
  margin: '1rem 0',
  padding: '0.75rem 1rem',
  border: `1px solid ${vars.color.border}`,
  borderRadius: '0.5rem',
  background: vars.color.bg,
  color: vars.color.text,
  fontFamily: vars.typography.fontFamilySans,
  textDecoration: 'none',
  transition: 'border-color 0.15s, background-color 0.15s',
  selectors: {
    'a&:hover': {
      borderColor: hoverBorder,
      backgroundColor: vars.color.fillTertiary,
    },
  },
});

export const cardStatic = style({});

export const cardIcon = style({
  flex: 'none',
  width: '1.25rem',
  height: '1.25rem',
  color: vars.color.textTertiary,
});

export const cardMeta = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
});

export const cardName = style({
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const cardSub = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '0.75rem',
  fontSize: '0.75rem',
  lineHeight: 1.4,
  color: vars.color.textTertiary,
  fontVariantNumeric: 'tabular-nums',
});

export const cardAction = style({
  flex: 'none',
  width: '1rem',
  height: '1rem',
  color: vars.color.textQuaternary,
  selectors: {
    [`${card}:hover &`]: {
      color: vars.color.text,
    },
  },
});

export const cardProgress = style({
  height: '3px',
  borderRadius: '2px',
  background: vars.color.fillSecondary,
  marginTop: '0.25rem',
  overflow: 'hidden',
});

export const cardProgressFill = style({
  display: 'block',
  height: '100%',
  borderRadius: '2px',
  background: vars.color.text,
  transition: 'width 0.2s ease',
});

export const cardError = style({
  borderColor: '#fecaca',
  background: 'color-mix(in srgb, #ef4444 6%, transparent)',
});

export const cardErrorText = style({
  color: '#b91c1c',
});

export const chip = style({
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  maxWidth: '16.25rem',
  padding: '0 0.4375rem 0 0.3125rem',
  border: `1px solid ${vars.color.border}`,
  borderRadius: '0.3125rem',
  background: vars.color.bg,
  color: vars.color.text,
  fontSize: '0.85em',
  lineHeight: 1.35,
  fontWeight: 500,
  verticalAlign: 'baseline',
  textDecoration: 'none',
  transition: 'border-color 0.15s, background-color 0.15s',
  selectors: {
    'a&:hover': {
      borderColor: hoverBorder,
      backgroundColor: vars.color.fillTertiary,
    },
  },
});

export const chipIcon = style({
  flex: 'none',
  width: '0.8125rem',
  height: '0.8125rem',
  color: vars.color.textTertiary,
});

export const chipName = style({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const editTrigger = style({
  display: 'block',
  cursor: 'pointer',
});

export const editTriggerInline = style({
  display: 'inline-block',
  cursor: 'pointer',
});

export const editPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  selectors: {
    '&&': {
      width: 'max-content',
      minWidth: '18rem',
      maxWidth: 'min(26rem, 92vw)',
    },
  },
});

export const editField = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const editFieldIcon = style({
  flex: 'none',
  color: vars.color.textTertiary,
});

export const editInput = style({
  'flex': 1,
  'minWidth': 0,
  'padding': '0.375rem 0.5rem',
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': '0.375rem',
  'background': vars.color.bg,
  'color': vars.color.text,
  'fontSize': '0.8125rem',
  'fontFamily': 'inherit',
  'outline': 'none',
  ':focus': {
    borderColor: hoverBorder,
  },
});

export const editError = style({
  fontSize: '0.75rem',
  color: '#b91c1c',
});
