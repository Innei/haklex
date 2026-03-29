import { vars } from '@haklex/rich-style-token';
import { style } from '@vanilla-extract/css';

export const chatPanel = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  fontSize: '14px',
  background: vars.color.bg,
});

export const messageList = style({
  flex: 1,
  overflowY: 'auto',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const bubbleUser = style({
  alignSelf: 'flex-end',
  background: vars.color.bgTertiary,
  borderRadius: '12px 12px 2px 12px',
  padding: '8px 12px',
  maxWidth: '80%',
});

export const bubbleAssistant = style({
  alignSelf: 'flex-start',
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '12px 12px 12px 2px',
  padding: '8px 12px',
  maxWidth: '80%',
});

export const bubbleTool = style({
  alignSelf: 'flex-start',
  background: vars.color.fillQuaternary,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '8px',
  padding: '6px 10px',
  fontSize: '12px',
  color: vars.color.textTertiary,
  maxWidth: '80%',
});

export const bubbleError = style({
  alignSelf: 'center',
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '8px',
  padding: '6px 10px',
  fontSize: '12px',
  color: 'rgb(239, 68, 68)',
});

export const inputContainer = style({
  borderTop: `1px solid ${vars.color.border}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
});

export const inputTextArea = style({
  padding: '10px 12px',
});

export const inputBottomBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '6px 8px',
});

export const thinkingBlock = style({
  color: '#a3a3a3',
  fontSize: '12px',
  fontStyle: 'italic',
  borderLeft: '2px solid #e5e5e5',
  paddingLeft: '8px',
  marginBottom: '4px',
  maxWidth: '80%',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

export const toolCallRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: vars.color.textTertiary,
  cursor: 'pointer',
  padding: '2px 0',
});

export const toolCallDetail = style({
  marginLeft: '28px',
  marginTop: '4px',
  fontSize: '11px',
});

export const toolCallJson = style({
  background: vars.color.fillQuaternary,
  padding: '6px',
  borderRadius: vars.borderRadius.sm,
  margin: 0,
  overflowX: 'auto',
  fontFamily: vars.typography.fontMono,
  fontSize: '11px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
});
