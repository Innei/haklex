import {
  chromeHeight,
  chromeMotion,
  chromeRadius,
  chromeText,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

const stateTransition = `color ${chromeMotion.state} ease, background-color ${chromeMotion.state} ease`;

export const trigger = style({
  'display': 'flex',
  'alignItems': 'center',
  'gap': 2,
  'height': chromeHeight.lg,
  'boxSizing': 'border-box',
  'padding': '0 6px',
  'border': 'none',
  'background': 'none',
  'borderRadius': chromeRadius.md,
  'cursor': 'pointer',
  'color': vars.color.textSecondary,
  'outline': 'none',
  'transition': stateTransition,
  ':hover': {
    color: vars.color.text,
    backgroundColor: vars.color.fillSecondary,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
  'selectors': {
    '&[data-popup-open]': {
      color: vars.color.text,
      backgroundColor: vars.color.fill,
    },
  },
});

export const triggerLabel = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const triggerLetter = style({
  ...chromeText.label,
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
  transition: `transform ${chromeMotion.state} ease`,
});

export const panel = style({
  ...chromeText.control,
  padding: 12,
});

export const presetView = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const sectionLabel = style({
  ...chromeText.label,
  color: vars.color.textTertiary,
});

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(8, 1fr)',
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
  'borderRadius': chromeRadius.md,
  'cursor': 'pointer',
  'padding': 0,
  'outline': 'none',
  'transition': stateTransition,
  ':hover': {
    backgroundColor: vars.color.fillSecondary,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
});

export const swatchDot = style({
  width: 16,
  height: 16,
  boxSizing: 'border-box',
  borderRadius: '50%',
  boxShadow: `inset 0 0 0 1px ${vars.color.ring}`,
  transition: `box-shadow ${chromeMotion.state} ease`,
});

globalStyle(`${swatch}[aria-pressed="true"] ${swatchDot}`, {
  boxShadow: `inset 0 0 0 1px ${vars.color.ring}, 0 0 0 2px ${vars.color.bgElevated}, 0 0 0 3.5px ${vars.color.text}`,
});

export const defaultDot = style({
  background: `linear-gradient(135deg, ${vars.color.text} 50%, ${vars.color.bgElevated} 50%)`,
});

export const backgroundChip = style({
  ...chromeText.control,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 22,
  height: 22,
  borderRadius: chromeRadius.sm,
  fontWeight: 600,
  color: vars.color.text,
  boxShadow: `inset 0 0 0 1px ${vars.color.ring}`,
});

globalStyle(`${swatch}[aria-pressed="true"] ${backgroundChip}`, {
  boxShadow: `inset 0 0 0 1px ${vars.color.ring}, 0 0 0 2px ${vars.color.bgElevated}, 0 0 0 3.5px ${vars.color.text}`,
});

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: 8,
  borderTop: `1px solid ${vars.color.borderSubtle}`,
});

export const footerButton = style({
  'display': 'flex',
  'alignItems': 'center',
  'gap': 4,
  'height': chromeHeight.md,
  'boxSizing': 'border-box',
  'padding': '0 6px',
  'marginLeft': -6,
  'border': 'none',
  'background': 'none',
  'borderRadius': chromeRadius.md,
  'cursor': 'pointer',
  ...chromeText.control,
  'fontFamily': vars.typography.fontFamilySans,
  'color': vars.color.textSecondary,
  'outline': 'none',
  'transition': stateTransition,
  ':hover': {
    color: vars.color.text,
    backgroundColor: vars.color.fillSecondary,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
});

export const footerIcon = style({
  width: 14,
  height: 14,
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
  'height': chromeHeight.sm,
  'boxSizing': 'border-box',
  'padding': '0 6px',
  'marginLeft': -6,
  'border': 'none',
  'background': 'none',
  'borderRadius': chromeRadius.md,
  'cursor': 'pointer',
  ...chromeText.label,
  'fontFamily': vars.typography.fontFamilySans,
  'color': vars.color.textTertiary,
  'outline': 'none',
  'transition': stateTransition,
  ':hover': {
    color: vars.color.text,
    backgroundColor: vars.color.fillSecondary,
  },
  ':focus-visible': {
    boxShadow: focusRing,
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
  borderRadius: chromeRadius.md,
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
  borderRadius: 9999,
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
  borderRadius: 9999,
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
  ...chromeText.mono,
  'flex': 1,
  'minWidth': 0,
  'height': chromeHeight.md,
  'boxSizing': 'border-box',
  'padding': '0 8px',
  'border': 'none',
  'borderRadius': chromeRadius.md,
  'background': vars.color.bg,
  'boxShadow': vars.boxShadow.xs,
  'color': vars.color.text,
  'outline': 'none',
  'textTransform': 'uppercase',
  'transition': `box-shadow ${chromeMotion.state} ease`,
  ':focus-visible': {
    boxShadow: focusRing,
  },
});

export const hexInputInvalid = style({
  'boxShadow': `0 0 0 1px ${vars.color.alertCaution}`,
  ':focus-visible': {
    boxShadow: `0 0 0 1px ${vars.color.alertCaution}, 0 0 0 3px color-mix(in srgb, ${vars.color.alertCaution} 16%, transparent)`,
  },
});

export const iconButton = style({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': chromeHeight.md,
  'height': chromeHeight.md,
  'flexShrink': 0,
  'border': 'none',
  'borderRadius': chromeRadius.md,
  'background': 'none',
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'padding': 0,
  'outline': 'none',
  'transition': stateTransition,
  ':hover': {
    color: vars.color.text,
    backgroundColor: vars.color.fillSecondary,
  },
  ':active': {
    backgroundColor: vars.color.fill,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
});

export const icon = style({
  width: 16,
  height: 16,
});

export const previewPair = style({
  display: 'flex',
  flexShrink: 0,
  width: 40,
  height: chromeHeight.md,
  boxSizing: 'border-box',
  borderRadius: chromeRadius.md,
  overflow: 'hidden',
  boxShadow: `inset 0 0 0 1px ${vars.color.ring}`,
  background: 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 / 6px 6px',
});

export const previewCell = style({
  flex: 1,
});

export const actionRow = style({
  display: 'flex',
  gap: 8,
  marginTop: 4,
});

export const actionButton = style({
  flex: 1,
});
