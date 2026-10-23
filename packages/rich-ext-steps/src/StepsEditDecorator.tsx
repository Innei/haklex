import { NestedEditorCorePlugins } from '@haklex/rich-editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import type { LexicalEditor } from 'lexical';
import { $getNodeByKey } from 'lexical';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { CompositionEvent, KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { $isStepsEditNode, type StepsEditNode } from './nodes/StepsEditNode';
import * as styles from './styles.css';
import * as editStyles from './styles-edit.css';
import type { StepItem } from './types';

interface StepsEditDecoratorProps {
  nodeKey: string;
  stepEditors: LexicalEditor[];
  steps: StepItem[];
}

function TitleInput({
  value,
  autoFocus,
  onValueChange,
  onEnter,
}: {
  autoFocus: boolean;
  onEnter: () => void;
  onValueChange: (next: string) => void;
  value: string;
}) {
  const [local, setLocal] = useState(value);
  const composingRef = useRef(false);

  useEffect(() => {
    if (!composingRef.current) setLocal(value);
  }, [value]);

  return (
    <input
      aria-label="Step title"
      autoFocus={autoFocus}
      className={`${editStyles.titleInput} ${editStyles.editClassNames.titleInput}`}
      placeholder="Step title"
      value={local}
      onChange={(event) => {
        setLocal(event.target.value);
        if (!composingRef.current) onValueChange(event.target.value);
      }}
      onCompositionEnd={(event: CompositionEvent<HTMLInputElement>) => {
        composingRef.current = false;
        onValueChange(event.currentTarget.value);
      }}
      onCompositionStart={() => {
        composingRef.current = true;
      }}
      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !composingRef.current) {
          event.preventDefault();
          onEnter();
        }
      }}
    />
  );
}

export function StepsEditDecorator({ nodeKey, steps, stepEditors }: StepsEditDecoratorProps) {
  const [editor] = useLexicalComposerContext();
  const [focusId, setFocusId] = useState<string | null>(null);

  const mutate = useCallback(
    (fn: (node: StepsEditNode) => void) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isStepsEditNode(node)) fn(node);
      });
    },
    [editor, nodeKey],
  );

  const handleAdd = useCallback(
    (id: string) => {
      let added: string | null = null;
      editor.update(
        () => {
          const node = $getNodeByKey(nodeKey);
          if ($isStepsEditNode(node)) added = node.addStepAfter(id).id;
        },
        { discrete: true },
      );
      setFocusId(added);
    },
    [editor, nodeKey],
  );

  return (
    <ol className={`${styles.root} ${styles.semanticClassNames.root}`}>
      {steps.map((step, index) => {
        const stepEditor = stepEditors[index];
        return (
          <li className={`${styles.item} ${styles.semanticClassNames.item}`} key={step.id}>
            <span
              aria-hidden="true"
              className={`${styles.marker} ${styles.semanticClassNames.marker}`}
            >
              {index + 1}
            </span>
            <div className={`${editStyles.titleRow} ${editStyles.editClassNames.titleRow}`}>
              <TitleInput
                autoFocus={focusId === step.id}
                value={step.title}
                onEnter={() => stepEditor?.focus()}
                onValueChange={(title) => mutate((node) => node.setStepTitle(step.id, title))}
              />
              <div
                className={`${editStyles.actions} ${editStyles.editClassNames.actions}`}
                onMouseDown={(event) => event.preventDefault()}
              >
                <button
                  aria-label="Move step up"
                  className={editStyles.action}
                  disabled={index === 0}
                  type="button"
                  onClick={() => mutate((node) => node.moveStep(step.id, -1))}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  aria-label="Move step down"
                  className={editStyles.action}
                  disabled={index === steps.length - 1}
                  type="button"
                  onClick={() => mutate((node) => node.moveStep(step.id, 1))}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  aria-label="Add step below"
                  className={editStyles.action}
                  type="button"
                  onClick={() => handleAdd(step.id)}
                >
                  <Plus size={14} />
                </button>
                <button
                  aria-label="Delete step"
                  className={editStyles.action}
                  type="button"
                  onClick={() => mutate((node) => node.removeStep(step.id))}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {stepEditor && (
              <div className={`${styles.content} ${styles.semanticClassNames.content}`}>
                <LexicalNestedComposer initialEditor={stepEditor}>
                  <RichTextPlugin
                    ErrorBoundary={LexicalErrorBoundary}
                    contentEditable={
                      <ContentEditable
                        aria-placeholder=""
                        className={`${editStyles.editable} ${editStyles.editClassNames.editable}`}
                        placeholder={<span style={{ display: 'none' }} />}
                      />
                    }
                  />
                  <NestedEditorCorePlugins />
                </LexicalNestedComposer>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
