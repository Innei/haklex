import { style } from '@vanilla-extract/css';

export const chatPanel = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderLeft: '1px solid #e5e5e5',
  fontSize: '14px',
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
  background: '#f3f3f3',
  borderRadius: '12px 12px 2px 12px',
  padding: '8px 12px',
  maxWidth: '80%',
});

export const bubbleAssistant = style({
  alignSelf: 'flex-start',
  background: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: '12px 12px 12px 2px',
  padding: '8px 12px',
  maxWidth: '80%',
});

export const bubbleTool = style({
  alignSelf: 'flex-start',
  background: '#f9f9f9',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  padding: '6px 10px',
  fontSize: '12px',
  color: '#737373',
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
  display: 'flex',
  padding: '8px 12px',
  borderTop: '1px solid #e5e5e5',
  gap: '8px',
});

export const inputField = style({
  'flex': 1,
  'border': '1px solid #e5e5e5',
  'borderRadius': '8px',
  'padding': '8px 12px',
  'fontSize': '14px',
  'outline': 'none',
  ':focus': {
    borderColor: '#a3a3a3',
  },
});

export const sendButton = style({
  'padding': '8px 16px',
  'background': '#171717',
  'color': '#fff',
  'border': 'none',
  'borderRadius': '8px',
  'cursor': 'pointer',
  'fontSize': '14px',
  ':hover': {
    background: '#404040',
  },
  ':disabled': {
    background: '#a3a3a3',
    cursor: 'not-allowed',
  },
});
