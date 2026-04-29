import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import type { ChangeEvent, FC } from 'react';
import { useCallback, useState } from 'react';

import * as styles from './styles.css';
import type { ChatMessage, ChatParticipant, ChatVariant } from './types';
import { createMessageId } from './utils';
import { switchVariant } from './variant-reducer';

export interface ChatEditorModalProps {
  dismiss: () => void;
  initial: { variant: ChatVariant; participants: ChatParticipant[]; messages: ChatMessage[] };
  onCancel?: () => void;
  onCommit?: (next: {
    variant: ChatVariant;
    participants: ChatParticipant[];
    messages: ChatMessage[];
  }) => void;
}

const VARIANT_LABELS: Record<ChatVariant, { name: string; hint: string }> = {
  'user-agent': { name: 'user · agent', hint: 'Bubble + article' },
  'user-user': { name: 'user · user', hint: 'Both bubbles' },
};

function defaultName(p: ChatParticipant): string {
  return p.name ?? (p.kind === 'agent' ? 'Assistant' : 'User');
}

export const ChatEditorModal: FC<ChatEditorModalProps> = ({
  initial,
  dismiss,
  onCommit,
  onCancel,
}) => {
  const [variant, setVariant] = useState<ChatVariant>(initial.variant);
  const [participants, setParticipants] = useState<ChatParticipant[]>(initial.participants);
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);

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

  const handleDone = useCallback(() => {
    onCommit?.({ variant, participants, messages });
    dismiss();
  }, [onCommit, variant, participants, messages, dismiss]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    dismiss();
  }, [onCancel, dismiss]);

  return (
    <div className={styles.modal}>
      <div className={styles.modalHeader}>Edit chat</div>

      <div className={styles.modalBody}>
        <aside className={styles.rail}>
          <div className={styles.sectionLabel}>Variant</div>
          <div className={styles.variantStack}>
            {(Object.keys(VARIANT_LABELS) as ChatVariant[]).map((key) => (
              <button
                className={`${styles.variantPill} ${variant === key ? styles.variantPillActive : ''}`}
                key={key}
                type="button"
                onClick={() => handleVariantChange(key)}
              >
                <div style={{ fontSize: 13, fontWeight: 600 }}>{VARIANT_LABELS[key].name}</div>
                <div style={{ fontSize: 11, color: '#737373' }}>{VARIANT_LABELS[key].hint}</div>
              </button>
            ))}
          </div>

          <div className={styles.sectionLabel}>Participants</div>
          {participants.map((p) => (
            <div className={styles.participantCard} key={p.id}>
              <div className={styles.participantRow}>
                <span
                  className={`${styles.participantPill} ${p.kind === 'user' ? styles.participantPillUser : ''}`}
                >
                  {p.kind}
                </span>
                <input
                  className={styles.participantInput}
                  placeholder="Display name"
                  type="text"
                  value={p.name ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateParticipant(p.id, { name: e.target.value || undefined })
                  }
                />
              </div>
              <div className={styles.participantRow}>
                <span style={{ fontSize: 10.5, color: '#737373', width: 42 }}>Avatar</span>
                <input
                  className={styles.participantInput}
                  placeholder="URL (optional)"
                  type="text"
                  value={p.avatar ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateParticipant(p.id, { avatar: e.target.value || undefined })
                  }
                />
              </div>
            </div>
          ))}
        </aside>

        <main className={styles.pane}>
          <div className={styles.sectionLabel}>Messages — {messages.length}</div>

          {messages.map((m) => (
            <div className={styles.messageCard} key={m.id}>
              <div className={styles.messageHead}>
                <select
                  value={m.participantId}
                  onChange={(e) => updateMessage(m.id, { participantId: e.target.value })}
                >
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {defaultName(p)} ({p.kind})
                    </option>
                  ))}
                </select>
                <div className={styles.messageActions}>
                  <button
                    aria-label="Move up"
                    className={`${styles.button} ${styles.buttonGhost}`}
                    type="button"
                    onClick={() => moveMessage(m.id, -1)}
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    aria-label="Move down"
                    className={`${styles.button} ${styles.buttonGhost}`}
                    type="button"
                    onClick={() => moveMessage(m.id, 1)}
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    aria-label="Delete"
                    className={`${styles.button} ${styles.buttonGhost}`}
                    type="button"
                    onClick={() => deleteMessage(m.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <textarea
                className={styles.messageTextarea}
                value={m.content}
                onChange={(e) => updateMessage(m.id, { content: e.target.value })}
              />
            </div>
          ))}

          <div className={styles.addMessage}>
            <button className={styles.addMessageButton} type="button" onClick={addMessage}>
              + Add message
            </button>
          </div>
        </main>
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.button} type="button" onClick={handleCancel}>
          Cancel
        </button>
        <button
          className={`${styles.button} ${styles.buttonPrimary}`}
          type="button"
          onClick={handleDone}
        >
          Done
        </button>
      </div>
    </div>
  );
};
