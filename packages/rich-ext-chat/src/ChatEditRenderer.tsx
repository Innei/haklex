import { useColorScheme } from '@haklex/rich-editor/static';
import { confirmDiscardChanges, presentDialog } from '@haklex/rich-editor-ui';
import { usePortalTheme } from '@haklex/rich-style-token';
import { Pencil } from 'lucide-react';
import type { FC } from 'react';
import { useCallback, useEffect } from 'react';

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
  messages: ChatMessage[];
  onCancel?: () => void;
  onChange?: (next: {
    variant: ChatVariant;
    participants: ChatParticipant[];
    messages: ChatMessage[];
  }) => void;
  participants: ChatParticipant[];
  registerOpenTrigger?: (open: () => void) => void;
  variant: ChatVariant;
}

export const ChatEditRenderer: FC<ChatEditRendererProps> = ({
  variant,
  participants,
  messages,
  onChange,
  onCancel,
  registerOpenTrigger,
}) => {
  const { className: portalClassName } = usePortalTheme();
  const colorScheme = useColorScheme();

  const openEditor = useCallback(() => {
    let dirty = false;
    let saved = false;
    presentDialog({
      content: ({ dismiss, requestDismiss }) => (
        <ChatEditorModal
          dismiss={dismiss}
          initial={{ variant, participants, messages }}
          requestDismiss={requestDismiss}
          onCommit={(next) => {
            saved = true;
            onChange?.(next);
          }}
          onDirtyChange={(next) => {
            dirty = next;
          }}
        />
      ),
      className: editorDialogPopup,
      portalClassName,
      theme: colorScheme,
      width: 920,
      sheet: 'auto',
      showCloseButton: false,
      confirmDismiss: () => !dirty || confirmDiscardChanges(),
      onClose: () => {
        if (!saved) onCancel?.();
      },
    });
  }, [variant, participants, messages, onChange, onCancel, portalClassName, colorScheme]);

  useEffect(() => {
    registerOpenTrigger?.(openEditor);
  }, [openEditor, registerOpenTrigger]);

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
