import { vars } from '@haklex/rich-style-token';
import { style } from '@vanilla-extract/css';

export const modalBody = style({
  display: 'flex',
  height: 420,
  width: 580,
});

export const sidebar = style({
  width: 180,
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
  'padding': 8,
  'borderRadius': 6,
  'fontSize': 13,
  'cursor': 'pointer',
  'marginBottom': 4,
  ':hover': {
    background: vars.color.bgTertiary,
  },
});

export const providerItemActive = style({
  background: vars.color.bgTertiary,
  border: `1px solid ${vars.color.border}`,
});

export const providerItemName = style({
  color: vars.color.text,
});

export const providerItemType = style({
  fontSize: 11,
  color: vars.color.textQuaternary,
  marginTop: 2,
});

export const addButton = style({
  'padding': 8,
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
  padding: 16,
  overflowY: 'auto',
});

export const formHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
});

export const formTitle = style({
  fontSize: 15,
  fontWeight: 600,
  color: vars.color.text,
});

export const typeBadge = style({
  fontSize: 11,
  padding: '3px 8px',
  borderRadius: 4,
  background: vars.color.bgTertiary,
  color: vars.color.textTertiary,
});

export const fieldGroup = style({
  marginBottom: 14,
});

export const fieldLabel = style({
  fontSize: 12,
  color: vars.color.textTertiary,
  marginBottom: 4,
});

export const fieldInput = style({
  'width': '100%',
  'padding': '7px 10px',
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
});

export const actions = style({
  display: 'flex',
  gap: 8,
  marginTop: 20,
});

export const actionButton = style({
  'padding': '6px 14px',
  'background': vars.color.bgTertiary,
  'borderRadius': 6,
  'fontSize': 12,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'border': 'none',
  'flex': 1,
  'textAlign': 'center',
  ':hover': {
    background: vars.color.bgTertiary,
  },
});

export const deleteButton = style({
  'padding': '6px 14px',
  'background': 'rgb(239, 68, 68)',
  'borderRadius': 6,
  'fontSize': 12,
  'color': '#fff',
  'cursor': 'pointer',
  'border': 'none',
  ':hover': {
    background: 'rgb(220, 38, 38)',
  },
});

export const modelTags = style({
  marginTop: 16,
  borderTop: `1px solid ${vars.color.border}`,
  paddingTop: 12,
});

export const modelTagsLabel = style({
  fontSize: 11,
  color: vars.color.textQuaternary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: 6,
});

export const modelTagList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 4,
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
  gap: 8,
  padding: 16,
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
});

export const typeSelectorTitle = style({
  fontSize: 14,
  color: vars.color.text,
  marginBottom: 8,
});

export const typeOption = style({
  'padding': '12px 16px',
  'borderRadius': 8,
  'border': `1px solid ${vars.color.border}`,
  'cursor': 'pointer',
  'width': '100%',
  'maxWidth': 260,
  ':hover': {
    background: vars.color.bgTertiary,
    borderColor: vars.color.textTertiary,
  },
});

export const typeOptionName = style({
  fontSize: 14,
  fontWeight: 600,
  color: vars.color.text,
  marginBottom: 2,
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
