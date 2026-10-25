import {
  chromeMotion,
  chromeRadius,
  chromeText,
  chromeTypography,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { keyframes, style } from '@vanilla-extract/css';

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'scale(0.97)' },
  to: { opacity: 1, transform: 'scale(1)' },
});

const popupIn = {
  'animation': `${fadeIn} ${chromeMotion.popupIn}`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animationName: 'none',
    },
  },
} as const;

const iconButton = {
  'position': 'relative',
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 28,
  'height': 28,
  'flexShrink': 0,
  'border': 'none',
  'background': 'none',
  'borderRadius': chromeRadius.sm,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'padding': 0,
  'outline': 'none',
  'transition': `color ${chromeMotion.state} ease, background-color ${chromeMotion.state} ease`,
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
} as const;

export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  ...chromeTypography,
  gap: 2,
  padding: 4,
  borderRadius: chromeRadius.md,
  backgroundColor: vars.color.bgElevated,
  boxShadow: vars.boxShadow.menu,
  ...popupIn,
});

export const btn = style(iconButton);

export const btnActive = style({
  selectors: {
    '&&': {
      color: vars.color.text,
      backgroundColor: vars.color.fill,
    },
  },
});

export const btnIndicator = style({
  position: 'absolute',
  bottom: 2,
  left: '50%',
  transform: 'translateX(-50%)',
  height: 2,
  width: 14,
  borderRadius: 1,
  backgroundColor: vars.color.text,
});

export const rubyEditor = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  ...chromeTypography,
  padding: 12,
  borderRadius: chromeRadius.lg,
  backgroundColor: vars.color.bgElevated,
  boxShadow: vars.boxShadow.menu,
  ...popupIn,
  minWidth: 240,
});

export const rubyPreview = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  padding: '4px 16px 8px',
});

export const rubyPreviewReading = style({
  ...chromeText.label,
  fontWeight: 400,
  color: vars.color.textSecondary,
});

export const rubyPreviewBase = style({
  fontSize: 20,
  fontWeight: 600,
  lineHeight: 1.3,
});

export const rubyInputRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  width: '100%',
});

export const rubyInput = style({
  ...chromeText.control,
  'flex': 1,
  'minWidth': 0,
  'height': 28,
  'boxSizing': 'border-box',
  'padding': '0 10px',
  'borderRadius': chromeRadius.md,
  'border': 'none',
  'backgroundColor': vars.color.bg,
  'boxShadow': vars.boxShadow.xs,
  'color': vars.color.text,
  'fontFamily': vars.typography.fontFamilySans,
  'outline': 'none',
  'transition': `box-shadow ${chromeMotion.state} ease`,
  '::placeholder': {
    color: vars.color.textTertiary,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
});

export const rubyActionBtn = style({
  ...iconButton,
  borderRadius: chromeRadius.md,
});

export const rubyConfirm = style({
  selectors: {
    '&&, &&:hover': {
      color: vars.color.alertTip,
    },
  },
});

export const rubyRemove = style({
  selectors: {
    '&&, &&:hover': {
      color: vars.color.alertCaution,
    },
  },
});

export const rubyHint = style({
  ...chromeText.label,
  fontWeight: 400,
  color: vars.color.textTertiary,
});

export const separator = style({
  width: 1,
  height: 16,
  backgroundColor: vars.color.borderSubtle,
  marginInline: 4,
  flexShrink: 0,
});
