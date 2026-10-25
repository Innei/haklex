import { chromeTypography, vars } from '@haklex/rich-style-token/styles';
import { keyframes, style } from '@vanilla-extract/css';

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'translateY(4px) scale(0.97)' },
  to: { opacity: 1, transform: 'translateY(0) scale(1)' },
});

export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  ...chromeTypography,
  gap: 2,
  padding: 4,
  borderRadius: 10,
  backgroundColor: vars.color.bg,
  boxShadow: vars.boxShadow.menu,
  animation: `${fadeIn} 120ms ease-out`,
});

export const btn = style({
  'position': 'relative',
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 28,
  'height': 28,
  'border': 'none',
  'background': 'none',
  'borderRadius': 6,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'padding': 0,
  'transition': 'color 120ms ease-out, background-color 120ms ease-out',
  ':hover': {
    color: vars.color.text,
    backgroundColor: vars.color.fillSecondary,
  },
});

export const btnActive = style({
  color: vars.color.text,
  backgroundColor: vars.color.fill,
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
  padding: '12px 16px',
  borderRadius: vars.borderRadius.lg,
  backgroundColor: vars.color.bg,
  boxShadow: vars.boxShadow.menu,
  animation: `${fadeIn} 120ms ease-out`,
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
  fontSize: 12,
  color: vars.color.textSecondary,
  lineHeight: 1.2,
});

export const rubyPreviewBase = style({
  fontSize: 20,
  fontWeight: 600,
  lineHeight: 1.3,
});

export const rubyInputRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  width: '100%',
});

export const rubyInput = style({
  flex: 1,
  padding: '6px 10px',
  borderRadius: vars.borderRadius.md,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: 'transparent',
  color: vars.color.text,
  fontFamily: 'inherit',
  fontSize: 14,
  outline: 'none',
  lineHeight: 1.4,
  transition: 'border-color 120ms ease-out, box-shadow 120ms ease-out',
  selectors: {
    '&:focus': {
      borderColor: vars.color.accent,
      boxShadow: `0 0 0 3px ${vars.color.accentLight}`,
    },
  },
});

export const rubyActionBtn = style({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 28,
  'height': 28,
  'border': 'none',
  'background': 'none',
  'borderRadius': 6,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'padding': 0,
  'transition': 'color 120ms ease-out, background-color 120ms ease-out',
  ':hover': {
    color: vars.color.text,
    backgroundColor: vars.color.fillSecondary,
  },
});

export const rubyHint = style({
  fontSize: 11,
  color: vars.color.textTertiary,
});

export const separator = style({
  width: 1,
  height: 16,
  backgroundColor: vars.color.border,
  marginInline: 4,
  flexShrink: 0,
});
