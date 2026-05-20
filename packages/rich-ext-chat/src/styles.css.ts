import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
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
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: vars.color.bgTertiary,
  border: `1px solid ${vars.color.border}`,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 600,
  color: vars.color.textTertiary,
  overflow: 'hidden',
});

export const avatarSmall = style({
  width: 24,
  height: 24,
  fontSize: 11,
});

export const avatarDark = style({
  background: vars.color.text,
  color: vars.color.bg,
  borderColor: vars.color.text,
});

export const avatarImg = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const bubble = style({
  'maxWidth': '70%',
  'padding': '10px 14px',
  'background': vars.color.bgTertiary,
  'color': vars.color.text,
  'fontSize': 15,
  'lineHeight': 1.6,
  '@media': {
    '(max-width: 600px)': { maxWidth: '85%' },
  },
});

export const bubbleRightTail = style({
  borderRadius: '14px 14px 4px 14px',
});

export const bubbleLeftTail = style({
  borderRadius: '14px 14px 14px 4px',
});

export const agent = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
});

export const agentHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,
});

export const agentHeaderName = style({
  fontSize: 13,
  fontWeight: 500,
  color: vars.color.text,
});

export const article = style({
  color: 'inherit',
  fontSize: 15,
  lineHeight: 1.7,
});

export const authorCluster = style({
  'display': 'flex',
  'flexDirection': 'column',
  'flex': '1 1 auto',
  'alignItems': 'flex-start',
  'maxWidth': '70%',
  'minWidth': 0,
  '@media': {
    '(max-width: 600px)': { maxWidth: '85%' },
  },
});

export const authorClusterRight = style({
  alignItems: 'flex-end',
});

export const authorLabel = style({
  fontSize: 12,
  fontWeight: 500,
  color: vars.color.textTertiary,
  marginBottom: 4,
  padding: '0 4px',
});

export const empty = style({
  color: vars.color.textTertiary,
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
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 6,
  padding: '4px 10px',
  fontSize: 12,
  fontWeight: 500,
  color: vars.color.text,
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
  background: vars.color.bg,
  color: vars.color.text,
  borderRadius: 14,
  width: 920,
  maxWidth: '95vw',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const modalHeader = style({
  padding: '14px 22px',
  borderBottom: `1px solid ${vars.color.border}`,
  fontSize: 14,
  fontWeight: 600,
  color: vars.color.text,
});

export const modalBody = style({
  display: 'flex',
  height: 540,
});

export const rail = style({
  width: 280,
  flexShrink: 0,
  borderRight: `1px solid ${vars.color.border}`,
  background: vars.color.bgSecondary,
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
  color: vars.color.textTertiary,
  marginBottom: 8,
  fontWeight: 500,
  selectors: { '&:not(:first-child)': { marginTop: 22 } },
});

export const variantStack = style({ display: 'flex', flexDirection: 'column', gap: 6 });
export const variantPill = style({
  padding: '9px 11px',
  border: `1px solid ${vars.color.border}`,
  borderRadius: 8,
  cursor: 'pointer',
  background: vars.color.bg,
  color: vars.color.text,
  textAlign: 'left',
});
export const variantPillActive = style({ borderColor: vars.color.text });

export const variantPillName = style({
  fontSize: 13,
  fontWeight: 600,
});
export const variantPillHint = style({
  fontSize: 11,
  color: vars.color.textTertiary,
});

export const participantCard = style({
  border: `1px solid ${vars.color.border}`,
  borderRadius: 8,
  padding: '9px 10px',
  background: vars.color.bg,
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
  background: vars.color.text,
  color: vars.color.bg,
  fontWeight: 600,
});
export const participantPillUser = style({
  background: vars.color.textTertiary,
});
export const participantLabel = style({
  fontSize: 10.5,
  color: vars.color.textTertiary,
  width: 42,
});
export const participantInput = style({
  flex: 1,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 5,
  padding: '4px 7px',
  fontSize: 12.5,
  background: vars.color.bg,
  color: vars.color.text,
  width: 0,
  outline: 'none',
  selectors: {
    '&:focus': {
      borderColor: `color-mix(in srgb, ${vars.color.text} 40%, transparent)`,
    },
  },
});

export const messageCard = style({
  border: `1px solid ${vars.color.border}`,
  borderRadius: 10,
  marginBottom: 10,
  overflow: 'hidden',
  background: vars.color.bg,
});
export const messageHead = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '7px 12px',
  background: vars.color.bgSecondary,
  borderBottom: `1px solid ${vars.color.border}`,
});
export const messageSelect = style({
  background: vars.color.bg,
  color: vars.color.text,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 5,
  padding: '3px 6px',
  fontSize: 12,
});
export const messageActions = style({ display: 'flex', gap: 2 });
export const messageTextarea = style({
  width: '100%',
  border: 0,
  padding: '10px 12px',
  fontFamily: '-apple-system, "JetBrains Mono", monospace',
  fontSize: 13,
  lineHeight: 1.55,
  color: vars.color.text,
  background: vars.color.bg,
  resize: 'vertical',
  minHeight: 70,
  boxSizing: 'border-box',
  outline: 'none',
});

export const addMessage = style({
  display: 'flex',
  justifyContent: 'center',
  margin: '10px 0 4px',
});
export const addMessageButton = style({
  border: `1px dashed ${vars.color.border}`,
  background: 'transparent',
  color: vars.color.textTertiary,
  padding: '6px 14px',
  borderRadius: 6,
  fontSize: 13,
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      color: vars.color.text,
      borderColor: `color-mix(in srgb, ${vars.color.text} 40%, transparent)`,
    },
  },
});

export const modalFooter = style({
  padding: '12px 22px',
  borderTop: `1px solid ${vars.color.border}`,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
  background: vars.color.bgSecondary,
});
export const button = style({
  fontSize: 13,
  padding: '6px 12px',
  borderRadius: 6,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bg,
  color: vars.color.text,
  cursor: 'pointer',
});
export const buttonPrimary = style({
  background: vars.color.text,
  color: vars.color.bg,
  borderColor: vars.color.text,
});
export const buttonGhost = style({
  borderColor: 'transparent',
  background: 'transparent',
  color: vars.color.textTertiary,
  selectors: {
    '&:hover': {
      color: vars.color.text,
      background: `color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
    },
  },
});
