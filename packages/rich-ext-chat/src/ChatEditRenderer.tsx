import { useColorScheme } from '@haklex/rich-editor';
import { presentDialog } from '@haklex/rich-editor-ui';
import { usePortalTheme } from '@haklex/rich-style-token';
import { Pencil } from 'lucide-react';
import type { FC } from 'react';
import { useCallback } from 'react';

import { ChatEditorModal } from './ChatEditorModal';
import { ChatRenderer } from './ChatRenderer';
import {
  editContainer,
  editLabel,
  editorDialogPopup,
  editOverlay,
  semanticClassNames,
} from './styles.css';
import type { ChatMessage, ChatParticipant, ChatVariant } from './types';

export interface ChatEditRendererProps {
  autoOpen?: boolean;
  messages: ChatMessage[];
  onCancel?: () => void;
  onChange?: (next: {
    variant: ChatVariant;
    participants: ChatParticipant[];
    messages: ChatMessage[];
  }) => void;
  participants: ChatParticipant[];
  variant: ChatVariant;
}

export const ChatEditRenderer: FC<ChatEditRendererProps> = ({
  variant,
  participants,
  messages,
  onChange,
  onCancel,
  autoOpen: _autoOpen,
}) => {
  const { className: portalClassName } = usePortalTheme();
  const colorScheme = useColorScheme();

  const openEditor = useCallback(() => {
    presentDialog({
      content: ({ dismiss }) => (
        <ChatEditorModal
          dismiss={dismiss}
          initial={{ variant, participants, messages }}
          onCancel={onCancel}
          onCommit={onChange}
        />
      ),
      className: editorDialogPopup,
      portalClassName,
      theme: colorScheme,
      showCloseButton: false,
      clickOutsideToDismiss: false,
    });
  }, [variant, participants, messages, onChange, onCancel, portalClassName, colorScheme]);

  return (
    <div className={`${editContainer} ${semanticClassNames.editContainer}`}>
      <ChatRenderer messages={messages} participants={participants} variant={variant} />
      <button
        aria-label="Edit chat"
        className={`${editOverlay} ${semanticClassNames.editOverlay}`}
        type="button"
        onClick={openEditor}
      >
        <span className={`${editLabel} ${semanticClassNames.editLabel}`}>
          <Pencil size={14} /> Edit
        </span>
      </button>
    </div>
  );
};
