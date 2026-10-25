import {
  chromeMotion,
  chromeRadius,
  chromeText,
  chromeTypography,
  focusRing,
  vars,
} from '@haklex/rich-style-token/styles';
import { globalStyle, keyframes, style } from '@vanilla-extract/css';

const reducedMotion = '(prefers-reduced-motion: reduce)';

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  backgroundColor: vars.color.scrim,
  transition: `opacity ${chromeMotion.popupIn}`,
  selectors: {
    '&[data-starting-style], &[data-ending-style]': {
      opacity: 0,
    },
    '&[data-ending-style]': {
      transition: `opacity ${chromeMotion.popupOut}`,
    },
  },
});

export const popup = style({
  ...chromeTypography,
  'position': 'fixed',
  'top': '50%',
  'left': '50%',
  'transform': 'translate(-50%, -50%)',
  'zIndex': 50,
  'display': 'grid',
  'width': '100%',
  'maxWidth': 'calc(100% - 2rem)',
  'boxSizing': 'border-box',
  'gap': 0,
  'borderRadius': chromeRadius.lg,
  'border': 'none',
  'padding': 0,
  'fontFamily': vars.typography.fontFamilySans,
  'color': vars.color.text,
  'backgroundColor': vars.color.bgElevated,
  'boxShadow': vars.boxShadow.modal,
  'outline': 'none',
  'transition': `opacity ${chromeMotion.popupIn}, transform ${chromeMotion.popupIn}`,
  'selectors': {
    '&[data-starting-style], &[data-ending-style]': {
      opacity: 0,
      transform: 'translate(-50%, -50%) scale(0.97)',
    },
    '&[data-ending-style]': {
      transition: `opacity ${chromeMotion.popupOut}, transform ${chromeMotion.popupOut}`,
    },
  },
  '@media': {
    '(min-width: 640px)': {
      maxWidth: '28rem',
    },
    [reducedMotion]: {
      selectors: {
        '&[data-starting-style], &[data-ending-style]': {
          transform: 'translate(-50%, -50%)',
        },
      },
    },
  },
});

export const closeButton = style({
  'position': 'absolute',
  'top': '12px',
  'right': '12px',
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 28,
  'height': 28,
  'boxSizing': 'border-box',
  'padding': 0,
  'borderRadius': chromeRadius.md,
  'border': 'none',
  'background': 'transparent',
  'cursor': 'pointer',
  'color': vars.color.textSecondary,
  'outline': 'none',
  'transition': `background-color ${chromeMotion.state} ease, color ${chromeMotion.state} ease`,
  ':hover': {
    background: vars.color.fillSecondary,
    color: vars.color.text,
  },
  ':active': {
    background: vars.color.fill,
  },
  ':focus-visible': {
    boxShadow: focusRing,
  },
  'selectors': {
    '&:disabled': {
      pointerEvents: 'none',
      opacity: 0.5,
    },
  },
});

globalStyle(`${closeButton} svg`, {
  width: 16,
  height: 16,
  pointerEvents: 'none',
  flexShrink: 0,
});

export const header = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '16px 48px 0 16px',
});

export const headerContent = style({
  'display': 'flex',
  'flexDirection': 'column',
  'gap': '4px',
  'flex': 1,
  'minWidth': 0,
  'textAlign': 'center',
  '@media': {
    '(min-width: 640px)': {
      textAlign: 'left',
    },
  },
});

export const headerCloseButton = closeButton;

export const footer = style({
  'display': 'flex',
  'flexDirection': 'column-reverse',
  'gap': '8px',
  'padding': '16px',
  '@media': {
    '(min-width: 640px)': {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  },
});

export const title = style({
  ...chromeText.title,
  fontFamily: vars.typography.fontFamilySans,
  color: vars.color.text,
});

export const description = style({
  ...chromeText.item,
  lineHeight: '22px',
  fontFamily: vars.typography.fontFamilySans,
  color: vars.color.textSecondary,
});

const slideUp = keyframes({
  from: { transform: 'translateY(100%)' },
  to: { transform: 'translateY(0)' },
});

const slideDown = keyframes({
  from: { transform: 'translateY(0)' },
  to: { transform: 'translateY(100%)' },
});

export const sheetBackdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  backgroundColor: vars.color.scrim,
  transition: 'opacity 200ms ease',
});

export const sheetContainer = style({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '85vh',
  borderTopLeftRadius: chromeRadius.lg,
  borderTopRightRadius: chromeRadius.lg,
  backgroundColor: vars.color.bgElevated,
  color: vars.color.text,
  fontFamily: vars.typography.fontFamilySans,
  boxShadow: vars.boxShadow.modal,
  willChange: 'transform',
  selectors: {
    '&[data-open]': {
      animation: `${slideUp} 300ms cubic-bezier(0.32, 0.72, 0, 1)`,
    },
    '&[data-closed]': {
      animation: `${slideDown} 200ms ease-in`,
    },
  },
});

export const sheetDragHandle = style({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'padding': '12px 0 4px',
  'cursor': 'grab',
  'flexShrink': 0,
  'touchAction': 'none',
  ':active': {
    cursor: 'grabbing',
  },
});

export const sheetDragPill = style({
  width: 36,
  height: 4,
  borderRadius: 2,
  backgroundColor: vars.color.fill,
});

export const sheetContent = style({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '0 16px 16px',
  WebkitOverflowScrolling: 'touch',
});

export const sheetHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  textAlign: 'center',
  padding: '0 16px 8px',
});
