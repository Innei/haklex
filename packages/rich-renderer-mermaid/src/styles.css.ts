import { focusRing, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, keyframes, style } from '@vanilla-extract/css';

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
  'border': 'none',
  'borderRadius': 4,
  'fontFamily': vars.typography.fontFamilySans,
  'fontSize': vars.typography.fontSizeXs,
  'color': vars.color.textSecondary,
  'backgroundColor': `color-mix(in srgb, ${vars.color.bg} 80%, transparent)`,
  'backdropFilter': 'blur(4px)',
  'opacity': 0,
  'transition': 'opacity 0.2s',
  'cursor': 'pointer',
  'zIndex': 2,
  'selectors': {
    [`${mermaidContainer}:hover &, &:focus-visible`]: {
      opacity: 1,
    },
  },
  ':hover': {
    color: vars.color.text,
    backgroundColor: `color-mix(in srgb, ${vars.color.bg} 95%, transparent)`,
  },
  ':focus-visible': {
    outline: 'none',
    boxShadow: focusRing,
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
    [`${mermaidContainer}:hover &, &:focus-within`]: {
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

const _editorPopup = style({});
globalStyle(`${_editorPopup}${_editorPopup}`, {
  display: 'flex',
  flexDirection: 'column',
  height: 'min(680px, 85vh)',
  overflow: 'hidden',
});
export { _editorPopup as editorPopup };

export const editorShell = style({
  flex: 1,
  minHeight: 0,
});

export const editorBody = style({
  display: 'flex',
  overflow: 'hidden',
});

export const editorPane = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  borderRight: `1px solid ${vars.color.borderSubtle}`,
});

export const editorPaneHalf = style({ width: '50%' });
export const editorPaneFull = style({ flex: 1 });

export const editorPreviewPane = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
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

export const footerStatusError = style({
  color: vars.color.alertCaution,
});
