import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, keyframes, style } from '@vanilla-extract/css';

// ── Display styles ──────────────────────────────────────────────

export const mermaidContainer = style({
  'display': 'flex',
  'flexDirection': 'column',
  'alignItems': 'center',
  'margin': '1rem 0',
  'position': 'relative',
  'overflow': 'hidden',
  'cursor': 'grab',
  ':active': {
    cursor: 'grabbing',
  },
});

globalStyle(`${mermaidContainer} img`, {
  maxWidth: '100%',
  height: 'auto',
});

export const mermaidEditHint = style({
  'position': 'absolute',
  'top': 8,
  'right': 8,
  'padding': '2px 8px',
  'borderRadius': 4,
  'fontSize': vars.typography.fontSizeXs,
  'color': vars.color.textSecondary,
  'backgroundColor': `color-mix(in srgb, ${vars.color.bg} 80%, transparent)`,
  'backdropFilter': 'blur(4px)',
  'opacity': 0,
  'transition': 'opacity 0.2s',
  'cursor': 'pointer',
  'zIndex': 2,
  'selectors': {
    [`${mermaidContainer}:hover &`]: {
      opacity: 1,
    },
  },
  ':hover': {
    color: vars.color.text,
    backgroundColor: `color-mix(in srgb, ${vars.color.bg} 95%, transparent)`,
  },
});

export const zoomControls = style({
  position: 'absolute',
  bottom: 8,
  right: 8,
  display: 'flex',
  gap: 2,
  opacity: 0,
  transition: 'opacity 0.2s',
  zIndex: 2,
  selectors: {
    [`${mermaidContainer}:hover &`]: {
      opacity: 1,
    },
  },
});

export const zoomBtn = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 28,
  'height': 28,
  'borderRadius': '0.25rem',
  'border': 'none',
  'cursor': 'pointer',
  'color': vars.color.textSecondary,
  'backgroundColor': `color-mix(in srgb, ${vars.color.bg} 80%, transparent)`,
  'backdropFilter': 'blur(4px)',
  'transition': 'color 0.15s, background-color 0.15s',
  ':hover': {
    color: vars.color.text,
    backgroundColor: `color-mix(in srgb, ${vars.color.bg} 95%, transparent)`,
  },
});

export const mermaidLoading = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  margin: '1rem 0',
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeMd,
});

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

export const mermaidSpinner = style({
  display: 'inline-block',
  width: 24,
  height: 24,
  border: '2.5px solid currentColor',
  borderRightColor: 'transparent',
  borderRadius: '50%',
  animation: `${spin} 0.6s linear infinite`,
});

export const mermaidError = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: vars.typography.fontFamilySans,
  padding: '0.75rem 1rem',
  margin: '1rem 0',
  borderRadius: '0.5rem',
  backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
  color: vars.color.alertCaution,
  fontSize: vars.typography.fontSizeMd,
});

// ── Editor modal styles ─────────────────────────────────────────

const _editorPopup = style({});
globalStyle(`${_editorPopup}${_editorPopup}`, {
  'padding': 0,
  'gap': 0,
  'display': 'flex',
  'flexDirection': 'column',
  'overflow': 'hidden',
  'width': 'calc(100vw - 2rem)',
  'height': 'min(680px, 85vh)',
  'borderRadius': '0.5rem',
  '@media': {
    '(min-width: 640px)': {
      maxWidth: '64rem',
    },
  },
});
export { _editorPopup as editorPopup };

export const editorHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 0.5rem 0 1rem',
  height: 48,
  borderBottom: `1px solid ${vars.color.border}`,
  flexShrink: 0,
});

export const editorHeaderLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const editorHeaderRight = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

export const editorSep = style({
  width: 1,
  height: 16,
  backgroundColor: vars.color.border,
  flexShrink: 0,
});

export const editorTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: vars.typography.fontSizeMd,
  fontWeight: 500,
  color: vars.color.text,
});

export const editorTplBtn = style({
  'padding': '0.25rem 0.5rem',
  'fontSize': vars.typography.fontSizeXs,
  'color': vars.color.textSecondary,
  'background': 'none',
  'border': 'none',
  'borderRadius': '0.375rem',
  'cursor': 'pointer',
  'transition': 'color 0.15s, background-color 0.15s',
  ':hover': {
    color: vars.color.text,
    backgroundColor: `color-mix(in srgb, ${vars.color.text} 5%, transparent)`,
  },
});

export const editorViewToggle = style({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: `color-mix(in srgb, ${vars.color.text} 5%, transparent)`,
  borderRadius: '0.375rem',
  padding: 2,
  marginRight: 4,
});

export const editorViewItem = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'padding': 4,
  'borderRadius': '0.25rem',
  'border': 'none',
  'background': 'none',
  'cursor': 'pointer',
  'color': vars.color.textSecondary,
  'transition': 'color 0.15s, background-color 0.15s, box-shadow 0.15s',
  ':hover': {
    color: vars.color.text,
  },
});

export const editorViewItemActive = style({
  backgroundColor: vars.color.bg,
  color: vars.color.text,
  boxShadow: vars.boxShadow.menu,
});

export const editorIconBtn = style({
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
  'transition': 'color 0.15s, background-color 0.15s',
  ':hover': {
    color: vars.color.text,
    backgroundColor: `color-mix(in srgb, ${vars.color.text} 5%, transparent)`,
  },
});

export const editorBody = style({
  display: 'flex',
  flex: 1,
  minHeight: 0,
});

export const editorPane = style({
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${vars.color.border}`,
});

export const editorPaneHalf = style({ width: '50%' });
export const editorPaneFull = style({ flex: 1 });

export const editorPaneLabel = style({
  display: 'flex',
  alignItems: 'center',
  padding: '0 0.75rem',
  height: 32,
  borderBottom: `1px solid ${vars.color.border}`,
  backgroundColor: `color-mix(in srgb, ${vars.color.text} 2%, transparent)`,
  flexShrink: 0,
  fontSize: vars.typography.fontSizeXs,
  fontWeight: 500,
  color: vars.color.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

export const editorPreviewPane = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

export const editorPreviewWrap = style({
  'display': 'flex',
  'flex': 1,
  'minHeight': 0,
  'alignItems': 'center',
  'justifyContent': 'center',
  'position': 'relative',
  'overflow': 'hidden',
  'cursor': 'grab',
  ':active': {
    cursor: 'grabbing',
  },
});

globalStyle(`${editorPreviewWrap}:hover ${zoomControls}`, {
  opacity: 1,
});

globalStyle(`${editorPreviewWrap} img`, {
  maxWidth: '100%',
  height: 'auto',
});

export const editorPreviewEmpty = style({
  fontSize: vars.typography.fontSizeMd,
  color: `color-mix(in srgb, ${vars.color.textSecondary} 50%, transparent)`,
});

export const editorPreviewErrorWrap = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.75rem',
  maxWidth: 320,
  textAlign: 'center',
});

export const editorPreviewErrorIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: '0.375rem',
  backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
  color: vars.color.alertCaution,
});

export const editorPreviewErrorTitle = style({
  fontSize: vars.typography.fontSizeMd,
  fontWeight: 500,
  color: vars.color.text,
});

export const editorPreviewErrorMsg = style({
  fontSize: vars.typography.fontSizeXs,
  color: vars.color.textSecondary,
  lineHeight: 1.5,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

// ── Code editor ─────────────────────────────────────────────────

export const codeEditor = style({
  position: 'relative',
  display: 'flex',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
  fontFamily: vars.typography.fontMono,
  fontSize: vars.typography.fontSizeSm,
  lineHeight: '1.25rem',
});

export const codeGutter = style({
  flexShrink: 0,
  width: 40,
  overflow: 'hidden',
  userSelect: 'none',
  borderRight: `1px solid ${vars.color.border}`,
  backgroundColor: `color-mix(in srgb, ${vars.color.text} 2%, transparent)`,
  padding: '0.75rem 0',
});

export const codeGutterLine = style({
  padding: '0 0.5rem',
  textAlign: 'right',
  lineHeight: '1.25rem',
  color: `color-mix(in srgb, ${vars.color.textSecondary} 40%, transparent)`,
});

export const codeArea = style({
  'flex': 1,
  'resize': 'none',
  'backgroundColor': 'transparent',
  'padding': '0.75rem',
  'color': vars.color.text,
  'outline': 'none',
  'border': 'none',
  'lineHeight': '1.25rem',
  'fontFamily': vars.typography.fontMono,
  'fontSize': vars.typography.fontSizeMd,
  'tabSize': 2,
  '::placeholder': {
    color: `color-mix(in srgb, ${vars.color.textSecondary} 40%, transparent)`,
  },
});

// ── Footer ──────────────────────────────────────────────────────

export const editorFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '0 1rem',
  height: 44,
  borderTop: `1px solid ${vars.color.border}`,
  flexShrink: 0,
  backgroundColor: `color-mix(in srgb, ${vars.color.text} 1.5%, transparent)`,
});

export const footerStatus = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const footerStatusDot = style({
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: vars.color.alertTip,
});

export const footerStatusText = style({
  fontSize: vars.typography.fontSizeXs,
  color: vars.color.textSecondary,
});

export const footerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

const footerBtnBase = style({
  padding: '0.25rem 0.75rem',
  borderRadius: '0.375rem',
  fontSize: vars.typography.fontSizeXs,
  fontWeight: 500,
  cursor: 'pointer',
  height: 28,
  transition: 'background-color 0.15s, border-color 0.15s',
});

export const footerBtnCancel = style([
  footerBtnBase,
  {
    'backgroundColor': 'transparent',
    'color': vars.color.textSecondary,
    'border': `1px solid ${vars.color.border}`,
    ':hover': {
      backgroundColor: `color-mix(in srgb, ${vars.color.text} 4%, transparent)`,
    },
  },
]);

export const footerBtnSave = style([
  footerBtnBase,
  {
    'backgroundColor': vars.color.text,
    'color': vars.color.bg,
    'border': '1px solid transparent',
    ':hover': {
      backgroundColor: `color-mix(in srgb, ${vars.color.text} 85%, transparent)`,
    },
  },
]);
