import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  padding: '12px 0',
});

export const row = style({
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
});

export const rowRight = style({
  justifyContent: 'flex-end',
});

export const avatar = style({
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: '#f5f5f5',
  border: '1px solid #e5e5e5',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 600,
  color: '#737373',
  overflow: 'hidden',
});

export const avatarDark = style({
  background: '#1f1f1f',
  color: '#ffffff',
  borderColor: '#1f1f1f',
});

export const avatarImg = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const bubble = style({
  'maxWidth': '70%',
  'padding': '10px 14px',
  'borderRadius': 14,
  'fontSize': 14.5,
  'lineHeight': 1.55,
  '@media': {
    '(max-width: 600px)': { maxWidth: '85%' },
  },
});

export const userBubble = style({
  background: '#1f1f1f',
  color: '#ffffff',
  borderRadius: '14px 14px 4px 14px',
});

export const leftBubble = style({
  background: '#f5f5f5',
  color: '#1f1f1f',
  borderRadius: '14px 14px 14px 4px',
  border: '1px solid #ececec',
});

export const rightBubble = style({
  background: '#1f1f1f',
  color: '#ffffff',
  borderRadius: '14px 14px 4px 14px',
});

export const author = style({
  fontSize: 11,
  color: '#737373',
  marginBottom: 4,
  fontWeight: 500,
});

export const authorOnDark = style({
  color: '#a3a3a3',
});

export const article = style({
  flex: 1,
  color: 'inherit',
  fontSize: 15,
  lineHeight: 1.65,
  padding: '4px 0',
});

export const articleHeader = style({
  fontSize: 11,
  color: '#a3a3a3',
  marginBottom: 6,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
});

export const empty = style({
  color: '#737373',
  fontSize: 13,
  fontStyle: 'italic',
  padding: '8px 0',
});

export const semanticClassNames = {
  container: 'rich-chat-container',
  row: 'rich-chat-row',
  bubble: 'rich-chat-bubble',
  article: 'rich-chat-article',
  avatar: 'rich-chat-avatar',
  author: 'rich-chat-author',
  empty: 'rich-chat-empty',
} as const;
