import { chromeText, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, keyframes, style } from '@vanilla-extract/css';

const ASPECT_RATIO = '16 / 9';

const frameBase = {
  position: 'relative',
  width: '100%',
  aspectRatio: ASPECT_RATIO,
  margin: `${vars.flow.block} 0`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.md,
  overflow: 'hidden',
  backgroundColor: vars.color.bg,
} as const;

export const whiteboardStaticContainer = style(frameBase);

export const whiteboardEditorContainer = style({
  ...frameBase,
  selectors: {
    '&:focus-within': {
      borderColor: vars.color.accent,
    },
  },
});

const dottedPaper = {
  backgroundImage: `radial-gradient(${vars.color.border} 1px, transparent 1px)`,
  backgroundSize: '16px 16px',
} as const;

export const whiteboardPlaceholder = style({
  ...frameBase,
  ...dottedPaper,
});

const stateLayer = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontFamily: vars.typography.fontFamilySans,
  fontSize: '13px',
  color: vars.color.textTertiary,
} as const;

export const whiteboardStateLayer = style(stateLayer);

export const whiteboardStateIcon = style({
  width: '20px',
  height: '20px',
  color: vars.color.textQuaternary,
});

const sheen = keyframes({
  from: { backgroundPosition: '200% 0, 0 0' },
  to: { backgroundPosition: '-200% 0, 0 0' },
});

export const whiteboardLoading = style({
  ...stateLayer,
  ...dottedPaper,
  'backgroundImage': `linear-gradient(90deg, transparent, color-mix(in oklab, ${vars.color.text} 4%, transparent), transparent), radial-gradient(${vars.color.border} 1px, transparent 1px)`,
  'backgroundSize': '200% 100%, 16px 16px',
  'animation': `${sheen} 1.6s linear infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const whiteboardEmpty = style({
  ...stateLayer,
  ...dottedPaper,
});

export const whiteboardError = style({
  ...stateLayer,
  color: vars.color.textSecondary,
});

export const whiteboardErrorIcon = style({
  width: '20px',
  height: '20px',
  color: vars.color.alertCaution,
});

export const whiteboardRetry = style({
  'appearance': 'none',
  'padding': '4px 12px',
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': '6px',
  'background': vars.color.bg,
  'color': vars.color.textSecondary,
  'font': 'inherit',
  'fontSize': '12px',
  'cursor': 'pointer',
  ':hover': {
    color: vars.color.text,
    backgroundColor: vars.color.fillTertiary,
  },
});

const _whiteboardFullscreenPopup = style({});
globalStyle(`${_whiteboardFullscreenPopup}${_whiteboardFullscreenPopup}`, {
  position: 'fixed',
  inset: 0,
  top: 0,
  left: 0,
  transform: 'none',
  width: '100vw',
  height: '100vh',
  maxWidth: '100vw',
  maxHeight: '100vh',
  margin: 0,
  padding: 0,
  gap: 0,
  borderRadius: 0,
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  background: vars.color.bg,
  overflow: 'hidden',
});
globalStyle(`${_whiteboardFullscreenPopup}${_whiteboardFullscreenPopup}[data-open]`, {
  animation: 'none',
});
globalStyle(`${_whiteboardFullscreenPopup}${_whiteboardFullscreenPopup}[data-closed]`, {
  animation: 'none',
});
export { _whiteboardFullscreenPopup as whiteboardFullscreenPopup };

// ── Dialog header ───────────────────────────────────────────────

export const whiteboardDialogHeader = style({
  display: 'flex',
  alignItems: 'center',
  height: 48,
  flexShrink: 0,
  padding: '0 12px 0 16px',
  borderBottom: `1px solid ${vars.color.border}`,
  gap: 10,
});

export const whiteboardDialogHeaderTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  flex: 1,
});

export const whiteboardDialogTitle = style({
  fontSize: vars.typography.fontSizeMd,
  fontWeight: 600,
  color: vars.color.text,
  lineHeight: 1,
});

export const whiteboardDialogMeta = style({
  fontSize: vars.typography.fontSizeSm,
  color: vars.color.textSecondary,
  lineHeight: 1,
  paddingLeft: 10,
  borderLeft: `1px solid ${vars.color.border}`,
});

export const whiteboardHeaderClose = style({
  'marginLeft': 8,
  'flexShrink': 0,
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 32,
  'height': 32,
  'borderRadius': 6,
  'border': 'none',
  'background': 'transparent',
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'transition': 'background 0.15s, color 0.15s',
  ':hover': {
    background: 'color-mix(in srgb, currentColor 8%, transparent)',
    color: vars.color.text,
  },
});

// ── Dialog canvas area ──────────────────────────────────────────

export const whiteboardDialogCanvas = style({
  flex: 1,
  position: 'relative',
  minHeight: 0,
});

export const whiteboardDialogBody = style({
  position: 'absolute',
  inset: 0,
});

export const whiteboardShell = style({
  flex: 1,
  minHeight: 0,
});

globalStyle(`${whiteboardShell} ${whiteboardDialogCanvas}`, {
  overflow: 'hidden',
});

export const whiteboardSavedDot = style({
  width: 8,
  height: 8,
  borderRadius: '50%',
  flexShrink: 0,
  backgroundColor: vars.color.alertTip,
});

export const whiteboardOptionsActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
});

export const whiteboardOptionsAdvanced = style({
  borderTop: `1px solid ${vars.color.borderSubtle}`,
});

export const whiteboardOptionsHeading = style({
  ...chromeText.label,
  color: vars.color.textTertiary,
});

export const whiteboardOptionsGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const whiteboardOptionsLabel = style({
  ...chromeText.label,
  color: vars.color.textSecondary,
});

// ── Edit overlay ────────────────────────────────────────────────

export const whiteboardEditOverlay = style({
  'position': 'absolute',
  'inset': 0,
  'zIndex': 1,
  'padding': 0,
  'cursor': 'pointer',
  'background': 'transparent',
  'border': 'none',
  'outline': 'none',
  ':focus-visible': {
    boxShadow: `inset 0 0 0 2px ${vars.color.accent}`,
  },
});

export const whiteboardEditLabel = style({
  'position': 'absolute',
  'top': '8px',
  'right': '8px',
  'display': 'inline-flex',
  'alignItems': 'center',
  'gap': '6px',
  'padding': '6px 10px',
  'borderRadius': '8px',
  'background': `color-mix(in oklab, ${vars.color.bg} 92%, transparent)`,
  'border': `1px solid ${vars.color.border}`,
  'color': vars.color.textSecondary,
  'fontFamily': vars.typography.fontFamilySans,
  'fontSize': '12px',
  'fontWeight': 500,
  'opacity': 0,
  'transition': 'opacity 0.15s ease',
  'selectors': {
    [`${whiteboardEditOverlay}:hover &, ${whiteboardEditOverlay}:focus-visible &`]: {
      opacity: 1,
    },
  },
  '@media': {
    '(pointer: coarse)': {
      opacity: 1,
    },
  },
});
