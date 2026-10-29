import {
  ActionButton,
  Field,
  ModalShell,
  ModalShellBody,
  ModalShellFooter,
  ModalShellHeader,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextInput,
} from '@haklex/rich-editor-ui';
import { ArrowDown, ArrowUp, MessageSquare, Plus, Trash2 } from 'lucide-react';
import type { ChangeEvent, FC } from 'react';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';

import * as styles from './styles.css';
import type { ChatMessage, ChatParticipant, ChatVariant } from './types';
import { createMessageId } from './utils';
import { switchVariant } from './variant-reducer';

interface ChatDraft {
  messages: ChatMessage[];
  participants: ChatParticipant[];
  variant: ChatVariant;
}

export interface ChatEditorModalProps {
  dismiss: () => void;
  initial: ChatDraft;
  onCancel?: () => void;
  onCommit?: (next: ChatDraft) => void;
  onDirtyChange?: (dirty: boolean) => void;
  requestDismiss?: () => void;
}

const VARIANT_ITEMS: { label: string; value: ChatVariant }[] = [
  { value: 'user-agent', label: 'User · agent' },
  { value: 'user-user', label: 'User · user' },
];

function defaultName(p: ChatParticipant): string {
  return p.name ?? (p.kind === 'agent' ? 'Assistant' : 'User');
}

function kindLabel(p: ChatParticipant): string {
  return p.kind === 'agent' ? 'Agent' : 'User';
}

export const ChatEditorModal: FC<ChatEditorModalProps> = ({
  initial,
  dismiss,
  requestDismiss,
  onCommit,
  onCancel,
  onDirtyChange,
}) => {
  const idPrefix = useId();
  const [variant, setVariant] = useState<ChatVariant>(initial.variant);
  const [participants, setParticipants] = useState<ChatParticipant[]>(initial.participants);
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);

  const dirty = useMemo(
    () => JSON.stringify({ variant, participants, messages }) !== JSON.stringify(initial),
    [variant, participants, messages, initial],
  );

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const participantItems = useMemo(
    () => participants.map((p) => ({ value: p.id, label: `${defaultName(p)} (${kindLabel(p)})` })),
    [participants],
  );

  const handleVariantChange = useCallback((next: ChatVariant) => {
    setVariant(next);
    setParticipants((current) => switchVariant(next, current));
  }, []);

  const updateParticipant = useCallback((id: string, patch: Partial<ChatParticipant>) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const addMessage = useCallback(() => {
    setMessages((prev) => {
      const recent = prev.at(-1);
      const fallback = participants[0]?.id ?? '';
      const participantId = recent ? recent.participantId : fallback;
      return [...prev, { id: createMessageId(), participantId, content: '' }];
    });
  }, [participants]);

  const updateMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const moveMessage = useCallback((id: string, direction: -1 | 1) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx < 0) return prev;
      const target = idx + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleSave = useCallback(() => {
    onCommit?.({ variant, participants, messages });
    dismiss();
  }, [onCommit, variant, participants, messages, dismiss]);

  const handleCancel = useCallback(() => {
    if (requestDismiss) {
      requestDismiss();
      return;
    }
    onCancel?.();
    dismiss();
  }, [requestDismiss, onCancel, dismiss]);

  return (
    <ModalShell className={styles.modal} onSave={handleSave}>
      <ModalShellHeader
        icon={<MessageSquare />}
        title="Edit chat"
        center={
          <SegmentedControl items={VARIANT_ITEMS} value={variant} onChange={handleVariantChange} />
        }
        onClose={handleCancel}
      />

      <ModalShellBody className={styles.modalBody}>
        <aside className={styles.rail}>
          <div className={styles.sectionLabel}>Participants</div>
          {participants.map((p) => (
            <div className={styles.participantCard} key={p.id}>
              <span
                className={`${styles.participantPill} ${p.kind === 'user' ? styles.participantPillUser : ''}`}
              >
                {kindLabel(p)}
              </span>
              <Field id={`${idPrefix}-${p.id}-name`} label="Display name">
                <TextInput
                  id={`${idPrefix}-${p.id}-name`}
                  placeholder={defaultName(p)}
                  value={p.name ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateParticipant(p.id, { name: e.target.value || undefined })
                  }
                />
              </Field>
              <Field id={`${idPrefix}-${p.id}-avatar`} label="Avatar URL">
                <TextInput
                  id={`${idPrefix}-${p.id}-avatar`}
                  placeholder="Optional"
                  type="url"
                  value={p.avatar ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateParticipant(p.id, { avatar: e.target.value || undefined })
                  }
                />
              </Field>
            </div>
          ))}
        </aside>

        <div className={styles.pane}>
          <div className={styles.sectionLabel}>Messages</div>

          {messages.map((m, index) => (
            <div className={styles.messageCard} key={m.id}>
              <div className={styles.messageHead}>
                <Select
                  items={participantItems}
                  value={m.participantId}
                  onValueChange={(value) => {
                    if (typeof value === 'string') updateMessage(m.id, { participantId: value });
                  }}
                >
                  <SelectTrigger
                    aria-label={`Author of message ${index + 1}`}
                    className={styles.messageSelect}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {participantItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className={styles.messageActions}>
                  <ActionButton
                    icon
                    aria-label="Move up"
                    disabled={index === 0}
                    size="sm"
                    onClick={() => moveMessage(m.id, -1)}
                  >
                    <ArrowUp />
                  </ActionButton>
                  <ActionButton
                    icon
                    aria-label="Move down"
                    disabled={index === messages.length - 1}
                    size="sm"
                    onClick={() => moveMessage(m.id, 1)}
                  >
                    <ArrowDown />
                  </ActionButton>
                  <ActionButton
                    danger
                    icon
                    aria-label="Delete message"
                    size="sm"
                    onClick={() => deleteMessage(m.id)}
                  >
                    <Trash2 />
                  </ActionButton>
                </div>
              </div>
              <textarea
                aria-label={`Message ${index + 1}`}
                className={styles.messageTextarea}
                value={m.content}
                onChange={(e) => updateMessage(m.id, { content: e.target.value })}
              />
            </div>
          ))}

          <div className={styles.addMessage}>
            <ActionButton size="md" variant="outline" onClick={addMessage}>
              <Plus />
              Add message
            </ActionButton>
          </div>
        </div>
      </ModalShellBody>

      <ModalShellFooter
        dirty={dirty}
        status={`${messages.length} ${messages.length === 1 ? 'message' : 'messages'}`}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </ModalShell>
  );
};
