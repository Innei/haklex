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

// ── Collapsed Bar System (thinking, tool calls) ──

export const collapsedBar = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'gap': 6,
  'padding': '6px 12px',
  'background': vars.color.fillTertiary,
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': 8,
  'fontSize': '12px',
  'color': vars.color.textTertiary,
  'cursor': 'pointer',
  'margin': '8px 0',
  'transition': 'background 120ms ease',
  ':hover': {
    background: vars.color.fillSecondary,
  },
});

export const collapsedBarExpanded = style({
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  borderBottom: 'none',
  marginBottom: 0,
});

export const collapsedBarPanel = style({
  padding: '10px 14px',
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  fontSize: '12px',
  color: vars.color.textTertiary,
  lineHeight: 1.6,
  marginBottom: 8,
});

const spinAnimation = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const collapsedBarSpinner = style({
  animation: `${spinAnimation} 1s linear infinite`,
  flexShrink: 0,
});

export const collapsedBarArrow = style({
  fontSize: '10px',
  color: vars.color.textQuaternary,
  flexShrink: 0,
  width: 10,
  textAlign: 'center',
});

export const collapsedBarMeta = style({
  color: vars.color.textQuaternary,
  fontSize: '11px',
});

export const collapsedBarDot = style({
  width: 6,
  height: 6,
  borderRadius: '50%',
  flexShrink: 0,
});

// ── Thinking (expanded content) ──

export const thinkingContent = style({
  fontStyle: 'italic',
});

// ── Tool Call (expanded content) ──

export const toolCallRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: '12px',
  color: vars.color.textTertiary,
  padding: '2px 0',
});

export const toolCallRetryButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 20,
  'height': 20,
  'flexShrink': 0,
  'border': 'none',
  'borderRadius': 4,
  'background': 'transparent',
  'color': vars.color.textQuaternary,
  'cursor': 'pointer',
  'padding': 0,
  'transition': 'color 120ms ease, background 120ms ease',
  ':hover': {
    color: vars.color.textSecondary,
    background: vars.color.fillTertiary,
  },
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
