import { vars } from '@haklex/rich-style-token'
import { globalStyle, style } from '@vanilla-extract/css'

export const dialogPopup = style({})

globalStyle(`${dialogPopup}${dialogPopup}`, {
  padding: 0,
  gap: 0,
  width: 'min(980px, calc(100vw - 2rem))',
  maxHeight: 'min(820px, calc(100vh - 2rem))',
  overflow: 'hidden',
})

export const dialogShell = style({
  display: 'grid',
  gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
  minHeight: 'min(760px, calc(100vh - 2rem))',
  background: vars.color.bg,
})

export const dialogHeader = style({
  display: 'grid',
  gap: '0.875rem',
  padding: '1.125rem 1.25rem 1rem',
  borderBottom: `1px solid ${vars.color.border}`,
  background: `linear-gradient(180deg, color-mix(in srgb, ${vars.color.text} 3%, transparent), transparent)`,
})

export const dialogHeaderMain = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.875rem',
})

export const dialogHeaderIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: vars.borderRadius.md,
  background: `color-mix(in srgb, ${vars.color.accent} 14%, transparent)`,
  color: vars.color.text,
  flexShrink: 0,
})

export const dialogHeaderText = style({
  minWidth: 0,
  display: 'grid',
  gap: '0.25rem',
})

export const dialogTitle = style({
  margin: 0,
  fontSize: vars.typography.fontSizeLg,
  fontWeight: 700,
  lineHeight: 1.2,
  color: vars.color.text,
})

export const dialogDescription = style({
  margin: 0,
  fontSize: vars.typography.fontSizeSm,
  lineHeight: 1.6,
  color: vars.color.textSecondary,
})

export const dialogMetaRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
})

export const dialogMetaPill = style({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 28,
  padding: '0 0.75rem',
  borderRadius: 999,
  border: `1px solid ${vars.color.border}`,
  background: `color-mix(in srgb, ${vars.color.text} 3%, transparent)`,
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeXs,
  fontWeight: 600,
})

export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  overflowX: 'auto',
  padding: '0.75rem 1rem',
  borderBottom: `1px solid ${vars.color.border}`,
  background: vars.color.bg,
})

export const toolbarGroup = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  flexShrink: 0,
})

export const toolbarDivider = style({
  width: 1,
  height: 18,
  background: vars.color.border,
  flexShrink: 0,
})

export const toolbarButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: vars.borderRadius.sm,
  border: `1px solid transparent`,
  background: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition:
    'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
  selectors: {
    '&:hover': {
      background: vars.color.fillSecondary,
      color: vars.color.text,
    },
    '&:disabled': {
      opacity: 0.45,
      cursor: 'not-allowed',
    },
  },
})

export const toolbarButtonActive = style({
  background: vars.color.fill,
  borderColor: `color-mix(in srgb, ${vars.color.accent} 25%, ${vars.color.border})`,
  color: vars.color.text,
})

export const editorArea = style({
  minHeight: 0,
  padding: '1rem',
  background: `linear-gradient(180deg, color-mix(in srgb, ${vars.color.text} 2%, transparent), transparent)`,
})

export const editorCard = style({
  display: 'flex',
  minHeight: '100%',
  borderRadius: vars.borderRadius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bg,
  boxShadow: vars.boxShadow.menu,
  overflow: 'hidden',
})

export const editorEditable = style({
  flex: 1,
  minHeight: 460,
  padding: '1.25rem 1.5rem 1.75rem',
  outline: 'none',
  overflow: 'auto',
})

export const dialogFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '0.875rem 1.25rem 1rem',
  borderTop: `1px solid ${vars.color.border}`,
  background: `color-mix(in srgb, ${vars.color.text} 2%, transparent)`,
})

export const dialogHint = style({
  margin: 0,
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeXs,
  lineHeight: 1.6,
})

export const dialogActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  flexShrink: 0,
})

const actionButtonBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  height: 36,
  padding: '0 0.875rem',
  borderRadius: vars.borderRadius.sm,
  border: '1px solid transparent',
  fontSize: vars.typography.fontSizeXs,
  fontWeight: 600,
  cursor: 'pointer',
  transition:
    'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
})

export const secondaryButton = style([
  actionButtonBase,
  {
    borderColor: vars.color.border,
    background: vars.color.bg,
    color: vars.color.textSecondary,
    selectors: {
      '&:hover': {
        background: vars.color.fillSecondary,
        color: vars.color.text,
      },
    },
  },
])

export const primaryButton = style([
  actionButtonBase,
  {
    background: vars.color.text,
    color: vars.color.bg,
    selectors: {
      '&:hover': {
        background: `color-mix(in srgb, ${vars.color.text} 86%, transparent)`,
      },
    },
  },
])

export const previewSurface = style({
  pointerEvents: 'none',
})

export const previewRenderer = style({
  pointerEvents: 'none',
})

export const previewEditable = style({
  outline: 'none',
  minHeight: 0,
  padding: 0,
  cursor: 'inherit',
})

export const previewEmpty = style({
  margin: 0,
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeMd,
  opacity: 0.72,
})

globalStyle(`${previewEditable} > div`, {
  minHeight: 0,
})

globalStyle(`${editorEditable} .rich-paragraph:first-child`, {
  marginTop: 0,
})

globalStyle(`${previewEditable} .rich-paragraph:first-child`, {
  marginTop: 0,
})

globalStyle(`${previewEditable} .rich-paragraph:last-child`, {
  marginBottom: 0,
})

globalStyle(`${toolbar}::-webkit-scrollbar`, {
  display: 'none',
})
