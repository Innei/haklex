import { vars } from '@haklex/rich-style-token/styles';
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

export const excalidrawStatusDot = style({
  width: 8,
  height: 8,
  borderRadius: '50%',
  flexShrink: 0,
  transition: 'background-color 0.3s',
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

export const excalidrawHeaderActions = style({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: 2,
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

// ── Header action buttons ────────────────────────────────────────

export const excalidrawActionBarBtn = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'gap': 4,
  'padding': '4px 10px',
  'borderRadius': 4,
  'border': 'none',
  'background': 'transparent',
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'fontSize': vars.typography.fontSizeSm,
  'whiteSpace': 'nowrap',
  'transition': 'background 0.15s, color 0.15s',
  ':hover': {
    background: 'color-mix(in srgb, currentColor 8%, transparent)',
    color: vars.color.text,
  },
  'selectors': {
    '&:disabled': {
      opacity: 0.4,
      pointerEvents: 'none',
    },
  },
});

globalStyle(`${excalidrawActionBarBtn} svg`, {
  width: 14,
  height: 14,
  flexShrink: 0,
});

export const excalidrawActionBarSep = style({
  width: 1,
  height: 16,
  margin: '0 4px',
  background: vars.color.border,
  flexShrink: 0,
});

export const excalidrawActionBarUrl = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'padding': '3px 10px',
  'borderRadius': 4,
  'background': 'color-mix(in srgb, currentColor 4%, transparent)',
  'color': vars.color.textSecondary,
  'fontSize': vars.typography.fontSizeXs,
  'fontFamily': vars.typography.fontMono,
  'width': 200,
  'maxWidth': '50%',
  'overflow': 'hidden',
  'textOverflow': 'ellipsis',
  'whiteSpace': 'nowrap',
  'border': `1px solid transparent`,
  'outline': 'none',
  'transition': 'background 0.15s, border-color 0.15s',
  ':hover': {
    background: 'color-mix(in srgb, currentColor 8%, transparent)',
  },
  ':focus': {
    borderColor: vars.color.accent,
    background: 'color-mix(in srgb, currentColor 6%, transparent)',
  },
});

// ── Dialog canvas area ──────────────────────────────────────────

export const excalidrawDialogCanvas = style({
  flex: 1,
  position: 'relative',
  minHeight: 0,
});

// ── Unsaved-changes confirmation (used inside presentDialog) ────

export const excalidrawConfirmActions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
  padding: '0 1.5rem 1.25rem',
});

export const excalidrawConfirmBtn = style({
  'padding': '6px 14px',
  'borderRadius': 6,
  'border': `1px solid ${vars.color.border}`,
  'background': 'transparent',
  'fontSize': vars.typography.fontSizeSm,
  'fontWeight': 500,
  'cursor': 'pointer',
  'transition': 'background 0.15s',
  'color': vars.color.text,
  ':hover': {
    background: 'color-mix(in srgb, currentColor 6%, transparent)',
  },
});

export const excalidrawConfirmBtnPrimary = style({
  'padding': '6px 14px',
  'borderRadius': 6,
  'border': `1px solid ${vars.color.accent}`,
  'background': vars.color.accent,
  'fontSize': vars.typography.fontSizeSm,
  'fontWeight': 500,
  'cursor': 'pointer',
  'transition': 'opacity 0.15s',
  'color': '#fff',
  ':hover': {
    opacity: 0.9,
  },
});

export const excalidrawConfirmBtnDanger = style({
  'padding': '6px 14px',
  'borderRadius': 6,
  'border': `1px solid ${vars.color.alertCaution}`,
  'background': 'transparent',
  'fontSize': vars.typography.fontSizeSm,
  'fontWeight': 500,
  'cursor': 'pointer',
  'transition': 'background 0.15s',
  'color': vars.color.alertCaution,
  ':hover': {
    background: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
  },
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
