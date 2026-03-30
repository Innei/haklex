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
  background: vars.color.bgSecondary,
  overflow: 'hidden',
});

export const messageList = style({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: '16px 18px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
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
  fontSize: '13px',
  marginBottom: 12,
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
  background: 'rgba(34, 197, 94, 0.05)',
  borderRadius: vars.borderRadius.sm,
  fontFamily: vars.typography.fontMono,
  fontSize: '11px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  color: '#22c55e',
});

export const toolCallErrorPre = style({
  margin: 0,
  overflowX: 'auto',
  padding: 6,
  background: 'rgba(239, 68, 68, 0.05)',
  borderRadius: vars.borderRadius.sm,
  fontFamily: vars.typography.fontMono,
  fontSize: '11px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  color: '#ef4444',
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

const bounceAnimation = keyframes({
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-3px)' },
});

export const bounceDot = style({
  width: 4,
  height: 4,
  borderRadius: '50%',
  background: vars.color.textTertiary,
  animation: `${bounceAnimation} 0.6s ease-in-out infinite`,
});

const pulseAnimation = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

export const thinkingSkeleton = style({
  height: 14,
  borderRadius: 4,
  background: vars.color.fillTertiary,
  animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
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
  color: '#ef4444',
  lineHeight: 1.5,
  margin: '8px 0',
});

export const errorRetryLink = style({
  'fontSize': '12px',
  'color': '#ef4444',
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

// ── Diff Summary (kept as-is per spec) ──

export const bubbleTool = style({
  alignSelf: 'flex-start',
  maxWidth: '86%',
  padding: '8px 12px',
  background: vars.color.fill,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 14,
  fontSize: '12px',
  color: vars.color.textTertiary,
});

// ── Composer Card ──

export const composerDock = style({
  flexShrink: 0,
  borderTop: `1px solid ${vars.color.border}`,
  padding: '10px 18px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
});

export const composerStatusLine = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: '11px',
  color: '#22c55e',
  marginBottom: 8,
});

export const composerTextArea = style({
  padding: 0,
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
    },
    '&::placeholder': {
      color: vars.color.textTertiary,
    },
  },
});

export const composerBottomBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  paddingTop: 8,
});

export const composerSendButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 32,
  'height': 32,
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

export const composerAbortButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 32,
  'height': 32,
  'flexShrink': 0,
  'border': '1px solid rgba(239, 68, 68, 0.3)',
  'borderRadius': '50%',
  'background': vars.color.bg,
  'color': '#ef4444',
  'cursor': 'pointer',
  'transition': 'background 160ms ease',
  ':hover': {
    background: 'rgba(239, 68, 68, 0.06)',
  },
});
