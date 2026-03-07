import { richContent, vars } from '@haklex/rich-editor/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const editOverlayRoot = style({
  position: 'relative',
  display: 'block',
  cursor: 'pointer',
  margin: `${vars.spacing.md} 0`,
  borderRadius: vars.borderRadius.md,
  border: `1px solid ${vars.color.border}`,
  overflow: 'clip',
});

export const editOverlay = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.35)',
  color: '#fff',
  opacity: 0,
  pointerEvents: 'none',
  transition: 'opacity 0.2s, background 0.2s',
  selectors: {
    [`${editOverlayRoot}:hover &`]: {
      opacity: 1,
      background: 'rgba(0, 0, 0, 0.5)',
    },
  },
});

export const rendererContent = style({
  paddingBlock: vars.spacing.md,
  paddingInline: vars.spacing.xl,
  maxHeight: '300px',
  overflow: 'clip',
});

export const dialogPopup = style({});

globalStyle(`${dialogPopup}${dialogPopup}`, {
  padding: 0,
  gap: 0,
  width: '900px',
  maxWidth: '90vw',
  maxHeight: 'min(900px, calc(100vh - 1rem))',
  overflow: 'hidden',
});

export const dialogShell = style({
  display: 'grid',
  gridTemplateRows: 'auto minmax(0, 1fr) auto',
  height: 'min(800px, calc(100vh - 1rem))',
  background: vars.color.bg,
});

export const dialogHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 0.5rem 0 1rem',
  height: 48,
  borderBottom: `1px solid ${vars.color.border}`,
  flexShrink: 0,
});

export const dialogHeaderLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const dialogTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  margin: 0,
  fontSize: vars.typography.fontSizeMd,
  fontWeight: 500,
  color: vars.color.text,
});

export const dialogHeaderRight = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

export const dialogHeaderCloseBtn = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 28,
  'height': 28,
  'borderRadius': '0.25rem',
  'border': 'none',
  'background': 'none',
  'cursor': 'pointer',
  'color': vars.color.textSecondary,
  'transition': 'color 0.15s',
  ':hover': {
    color: vars.color.text,
  },
});

export const dialogToolbarSection = style({
  padding: '0 0.75rem 0.5rem',
  borderBottom: `1px solid ${vars.color.border}`,
  background: vars.color.bg,
});

export const dialogToolbar = style({
  margin: 0,
  maxWidth: 'none',
  borderRadius: 0,
  position: 'sticky',
  top: 0,
});

globalStyle(`${dialogToolbar}`, {
  border: 'none',
  boxShadow: 'none',
  backgroundColor: 'transparent',
  backdropFilter: 'none',
});

globalStyle(`${dialogToolbar} > div`, {
  paddingInline: 0,
});

export const editorArea = style({
  minHeight: 0,
  overflow: 'hidden',
  background: `linear-gradient(180deg, color-mix(in srgb, ${vars.color.text} 2%, transparent), transparent)`,
});

globalStyle(`${editorArea} .rich-editor`, {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

globalStyle(`${editorArea} .rich-editor__content-wrapper`, {
  maxWidth: '75ch',
  overflowY: 'auto',
});

globalStyle(`${editorArea} .rich-editor__content`, {
  paddingLeft: '1.5rem',
  paddingRight: '1.5rem',
});

globalStyle(`${editorArea} .rich-editor__placeholder`, {
  left: '1.5rem',
});

globalStyle(`${editorArea} ${richContent} > *:first-child`, {
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  boxShadow: 'none',
  borderRadius: 0,
  margin: 0,
  maxWidth: 'none',
  backdropFilter: 'none',
  backgroundColor: 'transparent',
});

export const editorScrollContainer = style({
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
  scrollbarGutter: 'stable both-edges',
});

export const editorCard = style({
  display: 'flex',
  minHeight: '100%',
  background: vars.color.bg,
  overflow: 'hidden',
});

export const editorEditable = style({
  flex: 1,
  minHeight: 460,
  padding: '1.25rem 1.5rem 1.75rem',
  outline: 'none',
  overflow: 'visible',
});

export const dialogFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '0.5rem 0.75rem',
  borderTop: `1px solid ${vars.color.border}`,
});

export const staticOverlayRoot = style({
  position: 'relative',
  display: 'block',
  cursor: 'pointer',
  margin: `${vars.spacing.md} 0`,
  borderRadius: vars.borderRadius.md,
  border: `1px solid ${vars.color.border}`,
  overflow: 'clip',
});

export const staticOverlay = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.25)',
  color: '#fff',
  opacity: 0,
  pointerEvents: 'none',
  transition: 'opacity 0.2s',
  zIndex: 1,
  selectors: {
    [`${staticOverlayRoot}:hover &`]: {
      opacity: 1,
    },
  },
});

export const staticGradientMask = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '4rem',
  background: `linear-gradient(to bottom, transparent, ${vars.color.bg})`,
  pointerEvents: 'none',
});

export const staticDialogPopup = style({});

globalStyle(`${staticDialogPopup}${staticDialogPopup}`, {
  display: 'flex',
  flexDirection: 'column',
  width: '700px',
  maxWidth: '90vw',
  height: 'min(800px, calc(100vh - 2rem))',
  maxHeight: 'min(800px, calc(100vh - 2rem))',
  overflow: 'hidden',
});

export const staticDialogBody = style({
  flex: 1,
  minHeight: 0,
  padding: '0 1.5rem 1.5rem',
  overflowY: 'auto',
  overflowX: 'hidden',
});

export const previewSurface = style({
  pointerEvents: 'none',
});

export const previewEmpty = style({
  margin: 0,
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeMd,
  opacity: 0.72,
});

globalStyle(`${editorEditable} .rich-paragraph:first-child`, {
  marginTop: 0,
});

globalStyle(`${previewSurface} .rich-paragraph:first-child`, {
  marginTop: 0,
});

globalStyle(`${previewSurface} .rich-paragraph:last-child`, {
  marginBottom: 0,
});
