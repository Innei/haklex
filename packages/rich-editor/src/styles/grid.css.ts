import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const gridClassNames = {
  container: 'rich-grid-container',
  toolbar: 'rich-grid-toolbar',
  toolbarIcon: 'rich-grid-toolbar-icon',
  colButton: 'rich-grid-col-btn',
  colButtonActive: 'rich-grid-col-btn-active',
  toolbarDivider: 'rich-grid-toolbar-divider',
  actionButton: 'rich-grid-action-btn',
  inner: 'rich-grid-inner',
  cell: 'rich-grid-cell',
  cellEditable: 'rich-grid-cell-editable',
} as const;

export const container = style({
  position: 'relative',
  margin: `${vars.spacing.md} 0`,
});

export const toolbar = style({
  position: 'absolute',
  top: -36,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  padding: '4px 6px',
  borderRadius: vars.borderRadius.md,
  pointerEvents: 'none',
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  boxShadow: vars.boxShadow.topBar,
  zIndex: 10,
  userSelect: 'none',
  whiteSpace: 'nowrap',
  opacity: 0,
  transition: 'opacity 0.15s ease',
});

export const toolbarIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  color: vars.color.textSecondary,
  flexShrink: 0,
});

export const colButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 24,
  height: 24,
  padding: '0 6px',
  borderRadius: vars.borderRadius.sm,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 500,
  color: vars.color.textSecondary,
  lineHeight: 1,
  transition: 'color 0.15s ease, background-color 0.15s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.fillSecondary,
      color: vars.color.text,
    },
  },
});

export const colButtonActive = style({
  background: vars.color.fill,
  fontWeight: 600,
  color: vars.color.text,
});

export const toolbarDivider = style({
  width: 1,
  height: 16,
  background: vars.color.border,
  margin: '0 2px',
  flexShrink: 0,
});

export const actionButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 24,
  height: 24,
  padding: '0 6px',
  borderRadius: vars.borderRadius.sm,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: vars.color.textSecondary,
  transition: 'color 0.15s ease, background-color 0.15s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.fillSecondary,
      color: vars.color.text,
    },
  },
});

export const inner = style({
  display: 'grid',
  gap: vars.spacing.md,
});

export const cell = style({
  minWidth: 0,
});

export const cellEditable = style({
  outline: 'none',
});

globalStyle(`${container}:hover ${toolbar}, ${container}:focus-within ${toolbar}`, {
  opacity: 1,
  pointerEvents: 'auto',
});

export const gridStyles = {
  container,
  toolbar,
  toolbarIcon,
  colButton,
  colButtonActive,
  toolbarDivider,
  actionButton,
  inner,
  cell,
  cellEditable,
} as const;
