import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const dialogPopup = style({
  width: 620,
  maxWidth: 'calc(100vw - 2rem)',
});

export const modalBody = style({
  display: 'flex',
  height: 420,
  borderTop: `1px solid ${vars.color.border}`,
});

export const sidebar = style({
  width: 200,
  borderRight: `1px solid ${vars.color.border}`,
  padding: 12,
  flexShrink: 0,
  overflowY: 'auto',
});

export const sidebarLabel = style({
  fontSize: 11,
  color: vars.color.textQuaternary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  padding: '0 4px',
  marginBottom: 8,
});

export const providerItem = style({
  'padding': '8px 10px',
  'borderRadius': 6,
  'fontSize': 13,
  'cursor': 'pointer',
  'marginBottom': 2,
  'border': '1px solid transparent',
  ':hover': {
    background: vars.color.bgTertiary,
  },
});

export const providerItemActive = style({
  background: vars.color.bgTertiary,
  borderColor: vars.color.border,
});

export const providerItemName = style({
  color: vars.color.text,
  fontWeight: 500,
});

export const providerItemType = style({
  fontSize: 11,
  color: vars.color.textQuaternary,
  marginTop: 2,
});

export const addButton = style({
  'padding': '8px 10px',
  'borderRadius': 6,
  'marginTop': 8,
  'border': `1px dashed ${vars.color.border}`,
  'textAlign': 'center',
  'fontSize': 12,
  'color': vars.color.textQuaternary,
  'cursor': 'pointer',
  ':hover': {
    borderColor: vars.color.textTertiary,
    color: vars.color.textTertiary,
  },
});

export const formPane = style({
  flex: 1,
  padding: '20px 24px',
  overflowY: 'auto',
});

export const formHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 20,
});

export const formTitle = style({
  fontSize: 15,
  fontWeight: 600,
  color: vars.color.text,
});

export const formTitleInput = style({
  fontSize: 15,
  fontWeight: 600,
  color: vars.color.text,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  padding: 0,
  width: '100%',
});

export const typeBadge = style({
  fontSize: 11,
  padding: '3px 8px',
  borderRadius: 4,
  background: vars.color.bgTertiary,
  color: vars.color.textTertiary,
  whiteSpace: 'nowrap',
  flexShrink: 0,
});

export const fieldGroup = style({
  marginBottom: 16,
});

export const fieldLabel = style({
  fontSize: 12,
  color: vars.color.textTertiary,
  marginBottom: 6,
});

export const fieldInput = style({
  'width': '100%',
  'padding': '8px 10px',
  'background': vars.color.bgSecondary,
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': 6,
  'fontSize': 13,
  'color': vars.color.text,
  'outline': 'none',
  'fontFamily': 'monospace',
  'boxSizing': 'border-box',
  ':focus': {
    borderColor: vars.color.textTertiary,
  },
  '::placeholder': {
    color: vars.color.textQuaternary,
  },
});

export const actions = style({
  display: 'flex',
  gap: 8,
  marginTop: 24,
});

export const actionButton = style({
  'padding': '7px 14px',
  'background': vars.color.bgTertiary,
  'borderRadius': 6,
  'fontSize': 12,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'border': `1px solid ${vars.color.border}`,
  'flex': 1,
  'textAlign': 'center',
  ':hover': {
    borderColor: vars.color.textTertiary,
    color: vars.color.text,
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const deleteButton = style({
  'padding': '7px 14px',
  'background': 'transparent',
  'borderRadius': 6,
  'fontSize': 12,
  'color': 'rgb(239, 68, 68)',
  'cursor': 'pointer',
  'border': '1px solid rgb(239, 68, 68)',
  ':hover': {
    background: 'rgb(239, 68, 68)',
    color: '#fff',
  },
});

export const modelTags = style({
  marginTop: 20,
  borderTop: `1px solid ${vars.color.border}`,
  paddingTop: 14,
});

export const modelTagsLabel = style({
  fontSize: 11,
  color: vars.color.textQuaternary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: 8,
});

export const modelTagList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
});

export const modelTag = style({
  padding: '3px 8px',
  background: vars.color.bgTertiary,
  borderRadius: 4,
  fontSize: 11,
  color: vars.color.textSecondary,
});

export const typeSelector = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: 4,
});

export const typeSelectorTitle = style({
  fontSize: 13,
  fontWeight: 500,
  color: vars.color.textTertiary,
  marginBottom: 12,
});

export const presetGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 8,
});

export const typeOption = style({
  'padding': '12px 14px',
  'borderRadius': 8,
  'border': `1px solid ${vars.color.border}`,
  'cursor': 'pointer',
  'transition': 'border-color 0.15s, background 0.15s',
  ':hover': {
    background: vars.color.bgTertiary,
    borderColor: vars.color.textTertiary,
  },
});

export const typeOptionName = style({
  fontSize: 14,
  fontWeight: 600,
  color: vars.color.text,
  marginBottom: 3,
});

export const typeOptionDesc = style({
  fontSize: 12,
  color: vars.color.textQuaternary,
});

export const emptyForm = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  fontSize: 13,
  color: vars.color.textQuaternary,
});
