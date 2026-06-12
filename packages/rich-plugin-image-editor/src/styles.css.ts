import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, keyframes, style } from '@vanilla-extract/css';

const fullscreenIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const fullscreenOut = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

// Double selector beats the dialog stack's base popup styles without !important.
const _fullscreenPopup = style({});
globalStyle(`${_fullscreenPopup}${_fullscreenPopup}`, {
  position: 'fixed',
  inset: 0,
  transform: 'none',
  width: '100vw',
  height: '100vh',
  maxWidth: '100vw',
  maxHeight: '100vh',
  margin: 0,
  padding: 0,
  gap: 0,
  borderRadius: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});
// The base popup's open/closed keyframes animate transform (translate/scale),
// which overrides `transform: none` above for the animation's duration and
// shoves the fullscreen panel toward the top-left until it ends. Replace them
// with fade-only animations at higher specificity.
globalStyle(`${_fullscreenPopup}${_fullscreenPopup}[data-open]`, {
  animation: `${fullscreenIn} 150ms ease-out`,
});
globalStyle(`${_fullscreenPopup}${_fullscreenPopup}[data-closed]`, {
  animation: `${fullscreenOut} 100ms ease-in`,
});
export { _fullscreenPopup as fullscreenPopup };

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  backgroundColor: vars.color.bg,
  color: vars.color.text,
  fontFamily: vars.typography.fontFamilySans,
});

export const topBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  height: 48,
  flexShrink: 0,
  padding: '0 16px',
  borderBottom: `1px solid ${vars.color.border}`,
});

export const topBarTitle = style({
  fontSize: 14,
  fontWeight: 600,
});

export const topBarControls = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flex: 1,
  minWidth: 0,
});

export const toolGroup = style({
  display: 'contents',
});

export const body = style({
  display: 'flex',
  flex: 1,
  minHeight: 0,
});

export const toolRail = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  width: 56,
  flexShrink: 0,
  padding: '12px 0',
  borderRight: `1px solid ${vars.color.border}`,
});

export const toolButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  border: 'none',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: 'transparent',
  color: '#737373',
  cursor: 'pointer',
  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: vars.color.fillSecondary,
      color: vars.color.text,
    },
    '&:disabled': {
      color: '#a3a3a3',
      cursor: 'default',
      opacity: 0.55,
    },
  },
});

export const toolButtonActive = style({
  backgroundColor: vars.color.fill,
  color: vars.color.text,
  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: vars.color.fill,
    },
  },
});

export const toolDivider = style({
  width: 28,
  height: 1,
  margin: '6px 0',
  backgroundColor: vars.color.border,
});

export const canvasArea = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
  padding: 24,
  // Theme vars keep the checkerboard subtle in dark mode (bgTertiary/bg flip per theme).
  background: `repeating-conic-gradient(${vars.color.bgTertiary} 0% 25%, ${vars.color.bg} 0% 50%) 50% / 20px 20px`,
});

export const cropSurface = style({
  maxWidth: '100%',
  maxHeight: '100%',
  boxShadow: vars.boxShadow.modal,
});

export const cropImage = style({
  display: 'block',
  maxWidth: '100%',
});

// ReactCrop sizes itself from its media, so a percentage max-height resolves
// to none; the viewport-derived cap (top bar 48 + footer 56 + canvas padding
// 48) keeps tall images inside the canvas. The descendant selector outranks
// the library's `.ReactCrop__child-wrapper > img` rule.
globalStyle(`${cropSurface} .ReactCrop__child-wrapper > ${cropImage}`, {
  maxHeight: 'calc(100vh - 152px)',
});

export const annotationSurface = style({
  position: 'relative',
  display: 'flex',
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
});

export const optionsBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginLeft: 'auto',
});

export const swatch = style({
  width: 18,
  height: 18,
  padding: 0,
  border: '1px solid rgba(115, 115, 115, 0.35)',
  borderRadius: '50%',
  cursor: 'pointer',
});

export const swatchActive = style({
  boxShadow: `0 0 0 2px ${vars.color.bg}, 0 0 0 4px #737373`,
});

export const optionButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 26,
  height: 26,
  padding: 0,
  border: 'none',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: 'transparent',
  color: '#737373',
  cursor: 'pointer',
  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: vars.color.fillSecondary,
      color: vars.color.text,
    },
    '&:disabled': {
      color: '#a3a3a3',
      cursor: 'default',
      opacity: 0.55,
    },
  },
});

export const optionButtonActive = style({
  backgroundColor: vars.color.fill,
  color: vars.color.text,
});

export const strokeDot = style({
  borderRadius: '50%',
  backgroundColor: 'currentcolor',
});

export const optionDivider = style({
  width: 1,
  height: 18,
  margin: '0 4px',
  backgroundColor: vars.color.border,
});

export const errorState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  padding: 24,
  borderRadius: vars.borderRadius.md,
  backgroundColor: vars.color.bg,
  color: '#737373',
  fontSize: 13,
  boxShadow: vars.boxShadow.modal,
});

export const attribution = style({
  position: 'absolute',
  right: 10,
  bottom: 8,
  fontSize: 11,
  color: '#a3a3a3',
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      color: '#737373',
      textDecoration: 'underline',
    },
  },
});

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  height: 56,
  flexShrink: 0,
  padding: '0 16px',
  gap: 8,
  borderTop: `1px solid ${vars.color.border}`,
});

export const footerSpacer = style({
  flex: 1,
});

const buttonBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 32,
  padding: '0 14px',
  fontSize: 13,
  fontWeight: 500,
  borderRadius: vars.borderRadius.sm,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.5,
      cursor: 'default',
    },
  },
});

export const ghostButton = style([
  buttonBase,
  {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#737373',
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: vars.color.fillSecondary,
        color: vars.color.text,
      },
    },
  },
]);

export const topBarGhostButton = style([
  ghostButton,
  {
    height: 26,
    padding: '0 10px',
    fontSize: 12,
    marginLeft: 'auto',
  },
]);

export const secondaryButton = style([
  buttonBase,
  {
    border: `1px solid ${vars.color.border}`,
    backgroundColor: vars.color.bg,
    color: vars.color.text,
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: vars.color.fillSecondary,
      },
    },
  },
]);

export const primaryButton = style([
  buttonBase,
  {
    border: '1px solid transparent',
    backgroundColor: vars.color.text,
    color: vars.color.bg,
    selectors: {
      '&:hover:not(:disabled)': {
        opacity: 0.85,
      },
    },
  },
]);
