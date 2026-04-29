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

export const editContainer = style({
  position: 'relative',
});

export const editOverlay = style({
  position: 'absolute',
  top: 8,
  right: 8,
  background: '#ffffff',
  border: '1px solid #e5e5e5',
  borderRadius: 6,
  padding: '4px 10px',
  fontSize: 12,
  fontWeight: 500,
  color: '#1f1f1f',
  opacity: 0,
  transition: 'opacity 120ms ease',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  selectors: {
    [`${editContainer}:hover &`]: { opacity: 1 },
  },
});

export const editLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
});

export const editorDialogPopup = style({
  width: 920,
  maxWidth: '95vw',
});

export const semanticClassNames = {
  container: 'rich-chat-container',
  row: 'rich-chat-row',
  bubble: 'rich-chat-bubble',
  article: 'rich-chat-article',
  avatar: 'rich-chat-avatar',
  author: 'rich-chat-author',
  empty: 'rich-chat-empty',
  editContainer: 'rich-chat-edit-container',
  editOverlay: 'rich-chat-edit-overlay',
  editLabel: 'rich-chat-edit-label',
} as const;

export const modal = style({
  background: '#ffffff',
  borderRadius: 14,
  width: 920,
  maxWidth: '95vw',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const modalHeader = style({
  padding: '14px 22px',
  borderBottom: '1px solid #ececec',
  fontSize: 14,
  fontWeight: 600,
});

export const modalBody = style({
  display: 'flex',
  height: 540,
});

export const rail = style({
  width: 280,
  flexShrink: 0,
  borderRight: '1px solid #ececec',
  background: '#fafafa',
  padding: '18px 18px 14px',
  overflowY: 'auto',
});

export const pane = style({
  flex: 1,
  padding: '14px 22px 18px',
  overflowY: 'auto',
  minWidth: 0,
});

export const sectionLabel = style({
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#737373',
  marginBottom: 8,
  fontWeight: 500,
  selectors: { '&:not(:first-child)': { marginTop: 22 } },
});

export const variantStack = style({ display: 'flex', flexDirection: 'column', gap: 6 });
export const variantPill = style({
  padding: '9px 11px',
  border: '1px solid #e5e5e5',
  borderRadius: 8,
  cursor: 'pointer',
  background: '#ffffff',
});
export const variantPillActive = style({ borderColor: '#1f1f1f' });

export const participantCard = style({
  border: '1px solid #ececec',
  borderRadius: 8,
  padding: '9px 10px',
  background: '#ffffff',
  marginBottom: 8,
});
export const participantRow = style({
  display: 'flex',
  gap: 6,
  alignItems: 'center',
  marginBottom: 5,
});
export const participantPill = style({
  fontSize: 9.5,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  padding: '2px 6px',
  borderRadius: 4,
  background: '#1f1f1f',
  color: '#ffffff',
  fontWeight: 600,
});
export const participantPillUser = style({ background: '#737373' });
export const participantInput = style({
  flex: 1,
  border: '1px solid #e5e5e5',
  borderRadius: 5,
  padding: '4px 7px',
  fontSize: 12.5,
  background: '#ffffff',
  color: '#1f1f1f',
  width: 0,
});

export const messageCard = style({
  border: '1px solid #ececec',
  borderRadius: 10,
  marginBottom: 10,
  overflow: 'hidden',
});
export const messageHead = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '7px 12px',
  background: '#fafafa',
  borderBottom: '1px solid #ececec',
});
export const messageActions = style({ display: 'flex', gap: 2 });
export const messageTextarea = style({
  width: '100%',
  border: 0,
  padding: '10px 12px',
  fontFamily: '-apple-system, "JetBrains Mono", monospace',
  fontSize: 13,
  lineHeight: 1.55,
  color: '#1f1f1f',
  resize: 'vertical',
  minHeight: 70,
  boxSizing: 'border-box',
});

export const addMessage = style({
  display: 'flex',
  justifyContent: 'center',
  margin: '10px 0 4px',
});
export const addMessageButton = style({
  border: '1px dashed #cfcfcf',
  background: 'transparent',
  color: '#737373',
  padding: '6px 14px',
  borderRadius: 6,
  fontSize: 13,
  cursor: 'pointer',
});

export const modalFooter = style({
  padding: '12px 22px',
  borderTop: '1px solid #ececec',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
  background: '#fafafa',
});
export const button = style({
  fontSize: 13,
  padding: '6px 12px',
  borderRadius: 6,
  border: '1px solid #e5e5e5',
  background: '#ffffff',
  color: '#1f1f1f',
  cursor: 'pointer',
});
export const buttonPrimary = style({
  background: '#1f1f1f',
  color: '#ffffff',
  borderColor: '#1f1f1f',
});
export const buttonGhost = style({ borderColor: 'transparent', color: '#737373' });
