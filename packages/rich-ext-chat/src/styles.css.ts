import { chromeRadius, chromeText, vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

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
    '&:focus-visible': { opacity: 1 },
  },
});

export const editLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
});

export const editorDialogPopup = style({});
globalStyle(`${editorDialogPopup}${editorDialogPopup}`, {
  display: 'flex',
  flexDirection: 'column',
  height: 'min(640px, 85vh)',
  overflow: 'hidden',
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

const mobile = '(max-width: 640px)';

export const modal = style({
  flex: 1,
  minHeight: 0,
});

export const modalBody = style({
  'display': 'flex',
  'overflow': 'hidden',
  '@media': {
    [mobile]: {
      flexDirection: 'column',
      overflowY: 'auto',
    },
  },
});

export const rail = style({
  'width': 280,
  'flexShrink': 0,
  'boxSizing': 'border-box',
  'borderRight': `1px solid ${vars.color.borderSubtle}`,
  'background': vars.color.bgSecondary,
  'padding': 16,
  'overflowY': 'auto',
  '@media': {
    [mobile]: {
      width: 'auto',
      overflowY: 'visible',
      borderRight: 'none',
      borderBottom: `1px solid ${vars.color.borderSubtle}`,
    },
  },
});

export const pane = style({
  'flex': 1,
  'padding': 16,
  'overflowY': 'auto',
  'minWidth': 0,
  '@media': {
    [mobile]: {
      overflowY: 'visible',
    },
  },
});

export const sectionLabel = style({
  ...chromeText.label,
  color: vars.color.textTertiary,
  marginBottom: 8,
  selectors: { '&:not(:first-child)': { marginTop: 20 } },
});

export const participantCard = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: 8,
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: chromeRadius.md,
  padding: 12,
  background: vars.color.bg,
  marginBottom: 8,
});

export const participantPill = style({
  ...chromeText.label,
  alignSelf: 'flex-start',
  padding: '2px 6px',
  borderRadius: chromeRadius.sm,
  background: vars.color.text,
  color: vars.color.bg,
});

export const participantPillUser = style({
  background: vars.color.textTertiary,
});

export const messageCard = style({
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: chromeRadius.md,
  marginBottom: 8,
  overflow: 'hidden',
  background: vars.color.bg,
});

export const messageHead = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '6px 8px 6px 12px',
  background: vars.color.bgSecondary,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
});

export const messageSelect = style({
  minWidth: 0,
  maxWidth: 240,
});

export const messageActions = style({ display: 'flex', gap: 2 });

export const messageTextarea = style({
  ...chromeText.control,
  width: '100%',
  border: 0,
  padding: '8px 12px',
  fontFamily: vars.typography.fontMono,
  color: vars.color.text,
  background: vars.color.bg,
  resize: 'vertical',
  minHeight: 72,
  boxSizing: 'border-box',
  outline: 'none',
});

export const addMessage = style({
  display: 'flex',
  justifyContent: 'center',
  margin: '8px 0 4px',
});
