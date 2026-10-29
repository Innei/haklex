import { chromeRadius, chromeText, focusRing, vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const semanticClassNames = {
  editWrapper: 'rich-katex-edit-wrapper',
  panel: 'rich-katex-editor-panel',
  header: 'rich-katex-editor-header',
  tabs: 'rich-katex-editor-tabs',
  bodyScrollArea: 'rich-katex-editor-body-scroll-area',
  body: 'rich-katex-editor-body',
  textarea: 'rich-katex-editor-textarea',
  preview: 'rich-katex-editor-preview',
  previewEmpty: 'rich-katex-editor-preview-empty',
  snippetGroups: 'rich-katex-editor-snippet-groups',
  snippetGroup: 'rich-katex-editor-snippet-group',
  snippetGroupLabel: 'rich-katex-editor-snippet-group-label',
  snippetList: 'rich-katex-editor-snippet-list',
  snippetButton: 'rich-katex-editor-snippet-button',
  snippetMeta: 'rich-katex-editor-snippet-meta',
  snippetName: 'rich-katex-editor-snippet-name',
  snippetHint: 'rich-katex-editor-snippet-hint',
  snippetPreview: 'rich-katex-editor-snippet-preview',
  snippetsPlaceholder: 'rich-katex-editor-snippets-placeholder',
  footer: 'rich-katex-editor-footer',
  charCount: 'rich-katex-editor-charcount',
} as const;

export const editWrapper = style({
  cursor: 'pointer',
  borderRadius: vars.borderRadius.sm,
  transition: 'background-color 0.15s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.accentLight,
    },
  },
});

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const tabs = style({
  width: 150,
});

export const bodyScrollArea = style({
  maxHeight: 320,
  overflowY: 'auto',
  overflowX: 'hidden',
});

export const textarea = style({
  ...chromeText.mono,
  display: 'block',
  width: '100%',
  minHeight: 56,
  padding: '6px 8px',
  lineHeight: '18px',
  backgroundColor: vars.color.bg,
  color: vars.color.text,
  border: 'none',
  borderRadius: chromeRadius.md,
  boxShadow: `0 0 0 1px ${vars.color.ring}`,
  outline: 'none',
  resize: 'vertical',
  boxSizing: 'border-box',
  selectors: {
    '&::placeholder': {
      color: vars.color.textTertiary,
    },
    '&:focus-visible, &:focus': {
      boxShadow: focusRing,
    },
  },
});

export const preview = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 52,
  padding: '8px 12px',
  overflowX: 'auto',
  borderRadius: chromeRadius.md,
  backgroundColor: vars.color.bgSecondary,
  color: vars.color.text,
});

export const previewEmpty = style({
  ...chromeText.label,
  fontWeight: 400,
  color: vars.color.textTertiary,
});

export const snippetGroups = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const snippetGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const snippetGroupLabel = style({
  ...chromeText.label,
  color: vars.color.textSecondary,
});

export const snippetList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
});

export const snippetButton = style({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  textAlign: 'left',
  border: 'none',
  borderRadius: chromeRadius.md,
  backgroundColor: 'transparent',
  padding: '6px 8px',
  font: 'inherit',
  color: vars.color.text,
  cursor: 'pointer',
  transition: 'background-color 0.15s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.fillSecondary,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: focusRing,
    },
  },
});

export const snippetMeta = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 0,
  flex: 1,
});

export const snippetName = style({
  ...chromeText.control,
  fontWeight: 500,
  color: vars.color.text,
});

export const snippetHint = style({
  ...chromeText.mono,
  color: vars.color.textSecondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const snippetPreview = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 72,
  minHeight: 32,
  padding: '0 8px',
  borderRadius: chromeRadius.sm,
  backgroundColor: vars.color.bgSecondary,
  color: vars.color.text,
  overflow: 'hidden',
  flexShrink: 0,
});

export const snippetsPlaceholder = style({
  ...chromeText.control,
  color: vars.color.textSecondary,
  textAlign: 'center',
  padding: '16px 12px',
});
