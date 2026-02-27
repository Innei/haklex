import { vars } from '@haklex/rich-style-token'
import { globalStyle, style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const semanticClassNames = {
  container: 'rcs-container',
  header: 'rcs-header',
  tabs: 'rcs-tabs',
  tab: 'rcs-tab',
  tabActive: 'rcs-tab-active',
  titleBar: 'rcs-title-bar',
  headerActions: 'rcs-header-actions',
  copyButton: 'rcs-copy-btn',
  separator: 'rcs-separator',
  codePanel: 'rcs-code-panel',
  codeScroll: 'rcs-code-scroll',
  codeBody: 'rcs-code-body',
  fileIcon: 'rcs-file-icon',
  editContainer: 'rcs-edit-container',
  editOverlay: 'rcs-edit-overlay',
  editLabel: 'rcs-edit-label',
  modal: 'rcs-modal',
  modalTitlebar: 'rcs-modal-titlebar',
  modalTitle: 'rcs-modal-title',
  modalIconButton: 'rcs-modal-icon-btn',
  modalBody: 'rcs-modal-body',
  modalSidebar: 'rcs-modal-sidebar',
  sidebarHeader: 'rcs-sidebar-header',
  sidebarAddButton: 'rcs-sidebar-add-btn',
  fileList: 'rcs-file-list',
  fileItem: 'rcs-file-item',
  fileItemActive: 'rcs-file-item-active',
  fileItemDragging: 'rcs-file-item-dragging',
  fileDragHandle: 'rcs-file-drag-handle',
  fileName: 'rcs-file-name',
  fileDelete: 'rcs-file-delete',
  renameInput: 'rcs-rename-input',
  modalEditor: 'rcs-modal-editor',
  breadcrumb: 'rcs-breadcrumb',
  breadcrumbLeft: 'rcs-breadcrumb-left',
  breadcrumbName: 'rcs-breadcrumb-name',
  breadcrumbLang: 'rcs-breadcrumb-lang',
  editorContainer: 'rcs-editor-container',
  dragOverlay: 'rcs-drag-overlay',
} as const

export const container = style({
  position: 'relative',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  border: `1px solid color-mix(in srgb, ${vars.color.border} 60%, transparent)`,
  background: vars.color.codeBg,
  fontSize: vars.typography.fontSizeMd,
})

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 12px',
  minHeight: 40,
})

export const tabs = style({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  overflowX: 'auto',
  scrollbarWidth: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
})

const tabBase = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  fontSize: vars.typography.fontSizeXs,
  fontFamily: vars.typography.fontMono,
  fontWeight: 500,
  color: vars.color.textSecondary,
  background: 'transparent',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  transition: 'color 0.15s, background 0.15s',
  selectors: {
    '&:hover': {
      color: vars.color.text,
      background: `color-mix(in srgb, ${vars.color.text} 5%, transparent)`,
    },
  },
})

export const tab = recipe({
  base: tabBase,
  variants: {
    active: {
      true: {
        color: vars.color.text,
        background: vars.color.bgTertiary,
      },
      false: {},
    },
  },
  defaultVariants: {
    active: false,
  },
})

export const titleBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 0',
  fontSize: vars.typography.fontSizeXs,
  fontFamily: vars.typography.fontMono,
  fontWeight: 500,
  color: vars.color.textSecondary,
})

export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  opacity: 0,
  transition: 'opacity 0.15s',
  selectors: {
    [`${container}:hover &`]: {
      opacity: 1,
    },
  },
})

export const copyButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: 6,
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
  selectors: {
    '&:hover': {
      background: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
      color: vars.color.text,
    },
  },
})

export const separator = style({
  height: 1,
  background: vars.color.border,
  opacity: 0.6,
})

export const codeScroll = style({
  overflowX: 'auto',
})

export const codeBody = style({
  padding: '12px 16px',
  margin: 0,
  fontSize: vars.typography.fontSizeSm,
  lineHeight: 1.7,
  fontFamily: vars.typography.fontMono,
})

globalStyle(`${codeBody} pre`, {
  margin: 0,
  background: 'transparent !important',
})

globalStyle(`${codeBody} code`, {
  fontFamily: 'inherit',
})

/* ---- Shiki dual-theme: dark mode variable switch ---- */
globalStyle(
  `[data-theme='dark'] ${codeBody} .shiki-themes, [data-theme='dark'] ${codeBody} .shiki-themes span`,
  {
    color: 'var(--shiki-dark) !important' as any,
    fontStyle: 'var(--shiki-dark-font-style) !important' as any,
    fontWeight: 'var(--shiki-dark-font-weight) !important' as any,
    textDecoration: 'var(--shiki-dark-text-decoration) !important' as any,
  },
)

export const fileIcon = style({
  display: 'inline-flex',
  flexShrink: 0,
})

globalStyle(`${fileIcon} svg`, {
  width: '100%',
  height: '100%',
})

export const editContainer = style({
  position: 'relative',
})

export const editOverlay = style({
  position: 'absolute',
  inset: 0,
  zIndex: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  selectors: {
    '&:hover': {
      background: 'color-mix(in srgb, currentColor 6%, transparent)',
    },
  },
})

export const editLabel = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 14px',
  borderRadius: 6,
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  color: vars.color.text,
  fontSize: vars.typography.fontSizeSm,
  fontWeight: 500,
  opacity: 0,
  transition: 'opacity 0.2s',
  selectors: {
    [`${editContainer}:hover &`]: {
      opacity: 1,
    },
  },
})

const _codeSnippetDialogPopup = style({})
globalStyle(`${_codeSnippetDialogPopup}${_codeSnippetDialogPopup}`, {
  padding: 0,
  gap: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  width: 'calc(100vw - 2rem)',
  height: 'min(720px, 80vh)',
  borderRadius: '0.75rem',
  '@media': {
    '(min-width: 640px)': {
      maxWidth: '64rem',
    },
  },
})
globalStyle(`${_codeSnippetDialogPopup}${_codeSnippetDialogPopup}[data-open]`, {
  animation: 'none',
})
globalStyle(
  `${_codeSnippetDialogPopup}${_codeSnippetDialogPopup}[data-closed]`,
  {
    animation: 'none',
  },
)
export { _codeSnippetDialogPopup as codeSnippetDialogPopup }

export const modal = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
})

export const modalTitlebar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 44,
  padding: '0 16px',
  borderBottom: `1px solid ${vars.color.border}`,
  flexShrink: 0,
})

export const modalTitle = style({
  fontSize: vars.typography.fontSizeXs,
  fontFamily: vars.typography.fontMono,
  color: vars.color.textSecondary,
})

export const modalIconButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: 6,
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
  selectors: {
    '&:hover': {
      background: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
      color: vars.color.text,
    },
  },
})

export const modalBody = style({
  display: 'flex',
  flex: 1,
  minHeight: 0,
})

export const modalSidebar = style({
  width: 224,
  flexShrink: 0,
  borderRight: `1px solid ${vars.color.border}`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
})

export const sidebarHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 12px 8px',
  fontSize: vars.typography.fontSize2xs,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: `color-mix(in srgb, ${vars.color.textSecondary} 60%, transparent)`,
})

export const sidebarAddButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 22,
  height: 22,
  borderRadius: 4,
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
  selectors: {
    '&:hover': {
      background: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
      color: vars.color.text,
    },
  },
})

export const fileList = style({
  flex: 1,
  overflowY: 'auto',
  padding: '0 6px 8px',
})

const fileItemBase = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 8px',
  borderRadius: 6,
  height: 24,
  cursor: 'pointer',
  fontSize: vars.typography.fontSizeXs,
  fontFamily: vars.typography.fontMono,
  color: vars.color.textSecondary,
  transition: 'background 0.15s, color 0.15s',
  selectors: {
    '&:hover': {
      background: `color-mix(in srgb, ${vars.color.text} 5%, transparent)`,
      color: vars.color.text,
    },
  },
})

export const fileItem = recipe({
  base: fileItemBase,
  variants: {
    active: {
      true: {
        background: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
        color: vars.color.text,
      },
      false: {},
    },
    dragging: {
      true: {
        opacity: 0.4,
      },
      false: {},
    },
  },
  defaultVariants: {
    active: false,
    dragging: false,
  },
})

export const fileDragHandle = style({
  display: 'inline-flex',
  alignItems: 'center',
  cursor: 'grab',
  color: `color-mix(in srgb, ${vars.color.textSecondary} 40%, transparent)`,
  flexShrink: 0,
  touchAction: 'none',
  selectors: {
    '&:active': {
      cursor: 'grabbing',
    },
  },
})

export const fileName = style({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const fileDelete = style({
  display: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  borderRadius: 4,
  border: 'none',
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  flexShrink: 0,
  selectors: {
    [`${fileItemBase}:hover &`]: {
      display: 'inline-flex',
    },
    '&:hover': {
      color: vars.color.alertCaution,
      background: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
    },
  },
})

export const renameInput = style({
  flex: 1,
  minWidth: 0,
  padding: '1px 4px',
  fontSize: vars.typography.fontSizeXs,
  fontFamily: vars.typography.fontMono,
  borderRadius: 3,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bg,
  color: vars.color.text,
  outline: 'none',
  selectors: {
    '&:focus': {
      borderColor: `color-mix(in srgb, ${vars.color.text} 30%, transparent)`,
    },
  },
})

export const modalEditor = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})

export const breadcrumb = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 36,
  padding: '0 16px',
  borderBottom: `1px solid color-mix(in srgb, ${vars.color.border} 50%, transparent)`,
  flexShrink: 0,
})

export const breadcrumbLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: vars.typography.fontSizeXs,
  fontFamily: vars.typography.fontMono,
  color: vars.color.textSecondary,
  overflow: 'hidden',
})

export const breadcrumbName = style({
  color: vars.color.text,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})

export const breadcrumbLang = style({
  opacity: 0.5,
})

export const editorContainer = style({
  flex: 1,
  minHeight: 0,
  position: 'relative',
  overflow: 'auto',
  backgroundColor: 'transparent !important' as any,
})

/* ---- CodeMirror editor styling ---- */
globalStyle(`${editorContainer} .cm-editor`, {
  height: '100%',
  background: 'transparent',
  color: vars.color.text,
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeSm,
})

globalStyle(`${editorContainer} .cm-scroller`, {
  fontFamily: `${vars.typography.fontMono} !important` as any,
  lineHeight: 1.7,
})

globalStyle(`${editorContainer} .cm-content`, {
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: '0.5rem',
  paddingRight: '1rem',
  minHeight: '1.6em',
})

globalStyle(`${editorContainer} .cm-line`, {
  padding: 0,
})

globalStyle(`${editorContainer} .cm-gutters`, {
  background: 'transparent',
  borderRight: 'none',
  paddingLeft: '1rem',
})

globalStyle(`${editorContainer} .cm-lineNumbers .cm-gutterElement`, {
  minWidth: '3em',
  textAlign: 'right',
  paddingRight: '2em',
  color:
    `color-mix(in srgb, ${vars.color.textSecondary} 40%, transparent) !important` as any,
})

export const dragOverlay = style({
  background: vars.color.bgSecondary,
  borderRadius: 6,
  boxShadow: vars.boxShadow.modal,
})
