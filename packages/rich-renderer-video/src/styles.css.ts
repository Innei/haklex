import { vars } from '@haklex/rich-style-token/styles';
import { keyframes, style } from '@vanilla-extract/css';

export const semanticClassNames = {
  root: 'rr-video-root',
  player: 'rr-video-player',
  element: 'rr-video-element',
  indicator: 'rr-video-indicator',
  controls: 'rr-video-controls',
  button: 'rr-video-btn',
  progress: 'rr-video-progress',
  progressControl: 'rr-video-progress-control',
  progressTrack: 'rr-video-progress-track',
  progressRange: 'rr-video-progress-range',
  progressThumb: 'rr-video-progress-thumb',
  spin: 'rr-video-spin',
  editTrigger: 'rr-video-edit-trigger',
  editPreview: 'rr-video-edit-preview',
  editVideo: 'rr-video-edit-video',
  editOverlay: 'rr-video-edit-overlay',
  editPlaceholder: 'rr-video-edit-placeholder',
  editPanel: 'rr-video-edit-panel',
  editField: 'rr-video-edit-field',
  editFieldIcon: 'rr-video-edit-field-icon',
  editInput: 'rr-video-edit-input',
  editError: 'rr-video-edit-error',
} as const;

export const root = style({ margin: '1.25rem 0' });

export const player = style({
  position: 'relative',
  width: '100%',
  background: '#000',
  borderRadius: '0.75rem',
  overflow: 'hidden',
});

export const element = style({
  width: '100%',
  height: '100%',
  display: 'block',
  objectFit: 'contain',
  background: '#000',
  cursor: 'pointer',
});

const indicatorFlash = keyframes({
  '0%': { opacity: 1, transform: 'scale(1)' },
  '100%': { opacity: 0, transform: 'scale(1.3)' },
});

export const indicator = style({
  position: 'absolute',
  inset: 0,
  margin: 'auto',
  width: '5rem',
  height: '5rem',
  borderRadius: '999px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.7)',
  color: '#fff',
  pointerEvents: 'none',
  animation: `${indicatorFlash} 0.5s ease forwards`,
});

export const controls = style({
  'fontFamily': vars.typography.fontFamilySans,
  'position': 'absolute',
  'left': '2rem',
  'right': '2rem',
  'bottom': '0.5rem',
  'height': '2.5rem',
  'borderRadius': '999px',
  'border': `1px solid color-mix(in srgb, ${vars.color.border} 20%, transparent)`,
  'background': `color-mix(in srgb, ${vars.color.bgSecondary} 90%, transparent)`,
  'backdropFilter': 'blur(24px) saturate(180%)',
  'color': vars.color.text,
  'display': 'flex',
  'alignItems': 'center',
  'gap': '0.75rem',
  'padding': '0 1rem',
  'maxWidth': '80vw',
  'margin': '0 auto',
  'opacity': 0,
  'transform': 'translateY(4px)',
  'transition': 'opacity 0.2s ease, transform 0.2s ease',
  'selectors': {
    [`${player}:hover &, ${player}:focus-within &`]: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  '@media': {
    '(max-width: 768px)': {
      left: '0.75rem',
      right: '0.75rem',
      opacity: 1,
      transform: 'none',
      gap: '0.5rem',
      padding: '0 0.75rem',
    },
  },
});

export const button = style({
  appearance: 'none',
  border: 'none',
  background: 'none',
  color: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: '0.125rem',
  lineHeight: 1,
  flexShrink: 0,
  transition: 'transform 0.15s ease',
  selectors: {
    '&:hover': { transform: 'scale(1.1)' },
    '&:active': { transform: 'scale(0.93)' },
    '&:focus-visible': {
      outline: '2px solid currentColor',
      outlineOffset: '2px',
      borderRadius: '4px',
    },
    '&:disabled': { opacity: 0.5, pointerEvents: 'none' },
  },
});

export const progress = style({ flex: 1, height: '100%' });

export const progressControl = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  touchAction: 'none',
  userSelect: 'none',
});

export const progressTrack = style({
  position: 'relative',
  flex: 1,
  height: '0.25rem',
  borderRadius: '999px',
  background: vars.color.bg,
});

export const progressRange = style({
  position: 'absolute',
  height: '100%',
  borderRadius: '999px',
  background: `color-mix(in srgb, ${vars.color.textSecondary} 40%, transparent)`,
});

export const progressThumb = style({
  display: 'block',
  height: '0.75rem',
  width: '3px',
  borderRadius: '1px',
  border: 'none',
  background: vars.color.textSecondary,
});

const videoSpin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const spin = style({
  animation: `${videoSpin} 0.8s linear infinite`,
});

export const editTrigger = style({
  display: 'block',
  cursor: 'pointer',
});

export const editPreview = style({
  position: 'relative',
  width: '100%',
  borderRadius: '0.75rem',
  overflow: 'hidden',
  background: '#000',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  cursor: 'pointer',
});

export const editVideo = style({
  width: '100%',
  height: '100%',
  display: 'block',
  objectFit: 'contain',
  pointerEvents: 'none',
});

export const editOverlay = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.35)',
  color: '#fff',
  transition: 'background 0.2s',
  selectors: {
    [`${editTrigger}:hover &`]: {
      background: 'rgba(0, 0, 0, 0.5)',
    },
  },
});

export const editPlaceholder = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '2rem',
  border: `2px dashed ${vars.color.border}`,
  borderRadius: vars.borderRadius.md,
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeMd,
  cursor: 'pointer',
  transition: 'border-color 0.2s, color 0.2s',
  selectors: {
    '&:hover': {
      borderColor: vars.color.accent,
      color: vars.color.text,
    },
  },
});

export const editPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '340px',
  padding: '12px',

  fontFamily: vars.typography.fontFamilySans,
});

export const editField = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 10px',
  backgroundColor: vars.color.bgSecondary,
  borderRadius: '6px',
  minWidth: 0,
});

export const editFieldIcon = style({
  flexShrink: 0,
  color: vars.color.textSecondary,
});

export const editError = style({
  color: vars.color.alertCaution,
  fontSize: vars.typography.fontSizeSm,
});

export const editInput = style({
  flex: 1,
  appearance: 'none',
  border: 'none',
  backgroundColor: 'transparent',
  color: 'inherit',
  fontSize: vars.typography.fontSizeSm,
  padding: 0,
  outline: 'none',
  minWidth: 0,
  selectors: {
    '&::placeholder': {
      color: vars.color.textSecondary,
    },
  },
});
