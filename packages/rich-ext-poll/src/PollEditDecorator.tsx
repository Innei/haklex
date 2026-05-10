import {
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { CalendarClock, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { customAlphabet } from 'nanoid';
import type { CompositionEvent, InputHTMLAttributes, KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { $isPollNode, type PollNode } from './nodes/PollNode';
import { pollEditClasses } from './poll-edit.css';
import type { PollMode, PollOption, PollShowResults } from './types';

const optionIdAlphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
const makeOptionId = customAlphabet(optionIdAlphabet, 6);

const pollModeItems: Array<{ label: string; value: PollMode }> = [
  { label: 'Single', value: 'single' },
  { label: 'Multiple', value: 'multiple' },
];

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

type ImeSafeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'defaultValue'
> & {
  value: string;
  onValueChange: (next: string) => void;
};

function ImeSafeInput({ value, onValueChange, onCompositionEnd, ...rest }: ImeSafeInputProps) {
  const [local, setLocal] = useState(value);
  const composingRef = useRef(false);
  const lastCommittedRef = useRef(value);

  useEffect(() => {
    if (composingRef.current) return;
    if (value !== lastCommittedRef.current) {
      lastCommittedRef.current = value;
      setLocal(value);
    }
  }, [value]);

  const commit = useCallback(
    (next: string) => {
      lastCommittedRef.current = next;
      if (next !== value) onValueChange(next);
    },
    [onValueChange, value],
  );

  return (
    <input
      {...rest}
      value={local}
      onChange={(event) => {
        const next = event.target.value;
        setLocal(next);
        if (!composingRef.current) commit(next);
      }}
      onCompositionEnd={(event: CompositionEvent<HTMLInputElement>) => {
        composingRef.current = false;
        const next = event.currentTarget.value;
        setLocal(next);
        commit(next);
        onCompositionEnd?.(event);
      }}
      onCompositionStart={() => {
        composingRef.current = true;
      }}
    />
  );
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

  const handleShowResultsSelectChange = useCallback(
    (value: unknown) => {
      if (typeof value === 'string') handleShowResultsChange(value);
    },
    [handleShowResultsChange],
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
      <ImeSafeInput
        aria-label="Poll question"
        className={pollEditClasses.question}
        disabled={!editable}
        placeholder="Question"
        value={question}
        onValueChange={handleQuestionChange}
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
                  <ChevronUp aria-hidden size={14} />
                </button>
                <button
                  aria-label="Move option down"
                  className={pollEditClasses.reorderButton}
                  disabled={index === options.length - 1}
                  type="button"
                  onClick={() => handleOptionMove(index, 1)}
                >
                  <ChevronDown aria-hidden size={14} />
                </button>
              </span>
            )}
            <ImeSafeInput
              aria-label="Option label"
              className={pollEditClasses.optionInput}
              disabled={!editable}
              placeholder="Option"
              value={option.label}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
              onValueChange={(next) => handleOptionLabelChange(option.id, next)}
            />
            {editable && options.length > 2 && (
              <button
                aria-label="Remove option"
                className={pollEditClasses.removeButton}
                type="button"
                onClick={() => handleOptionRemove(option.id)}
              >
                <X aria-hidden size={16} />
              </button>
            )}
          </li>
        ))}
      </ul>
      {editable && (
        <button className={pollEditClasses.addOption} type="button" onClick={handleOptionAdd}>
          <Plus aria-hidden size={16} />
          <span>Add option</span>
        </button>
      )}
      {editable && (
        <div className={pollEditClasses.modeRow}>
          <span className={pollEditClasses.advancedLabel}>Mode</span>
          <SegmentedControl
            className={pollEditClasses.modeControl}
            items={pollModeItems}
            value={mode}
            onChange={handleModeChange}
          />
        </div>
      )}
      {editable && (
        <details>
          <summary className={pollEditClasses.advancedSummary}>Advanced</summary>
          <div className={pollEditClasses.advancedGrid}>
            <span className={pollEditClasses.advancedLabel}>Close at</span>
            <div className={pollEditClasses.dateTimeField}>
              <CalendarClock aria-hidden className={pollEditClasses.dateTimeIcon} size={16} />
              <input
                aria-label="Closing time"
                className={pollEditClasses.dateTimeInput}
                type="datetime-local"
                value={closeAt ?? ''}
                onChange={(event) => handleCloseAtChange(event.target.value)}
              />
            </div>
            <span className={pollEditClasses.advancedLabel}>Show results</span>
            <Select value={showResults ?? 'always'} onValueChange={handleShowResultsSelectChange}>
              <SelectTrigger
                aria-label="Show results policy"
                className={pollEditClasses.selectTrigger}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={pollEditClasses.selectContent} sideOffset={6}>
                <SelectItem value="always">Always</SelectItem>
                <SelectItem value="after-vote">After vote</SelectItem>
                <SelectItem value="after-close">After close</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </details>
      )}
    </div>
  );
}
