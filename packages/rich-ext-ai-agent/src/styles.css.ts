import { createVar, style } from '@vanilla-extract/css';

export const diffInsertBg = createVar();
export const diffDeleteBg = createVar();

export const diffVars = style({
  vars: {
    [diffInsertBg]: 'rgba(34, 197, 94, 0.15)',
    [diffDeleteBg]: 'rgba(239, 68, 68, 0.15)',
  },
});

export const diffInsertBlock = style({
  background: diffInsertBg,
  borderLeft: '3px solid rgb(34, 197, 94)',
  position: 'relative',
});

export const diffDeleteBlock = style({
  background: diffDeleteBg,
  borderLeft: '3px solid rgb(239, 68, 68)',
  textDecoration: 'line-through',
  opacity: 0.6,
  position: 'relative',
});

export const diffReplaceOriginal = style({
  background: diffDeleteBg,
  borderLeft: '3px solid rgb(239, 68, 68)',
  textDecoration: 'line-through',
  opacity: 0.6,
});

export const diffReplaceNew = style({
  background: diffInsertBg,
  borderLeft: '3px solid rgb(34, 197, 94)',
});

export const diffActions = style({
  position: 'absolute',
  top: '4px',
  right: '4px',
  display: 'flex',
  gap: '4px',
});

export const actionBar = style({
  display: 'flex',
  gap: '8px',
  padding: '8px 12px',
  borderBottom: '1px solid #e5e5e5',
  alignItems: 'center',
  fontSize: '13px',
});
