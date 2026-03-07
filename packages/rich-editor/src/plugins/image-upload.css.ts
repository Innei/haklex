import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, keyframes, style, styleVariants } from '@vanilla-extract/css';

export const draggingWrapperClass = 'rich-image-upload-dragging';

globalStyle(`.${draggingWrapperClass}`, {
  position: 'relative',
  borderRadius: vars.borderRadius.md,
  backgroundColor: `color-mix(in srgb, ${vars.color.accent} 6%, transparent)`,
});

globalStyle(`.${draggingWrapperClass} .rich-editor__content`, {
  outline: `2px dashed color-mix(in srgb, ${vars.color.accent} 48%, transparent)`,
  outlineOffset: '-2px',
});

const toastEnter = keyframes({
  from: { opacity: 0, transform: 'translateY(8px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

export const toastStack = style({
  position: 'absolute',
  right: '0.75rem',
  bottom: '0.75rem',
  zIndex: 25,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '0.375rem',
  pointerEvents: 'none',
});

export const toast = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  padding: '0.375rem 0.625rem',
  borderRadius: vars.borderRadius.sm,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: `color-mix(in srgb, ${vars.color.bg} 95%, transparent)`,
  color: vars.color.text,
  fontSize: vars.typography.fontSizeXs,
  lineHeight: 1.2,
  boxShadow: vars.boxShadow.topBar,
  animation: `${toastEnter} 120ms ease-out`,
});

export const toastVariant = styleVariants({
  info: {},
  success: {
    borderColor: `color-mix(in srgb, ${vars.color.accent} 35%, transparent)`,
  },
  error: {
    borderColor: `color-mix(in srgb, ${vars.color.alertCaution} 45%, transparent)`,
    color: vars.color.alertCaution,
  },
});

const spin = keyframes({
  to: {
    transform: 'rotate(360deg)',
  },
});

export const spinner = style({
  width: 12,
  height: 12,
  borderRadius: '50%',
  border: `2px solid color-mix(in srgb, ${vars.color.textSecondary} 35%, transparent)`,
  borderTopColor: `color-mix(in srgb, ${vars.color.text} 65%, transparent)`,
  animation: `${spin} 0.75s linear infinite`,
});

export const dialogPopup = style({});

globalStyle(`${dialogPopup}${dialogPopup}`, {
  padding: 0,
  gap: 0,
  width: 'min(560px, calc(100vw - 2rem))',
  overflow: 'hidden',
});

export const dialogHeader = style({
  padding: '0.875rem 1rem 0.75rem',
  borderBottom: `1px solid ${vars.color.border}`,
});

export const dialogTitle = style({
  fontSize: vars.typography.fontSizeMd,
  fontWeight: 600,
  color: vars.color.text,
});

export const dialogBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
  padding: '0.875rem 1rem',
});

export const tabWrap = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const uploadDropzone = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  borderRadius: vars.borderRadius.md,
  border: `1.5px dashed ${vars.color.border}`,
  minHeight: 190,
  padding: '1.2rem',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease',
  selectors: {
    '&:hover': {
      borderColor: `color-mix(in srgb, ${vars.color.accent} 35%, transparent)`,
      backgroundColor: `color-mix(in srgb, ${vars.color.accent} 6%, transparent)`,
      color: vars.color.text,
    },
  },
});

export const uploadDropzoneState = styleVariants({
  idle: {},
  active: {
    borderColor: `color-mix(in srgb, ${vars.color.accent} 55%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${vars.color.accent} 8%, transparent)`,
    color: vars.color.text,
    transform: 'scale(1.01)',
  },
  busy: {
    cursor: 'progress',
    opacity: 0.9,
  },
});

export const uploadDropIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: vars.borderRadius.md,
  backgroundColor: `color-mix(in srgb, ${vars.color.text} 6%, transparent)`,
});

export const uploadDropTitle = style({
  fontSize: vars.typography.fontSizeSm,
  fontWeight: 600,
  color: vars.color.text,
});

export const uploadDropDesc = style({
  fontSize: vars.typography.fontSizeXs,
  color: vars.color.textSecondary,
  textAlign: 'center',
});

export const hiddenInput = style({
  display: 'none',
});

export const uploadBusyWrap = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
});

export const uploadProgress = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: vars.typography.fontSizeSm,
  color: vars.color.text,
});

export const urlInputRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const textInput = style({
  width: '100%',
  borderRadius: vars.borderRadius.sm,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.bg,
  color: vars.color.text,
  height: 34,
  padding: '0 0.625rem',
  fontSize: vars.typography.fontSizeSm,
  outline: 'none',
  transition: 'border-color 0.15s ease',
  selectors: {
    '&:focus': {
      borderColor: `color-mix(in srgb, ${vars.color.accent} 50%, transparent)`,
    },
    '&::placeholder': {
      color: vars.color.textSecondary,
    },
  },
});

export const urlPreview = style({
  borderRadius: vars.borderRadius.md,
  border: `1px solid ${vars.color.border}`,
  overflow: 'hidden',
  backgroundColor: `color-mix(in srgb, ${vars.color.text} 2%, transparent)`,
});

export const urlPreviewImage = style({
  display: 'block',
  width: '100%',
  maxHeight: 220,
  objectFit: 'cover',
});

export const helperText = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: vars.typography.fontSizeXs,
  color: vars.color.textSecondary,
});

export const dialogFooter = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  borderTop: `1px solid ${vars.color.border}`,
  backgroundColor: `color-mix(in srgb, ${vars.color.text} 2%, transparent)`,
  padding: '0.65rem 1rem',
});
