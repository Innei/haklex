import { vars } from '@haklex/rich-style-token/styles';
import { keyframes, style } from '@vanilla-extract/css';

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'scale(0.95)' },
  to: { opacity: 1, transform: 'scale(1)' },
});

export const trigger = style({
  'display': 'flex',
  'alignItems': 'center',
  'gap': 2,
  'height': 32,
  'padding': '0 6px',
  'border': 'none',
  'background': 'none',
  'borderRadius': 8,
  'cursor': 'pointer',
  'color': vars.color.textSecondary,
  'transition': 'color 0.1s, background-color 0.1s',
  ':hover': {
    color: vars.color.text,
    backgroundColor: `color-mix(in srgb, ${vars.color.text} 4%, transparent)`,
  },
});

export const triggerLabel = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const triggerLetter = style({
  fontSize: vars.typography.fontSizeXs,
  fontWeight: 600,
  lineHeight: 1,
});

export const triggerBar = style({
  marginTop: 2,
  height: 2,
  width: 14,
  borderRadius: 1,
});

export const triggerChevron = style({
  width: 12,
  height: 12,
  transition: 'transform 0.15s',
});

export const panel = style({
  padding: 8,
  width: 220,
  selectors: {
    '&[data-open]': {
      animation: `${fadeIn} 120ms ease-out`,
    },
  },
});

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: 4,
});

export const swatch = style({
  'position': 'relative',
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 28,
  'height': 28,
  'border': 'none',
  'background': 'none',
  'borderRadius': 8,
  'cursor': 'pointer',
  'padding': 0,
  'transition': 'background-color 0.1s',
  ':hover': {
    backgroundColor: `color-mix(in srgb, ${vars.color.text} 4%, transparent)`,
  },
});

export const swatchDot = style({
  width: 16,
  height: 16,
  borderRadius: '50%',
  border: `1px solid color-mix(in srgb, ${vars.color.text} 10%, transparent)`,
});

export const swatchCheck = style({
  position: 'absolute',
  width: 10,
  height: 10,
  color: vars.color.bg,
});

export const addSwatchDot = style({
  width: 16,
  height: 16,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  background:
    'conic-gradient(from 0deg, #ef4444, #f59e0b, #22c55e, #3b82f6, #6366f1, #ec4899, #ef4444)',
});

export const addSwatchIcon = style({
  width: 10,
  height: 10,
  strokeWidth: 3,
});

export const pickerView = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const backButton = style({
  'display': 'flex',
  'alignItems': 'center',
  'gap': 4,
  'alignSelf': 'flex-start',
  'padding': '2px 6px',
  'marginBottom': 2,
  'border': 'none',
  'background': 'none',
  'borderRadius': 6,
  'cursor': 'pointer',
  'fontSize': vars.typography.fontSizeXs,
  'color': vars.color.textTertiary,
  'transition': 'color 0.1s, background-color 0.1s',
  ':hover': {
    color: vars.color.text,
    backgroundColor: `color-mix(in srgb, ${vars.color.text} 4%, transparent)`,
  },
});

export const backIcon = style({
  width: 12,
  height: 12,
});

export const satSquare = style({
  position: 'relative',
  width: '100%',
  height: 140,
  borderRadius: 6,
  cursor: 'crosshair',
  touchAction: 'none',
  userSelect: 'none',
  overflow: 'hidden',
});

export const satOverlayX = style({
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(to right, #fff, transparent)',
  pointerEvents: 'none',
});

export const satOverlayY = style({
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(to top, #000, transparent)',
  pointerEvents: 'none',
});

export const satThumb = style({
  position: 'absolute',
  width: 12,
  height: 12,
  borderRadius: '50%',
  border: '2px solid #fff',
  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.3)',
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
});

export const hueTrack = style({
  position: 'relative',
  width: '100%',
  height: 10,
  borderRadius: 5,
  background:
    'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
  cursor: 'pointer',
  touchAction: 'none',
  userSelect: 'none',
});

export const alphaTrack = style({
  position: 'relative',
  width: '100%',
  height: 10,
  borderRadius: 5,
  background: 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 / 8px 8px',
  cursor: 'pointer',
  touchAction: 'none',
  userSelect: 'none',
  overflow: 'hidden',
});

export const alphaGradient = style({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
});

export const sliderThumb = style({
  position: 'absolute',
  top: '50%',
  width: 14,
  height: 14,
  borderRadius: '50%',
  border: '2px solid #fff',
  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.3)',
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
});

export const hexRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

export const hexInput = style({
  'flex': 1,
  'minWidth': 0,
  'fontFamily':
    'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", monospace',
  'fontSize': vars.typography.fontSizeXs,
  'padding': '4px 6px',
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': 6,
  'background': vars.color.bgSecondary,
  'color': vars.color.text,
  'outline': 'none',
  'textTransform': 'uppercase',
  ':focus': {
    borderColor: vars.color.accent,
  },
});

export const hexInputInvalid = style({
  'borderColor': '#ef4444',
  ':focus': {
    borderColor: '#ef4444',
  },
});

export const iconButton = style({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 24,
  'height': 24,
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': 6,
  'background': vars.color.bg,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'padding': 0,
  'transition': 'background-color 0.1s, color 0.1s',
  ':hover': {
    color: vars.color.text,
    backgroundColor: vars.color.fillTertiary,
  },
});

export const icon = style({
  width: 12,
  height: 12,
});

export const previewPair = style({
  display: 'flex',
  width: 40,
  height: 24,
  borderRadius: 6,
  overflow: 'hidden',
  border: `1px solid ${vars.color.border}`,
  background: 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 / 6px 6px',
});

export const previewCell = style({
  flex: 1,
});

export const actionRow = style({
  display: 'flex',
  gap: 6,
  marginTop: 2,
});

export const actionButton = style({
  'flex': 1,
  'height': 28,
  'borderRadius': 6,
  'fontSize': vars.typography.fontSizeXs,
  'border': `1px solid ${vars.color.border}`,
  'background': vars.color.bg,
  'color': vars.color.text,
  'cursor': 'pointer',
  'transition': 'background-color 0.1s',
  ':hover': {
    backgroundColor: vars.color.fillTertiary,
  },
});

export const actionButtonPrimary = style({
  'background': vars.color.text,
  'color': vars.color.bg,
  'borderColor': vars.color.text,
  ':hover': {
    backgroundColor: `color-mix(in srgb, ${vars.color.text} 85%, transparent)`,
  },
});
