import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { customAlphabet } from 'nanoid';
import type { KeyboardEvent } from 'react';
import { useCallback } from 'react';

import { $isPollNode, type PollNode } from '../../nodes/PollNode';
import { pollEditClasses } from '../../styles/poll-edit.css';
import type { PollMode, PollOption, PollShowResults } from '../../types/poll';

const optionIdAlphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
const makeOptionId = customAlphabet(optionIdAlphabet, 6);

interface PollEditDecoratorProps {
  closeAt?: string;
  mode: PollMode;
  nodeKey: string;
  options: PollOption[];
  pollId: string;
  question: string;
  showResults?: PollShowResults;
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function PollEditDecorator({
  closeAt,
  mode,
  nodeKey,
  options,
  pollId,
  question,
  showResults,
}: PollEditDecoratorProps) {
  const [editor] = useLexicalComposerContext();
  const editable = editor.isEditable();

  const updatePoll = useCallback(
    (mutate: (node: PollNode) => void) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isPollNode(node)) mutate(node);
      });
    },
    [editor, nodeKey],
  );

  const handleQuestionChange = useCallback(
    (value: string) => {
      updatePoll((node) => node.setQuestion(value));
    },
    [updatePoll],
  );

  const handleOptionLabelChange = useCallback(
    (id: string, label: string) => {
      updatePoll((node) =>
        node.setOptions(node.getOptions().map((o) => (o.id === id ? { ...o, label } : o))),
      );
    },
    [updatePoll],
  );

  const handleOptionRemove = useCallback(
    (id: string) => {
      updatePoll((node) => node.setOptions(node.getOptions().filter((o) => o.id !== id)));
    },
    [updatePoll],
  );

  const handleOptionAdd = useCallback(() => {
    updatePoll((node) =>
      node.setOptions([...node.getOptions(), { id: `o_${makeOptionId()}`, label: '' }]),
    );
  }, [updatePoll]);

  const handleOptionMove = useCallback(
    (index: number, direction: -1 | 1) => {
      updatePoll((node) => {
        const current = node.getOptions();
        const next = moveItem(current, index, index + direction);
        if (next !== current) node.setOptions(next);
      });
    },
    [updatePoll],
  );

  const handleModeChange = useCallback(
    (next: PollMode) => {
      updatePoll((node) => node.setMode(next));
    },
    [updatePoll],
  );

  const handleCloseAtChange = useCallback(
    (value: string) => {
      updatePoll((node) => node.setCloseAt(value || undefined));
    },
    [updatePoll],
  );

  const handleShowResultsChange = useCallback(
    (value: string) => {
      updatePoll((node) => {
        if (value === 'always' || value === 'after-vote' || value === 'after-close') {
          node.setShowResults(value);
        } else {
          node.setShowResults(undefined);
        }
      });
    },
    [updatePoll],
  );

  const handleOptionKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>, index: number) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (index === options.length - 1) handleOptionAdd();
      }
    },
    [handleOptionAdd, options.length],
  );

  return (
    <div className={pollEditClasses.container} data-poll-id={pollId}>
      <div className={pollEditClasses.meta}>
        Poll · {mode === 'single' ? 'Single choice' : 'Multiple choice'}
      </div>
      <input
        aria-label="Poll question"
        className={pollEditClasses.question}
        disabled={!editable}
        placeholder="Question"
        value={question}
        onChange={(event) => handleQuestionChange(event.target.value)}
      />
      <ul className={pollEditClasses.optionList}>
        {options.map((option, index) => (
          <li className={pollEditClasses.optionRow} key={option.id}>
            {editable && options.length > 1 && (
              <span className={pollEditClasses.reorderColumn}>
                <button
                  aria-label="Move option up"
                  className={pollEditClasses.reorderButton}
                  disabled={index === 0}
                  type="button"
                  onClick={() => handleOptionMove(index, -1)}
                >
                  ▲
                </button>
                <button
                  aria-label="Move option down"
                  className={pollEditClasses.reorderButton}
                  disabled={index === options.length - 1}
                  type="button"
                  onClick={() => handleOptionMove(index, 1)}
                >
                  ▼
                </button>
              </span>
            )}
            <input
              aria-label="Option label"
              className={pollEditClasses.optionInput}
              disabled={!editable}
              placeholder="Option"
              value={option.label}
              onChange={(event) => handleOptionLabelChange(option.id, event.target.value)}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
            />
            {editable && options.length > 2 && (
              <button
                aria-label="Remove option"
                className={pollEditClasses.removeButton}
                type="button"
                onClick={() => handleOptionRemove(option.id)}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
      {editable && (
        <button className={pollEditClasses.addOption} type="button" onClick={handleOptionAdd}>
          + Add option
        </button>
      )}
      {editable && (
        <div className={pollEditClasses.modeRow}>
          <label className={pollEditClasses.modeLabel}>
            <input
              checked={mode === 'single'}
              name={`poll-mode-${nodeKey}`}
              type="radio"
              onChange={() => handleModeChange('single')}
            />
            Single
          </label>
          <label className={pollEditClasses.modeLabel}>
            <input
              checked={mode === 'multiple'}
              name={`poll-mode-${nodeKey}`}
              type="radio"
              onChange={() => handleModeChange('multiple')}
            />
            Multiple
          </label>
        </div>
      )}
      {editable && (
        <details>
          <summary className={pollEditClasses.advancedSummary}>Advanced</summary>
          <div className={pollEditClasses.advancedGrid}>
            <span className={pollEditClasses.advancedLabel}>Close at</span>
            <input
              aria-label="Closing time"
              className={pollEditClasses.advancedInput}
              type="datetime-local"
              value={closeAt ?? ''}
              onChange={(event) => handleCloseAtChange(event.target.value)}
            />
            <span className={pollEditClasses.advancedLabel}>Show results</span>
            <select
              aria-label="Show results policy"
              className={pollEditClasses.advancedInput}
              value={showResults ?? 'always'}
              onChange={(event) => handleShowResultsChange(event.target.value)}
            >
              <option value="always">Always</option>
              <option value="after-vote">After vote</option>
              <option value="after-close">After close</option>
            </select>
          </div>
        </details>
      )}
    </div>
  );
}
