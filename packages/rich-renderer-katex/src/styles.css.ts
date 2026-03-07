import { vars } from '@haklex/rich-style-token/styles'
import { style } from '@vanilla-extract/css'

export const semanticClassNames = {
  editWrapper: 'rich-katex-edit-wrapper',
  panel: 'rich-katex-editor-panel',
  header: 'rich-katex-editor-header',
  headerLeft: 'rich-katex-editor-header-left',
  iconWrap: 'rich-katex-editor-icon-wrap',
  title: 'rich-katex-editor-title',
  headerRight: 'rich-katex-editor-header-right',
  mode: 'rich-katex-editor-mode',
  deleteButton: 'rich-katex-editor-delete',
  tabs: 'rich-katex-editor-tabs',
  bodyScrollArea: 'rich-katex-editor-body-scroll-area',
  body: 'rich-katex-editor-body',
  field: 'rich-katex-editor-field',
  label: 'rich-katex-editor-label',
  inputWrap: 'rich-katex-editor-input-wrap',
  textarea: 'rich-katex-editor-textarea',
  inputActions: 'rich-katex-editor-input-actions',
  actionButton: 'rich-katex-editor-action-btn',
  preview: 'rich-katex-editor-preview',
  previewEmpty: 'rich-katex-editor-preview-empty',
  snippetSearchWrap: 'rich-katex-editor-snippet-search-wrap',
  snippetSearchIcon: 'rich-katex-editor-snippet-search-icon',
  snippetSearchInput: 'rich-katex-editor-snippet-search-input',
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
  footerActions: 'rich-katex-editor-footer-actions',
  footerButton: 'rich-katex-editor-btn',
  footerButtonPrimary: 'rich-katex-editor-btn-primary',
} as const

export const editWrapper = style({
  cursor: 'pointer',
  borderRadius: vars.borderRadius.sm,
  transition: 'background-color 0.15s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.accentLight,
    },
  },
})

export const panel = style({
  width: 'min(420px, 90vw)',
  padding: 0,
  overflow: 'hidden',
  boxShadow: vars.boxShadow.modal,
  fontFamily: vars.typography.fontFamily,
})

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  borderBottom: `1px solid color-mix(in srgb, ${vars.color.border} 60%, transparent)`,
})

export const headerLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

export const iconWrap = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.color.accentLight,
  color: vars.color.accent,
})

export const title = style({
  fontWeight: 600,
  fontSize: vars.typography.fontSizeMd,
  color: vars.color.text,
})

export const headerRight = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
})

export const mode = style({
  fontSize: vars.typography.fontSize2xs,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: vars.color.textSecondary,
  padding: '1px 6px',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.color.bgSecondary,
})

export const deleteButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  width: '28px',
  height: '28px',
  borderRadius: vars.borderRadius.sm,
  transition: 'color 0.15s ease, background-color 0.15s ease',
  flexShrink: 0,
  selectors: {
    '&:hover': {
      color: vars.color.alertCaution,
      backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
    },
  },
})

export const tabs = style({
  padding: '0 16px',
})

export const bodyScrollArea = style({
  maxHeight: '320px',
  overflowY: 'auto',
  overflowX: 'hidden',
  flexShrink: 0,
})

export const body = style({
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

export const field = style({
  display: 'flex',
  flexDirection: 'column',
})

export const label = style({
  fontSize: vars.typography.fontSize2xs,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: vars.color.textSecondary,
  marginBottom: '6px',
  paddingLeft: '2px',
})

export const inputWrap = style({
  position: 'relative',
})

export const textarea = style({
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  paddingRight: '56px',
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeMd,
  lineHeight: '1.5',
  backgroundColor: `color-mix(in srgb, ${vars.color.bgSecondary} 30%, transparent)`,
  color: vars.color.text,
  border: `1px solid color-mix(in srgb, ${vars.color.border} 60%, transparent)`,
  borderRadius: vars.borderRadius.md,
  outline: 'none',
  resize: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  selectors: {
    '&::placeholder': {
      color: `color-mix(in srgb, ${vars.color.textSecondary} 50%, transparent)`,
    },
    '&:focus': {
      borderColor: `color-mix(in srgb, ${vars.color.accent} 50%, transparent)`,
      boxShadow: `0 0 0 2px color-mix(in srgb, ${vars.color.accent} 25%, transparent)`,
    },
  },
})

export const inputActions = style({
  position: 'absolute',
  right: '6px',
  top: '6px',
  display: 'flex',
  gap: '2px',
})

export const actionButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: `color-mix(in srgb, ${vars.color.textSecondary} 60%, transparent)`,
  cursor: 'pointer',
  width: '24px',
  height: '24px',
  borderRadius: vars.borderRadius.sm,
  transition: 'color 0.15s ease, background-color 0.15s ease',
  selectors: {
    '&:hover': {
      color: vars.color.text,
      backgroundColor: vars.color.fillSecondary,
    },
    '&:disabled': {
      opacity: 0.3,
      cursor: 'default',
      pointerEvents: 'none',
    },
  },
})

export const preview = style({
  border: `1px solid color-mix(in srgb, ${vars.color.border} 60%, transparent)`,
  borderRadius: vars.borderRadius.md,
  padding: vars.spacing.md,
  minHeight: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflowX: 'auto',
  backgroundColor: vars.color.bg,
})

export const previewEmpty = style({
  color: `color-mix(in srgb, ${vars.color.textSecondary} 50%, transparent)`,
  fontSize: vars.typography.fontSizeMd,
})

export const snippetSearchWrap = style({
  position: 'relative',
})

export const snippetSearchIcon = style({
  position: 'absolute',
  left: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: `color-mix(in srgb, ${vars.color.textSecondary} 70%, transparent)`,
  pointerEvents: 'none',
})

export const snippetSearchInput = style({
  width: '100%',
  height: '34px',
  padding: '0 12px 0 32px',
  borderRadius: vars.borderRadius.md,
  border: `1px solid color-mix(in srgb, ${vars.color.border} 60%, transparent)`,
  backgroundColor: `color-mix(in srgb, ${vars.color.bgSecondary} 24%, transparent)`,
  color: vars.color.text,
  outline: 'none',
  boxSizing: 'border-box',
  fontSize: vars.typography.fontSizeSm,
  selectors: {
    '&::placeholder': {
      color: `color-mix(in srgb, ${vars.color.textSecondary} 55%, transparent)`,
    },
    '&:focus': {
      borderColor: `color-mix(in srgb, ${vars.color.accent} 45%, transparent)`,
      boxShadow: `0 0 0 2px color-mix(in srgb, ${vars.color.accent} 18%, transparent)`,
    },
  },
})

export const snippetGroups = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

export const snippetGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
})

export const snippetGroupLabel = style({
  fontSize: vars.typography.fontSize2xs,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: vars.color.textSecondary,
  paddingLeft: '2px',
})

export const snippetList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
})

export const snippetButton = style({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  textAlign: 'left',
  border: `1px solid color-mix(in srgb, ${vars.color.border} 55%, transparent)`,
  borderRadius: vars.borderRadius.md,
  backgroundColor: `color-mix(in srgb, ${vars.color.bgSecondary} 18%, transparent)`,
  padding: '10px 12px',
  cursor: 'pointer',
  transition:
    'border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease',
  selectors: {
    '&:hover': {
      borderColor: `color-mix(in srgb, ${vars.color.accent} 30%, ${vars.color.border})`,
      backgroundColor: `color-mix(in srgb, ${vars.color.accentLight} 30%, ${vars.color.bgSecondary})`,
      transform: 'translateY(-1px)',
    },
  },
})

export const snippetMeta = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minWidth: 0,
  flex: 1,
})

export const snippetName = style({
  fontSize: vars.typography.fontSizeSm,
  fontWeight: 600,
  color: vars.color.text,
})

export const snippetHint = style({
  fontSize: vars.typography.fontSize2xs,
  fontFamily: vars.typography.fontMono,
  color: vars.color.textSecondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const snippetPreview = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '72px',
  minHeight: '32px',
  padding: '0 8px',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.color.bg,
  color: vars.color.text,
  overflow: 'hidden',
  flexShrink: 0,
})

export const snippetsPlaceholder = style({
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeSm,
  textAlign: 'center',
  padding: `${vars.spacing.lg} ${vars.spacing.md}`,
  border: `1px dashed color-mix(in srgb, ${vars.color.border} 60%, transparent)`,
  borderRadius: vars.borderRadius.md,
  backgroundColor: `color-mix(in srgb, ${vars.color.bgSecondary} 16%, transparent)`,
})

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  borderTop: `1px solid color-mix(in srgb, ${vars.color.border} 60%, transparent)`,
  backgroundColor: `color-mix(in srgb, ${vars.color.bgSecondary} 20%, transparent)`,
})

export const charCount = style({
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSize2xs,
  fontFamily: vars.typography.fontMono,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '200px',
})

export const footerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

export const footerButton = style({
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  padding: '4px 10px',
  borderRadius: vars.borderRadius.sm,
  fontSize: vars.typography.fontSizeXs,
  fontWeight: 500,
  lineHeight: 1.4,
  height: '28px',
  display: 'inline-flex',
  alignItems: 'center',
  transition: 'color 0.15s ease, background-color 0.15s ease',
  selectors: {
    '&:hover': {
      color: vars.color.text,
      backgroundColor: vars.color.fillSecondary,
    },
  },
})

export const footerButtonPrimary = style({
  backgroundColor: vars.color.accent,
  color: '#fff',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.accent,
      filter: 'brightness(0.9)',
      color: '#fff',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'default',
      pointerEvents: 'none',
    },
  },
})
