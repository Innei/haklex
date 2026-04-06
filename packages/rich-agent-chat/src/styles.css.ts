import { vars } from '@haklex/rich-style-token/styles';
import { keyframes, style } from '@vanilla-extract/css';

// ── Layout ──

export const chatPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  height: '100%',
  minHeight: 0,
  boxSizing: 'border-box',
  padding: 0,
  fontSize: '14px',
  background: vars.color.bg,
  overflow: 'hidden',
});

export const messageList = style({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: '20px 18px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
});

// ── User Bubble ──

export const bubbleUser = style({
  alignSelf: 'flex-end',
  maxWidth: '82%',
  padding: '10px 14px',
  background: vars.color.text,
  color: vars.color.bg,
  borderRadius: '18px 18px 6px 18px',
  lineHeight: 1.5,
  fontSize: '14px',
});

// ── Assistant Prose ──

export const proseAssistant = style({
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.text,
  textAlign: 'left',
});

// ── Tool Call Row System ──

export const toolCallRow = style({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: 8,
  padding: '4px 0',
  fontSize: '13px',
  color: vars.color.textTertiary,
  cursor: 'default',
  transition: 'color 120ms ease',
  border: 'none',
  background: 'none',
  textAlign: 'left',
  fontFamily: 'inherit',
  lineHeight: 1.4,
  selectors: {
    '&[data-expandable="true"]': {
      cursor: 'pointer',
    },
    '&[data-expandable="true"]:hover': {
      color: vars.color.text,
    },
  },
});

export const toolCallStatusIcon = style({
  display: 'flex',
  width: 16,
  height: 16,
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const toolCallPendingDot = style({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: vars.color.textQuaternary,
  opacity: 0.4,
});

export const toolCallName = style({
  fontFamily: vars.typography.fontMono,
  fontSize: '13px',
  flexShrink: 0,
});

export const toolCallDesc = style({
  color: vars.color.textQuaternary,
  fontSize: '13px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
  minWidth: 0,
});

export const toolCallDuration = style({
  fontFamily: vars.typography.fontMono,
  fontSize: '12px',
  color: vars.color.textQuaternary,
  opacity: 0.5,
  flexShrink: 0,
});

export const toolCallChevron = style({
  width: 12,
  height: 12,
  flexShrink: 0,
  color: vars.color.textQuaternary,
  opacity: 0.4,
  transition: 'transform 150ms ease',
  selectors: {
    '&[data-expanded="true"]': {
      transform: 'rotate(90deg)',
    },
  },
});

export const toolCallDetail = style({
  display: 'grid',
  transition: 'grid-template-rows 150ms ease',
  gridTemplateRows: '0fr',
  selectors: {
    '&[data-open="true"]': {
      gridTemplateRows: '1fr',
    },
  },
});

export const toolCallDetailInner = style({
  overflow: 'hidden',
});

export const toolCallDetailContent = style({
  paddingLeft: 24,
  paddingBottom: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const toolCallResultPre = style({
  margin: 0,
  overflowX: 'auto',
  padding: 6,
  background: vars.color.fillQuaternary,
  borderRadius: vars.borderRadius.sm,
  fontFamily: vars.typography.fontMono,
  fontSize: '11px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  color: vars.color.textSecondary,
});

export const toolCallErrorPre = style({
  margin: 0,
  overflowX: 'auto',
  padding: 6,
  background: 'rgba(220, 38, 38, 0.04)',
  borderRadius: vars.borderRadius.sm,
  fontFamily: vars.typography.fontMono,
  fontSize: '11px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  color: 'var(--hk-color-text-error, #dc2626)',
});

export const toolCallGroupItems = style({
  paddingLeft: 16,
  paddingTop: 2,
});

export const toolCallGroupCounter = style({
  fontFamily: vars.typography.fontMono,
  fontSize: '12px',
  color: vars.color.textQuaternary,
  opacity: 0.5,
});

// ── Thinking Chain ──

export const thinkingRow = style({
  'display': 'flex',
  'width': '100%',
  'alignItems': 'center',
  'gap': 8,
  'padding': '4px 0',
  'fontSize': '13px',
  'color': vars.color.textTertiary,
  'cursor': 'pointer',
  'transition': 'color 120ms ease',
  'border': 'none',
  'background': 'none',
  'textAlign': 'left',
  'fontFamily': 'inherit',
  'lineHeight': 1.4,
  ':hover': {
    color: vars.color.text,
  },
});

export const thinkingSteps = style({
  paddingLeft: 24,
  paddingTop: 4,
  paddingBottom: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: '13px',
  color: vars.color.textTertiary,
  lineHeight: 1.6,
});

const pulseAnimation = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.3 },
});

export const pulseDot = style({
  width: 4,
  height: 4,
  borderRadius: '50%',
  background: vars.color.textTertiary,
  animation: `${pulseAnimation} 1.2s ease-in-out infinite`,
});

export const toolCallJson = style({
  margin: 0,
  overflowX: 'auto',
  padding: 6,
  background: vars.color.fillQuaternary,
  borderRadius: vars.borderRadius.sm,
  fontFamily: vars.typography.fontMono,
  fontSize: '11px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
});

// ── Error ──

export const errorInline = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
  fontSize: '13px',
  color: 'var(--hk-color-text-error, #dc2626)',
  lineHeight: 1.5,
  margin: '8px 0',
});

export const errorRetryLink = style({
  'fontSize': '12px',
  'color': 'var(--hk-color-text-error, #dc2626)',
  'textDecoration': 'underline',
  'cursor': 'pointer',
  'background': 'none',
  'border': 'none',
  'padding': 0,
  'fontFamily': 'inherit',
  'whiteSpace': 'nowrap',
  ':hover': {
    opacity: 0.8,
  },
});

// ── Diff Summary ──

export const bubbleTool = style({
  alignSelf: 'flex-start',
  maxWidth: '86%',
  padding: '8px 12px',
  background: vars.color.fill,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 8,
  fontSize: '12px',
  color: vars.color.textTertiary,
});

// ── Composer Card ──

export const composerDock = style({
  flexShrink: 0,
  padding: '10px 18px 14px',
  display: 'flex',
  flexDirection: 'column',
});

const statusDotPing = keyframes({
  '75%, 100%': { transform: 'scale(2)', opacity: 0 },
});

export const composerStatusDotOuter = style({
  position: 'absolute',
  display: 'inline-flex',
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: '#34d399',
  opacity: 0.75,
  animation: `${statusDotPing} 1s cubic-bezier(0, 0, 0.2, 1) infinite`,
});

export const composerStatusDotInner = style({
  position: 'relative',
  display: 'inline-flex',
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: '#22c55e',
});

export const composerStatusLine = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: '12px',
  color: vars.color.textTertiary,
  marginBottom: 8,
  marginLeft: 4,
});

export const composerStatusDotWrap = style({
  position: 'relative',
  display: 'flex',
  width: 6,
  height: 6,
  flexShrink: 0,
});

export const composerBox = style({
  position: 'relative',
  border: `1px solid ${vars.color.border}`,
  borderRadius: 16,
  background: vars.color.bg,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  transition: 'border-color 150ms ease',
  selectors: {
    '&:focus-within': {
      borderColor: vars.color.textTertiary,
    },
  },
});

export const composerTextArea = style({
  width: '100%',
  resize: 'none',
  padding: '14px 16px 48px',
  border: 'none',
  borderRadius: 0,
  background: 'transparent',
  boxShadow: 'none',
  fontSize: '13px',
  lineHeight: 1.65,
  color: vars.color.text,
  selectors: {
    '&:focus': {
      borderColor: 'transparent',
      boxShadow: 'none',
      outline: 'none',
    },
    '&::placeholder': {
      color: vars.color.textTertiary,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
});

export const composerBottomBar = style({
  position: 'absolute',
  bottom: 10,
  left: 10,
  right: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const composerSendButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 30,
  'height': 30,
  'flexShrink': 0,
  'border': 'none',
  'borderRadius': '50%',
  'background': vars.color.text,
  'color': vars.color.bg,
  'cursor': 'pointer',
  'transition': 'opacity 160ms ease',
  ':hover': {
    opacity: 0.85,
  },
  ':disabled': {
    background: vars.color.fillSecondary,
    color: vars.color.textQuaternary,
    cursor: 'not-allowed',
  },
});

// ── Selection Indicator ──

export const selectionIndicator = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  marginBottom: 6,
  background: vars.color.fillSecondary,
  borderRadius: 8,
  fontSize: '12px',
  color: vars.color.textSecondary,
  lineHeight: 1.4,
});

export const selectionIndicatorIcon = style({
  flexShrink: 0,
  color: vars.color.textTertiary,
});

export const selectionIndicatorText = style({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const selectionIndicatorDismiss = style({
  'flexShrink': 0,
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 16,
  'height': 16,
  'border': 'none',
  'borderRadius': '50%',
  'background': 'none',
  'color': vars.color.textTertiary,
  'cursor': 'pointer',
  'padding': 0,
  ':hover': {
    color: vars.color.text,
  },
});

export const composerAbortButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 30,
  'height': 30,
  'flexShrink': 0,
  'border': '1px solid var(--hk-color-text-error, #dc2626)',
  'borderRadius': '50%',
  'background': vars.color.bg,
  'color': 'var(--hk-color-text-error, #dc2626)',
  'cursor': 'pointer',
  'transition': 'background 160ms ease',
  ':hover': {
    background: 'rgba(220, 38, 38, 0.06)',
  },
});
