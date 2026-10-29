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

export const excalidrawStaticContainer = style(frameBase);

export const excalidrawEditorContainer = style({
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

export const excalidrawPlaceholder = style({
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

export const excalidrawStateLayer = style(stateLayer);

export const excalidrawStateIcon = style({
  width: '20px',
  height: '20px',
  color: vars.color.textQuaternary,
});

const sheen = keyframes({
  from: { backgroundPosition: '200% 0, 0 0' },
  to: { backgroundPosition: '-200% 0, 0 0' },
});

export const excalidrawLoading = style({
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

export const excalidrawEmpty = style({
  ...stateLayer,
  ...dottedPaper,
});

export const excalidrawError = style({
  ...stateLayer,
  color: vars.color.textSecondary,
});

export const excalidrawErrorIcon = style({
  width: '20px',
  height: '20px',
  color: vars.color.alertCaution,
});

export const excalidrawRetry = style({
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

const _excalidrawFullscreenPopup = style({});
globalStyle(`${_excalidrawFullscreenPopup}${_excalidrawFullscreenPopup}`, {
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
globalStyle(`${_excalidrawFullscreenPopup}${_excalidrawFullscreenPopup}[data-open]`, {
  animation: 'none',
});
globalStyle(`${_excalidrawFullscreenPopup}${_excalidrawFullscreenPopup}[data-closed]`, {
  animation: 'none',
});
export { _excalidrawFullscreenPopup as excalidrawFullscreenPopup };

// ── Dialog header ───────────────────────────────────────────────

export const excalidrawDialogHeader = style({
  display: 'flex',
  alignItems: 'center',
  height: 48,
  flexShrink: 0,
  padding: '0 12px 0 16px',
  borderBottom: `1px solid ${vars.color.border}`,
  gap: 10,
});

export const excalidrawDialogHeaderTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  flex: 1,
});

export const excalidrawDialogTitle = style({
  fontSize: vars.typography.fontSizeMd,
  fontWeight: 600,
  color: vars.color.text,
  lineHeight: 1,
});

export const excalidrawDialogMeta = style({
  fontSize: vars.typography.fontSizeSm,
  color: vars.color.textSecondary,
  lineHeight: 1,
  paddingLeft: 10,
  borderLeft: `1px solid ${vars.color.border}`,
});

export const excalidrawHeaderClose = style({
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

export const excalidrawDialogCanvas = style({
  flex: 1,
  position: 'relative',
  minHeight: 0,
});

export const excalidrawShell = style({
  flex: 1,
  minHeight: 0,
});

globalStyle(`${excalidrawShell} ${excalidrawDialogCanvas}`, {
  overflow: 'hidden',
});

export const excalidrawSavedDot = style({
  width: 8,
  height: 8,
  borderRadius: '50%',
  flexShrink: 0,
  backgroundColor: vars.color.alertTip,
});

export const excalidrawOptionsActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
});

export const excalidrawOptionsAdvanced = style({
  borderTop: `1px solid ${vars.color.borderSubtle}`,
});

export const excalidrawOptionsHeading = style({
  ...chromeText.label,
  color: vars.color.textTertiary,
});

export const excalidrawOptionsGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const excalidrawOptionsLabel = style({
  ...chromeText.label,
  color: vars.color.textSecondary,
});

// ── Edit overlay ────────────────────────────────────────────────

export const excalidrawEditOverlay = style({
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

export const excalidrawEditLabel = style({
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
    [`${excalidrawEditOverlay}:hover &, ${excalidrawEditOverlay}:focus-visible &`]: {
      opacity: 1,
    },
  },
  '@media': {
    '(pointer: coarse)': {
      opacity: 1,
    },
  },
});
