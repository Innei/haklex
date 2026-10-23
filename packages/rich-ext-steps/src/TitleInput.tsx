import { stopLexicalPropagation } from 'lexical';
import type { CompositionEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import * as editStyles from './styles-edit.css';

// The input lives inside the outer editor's contentEditable, whose native listeners
// would otherwise act on these events against the outer selection.
const OUTER_EDITOR_EVENTS = [
  'keydown',
  'keyup',
  'beforeinput',
  'input',
  'compositionstart',
  'compositionend',
  'paste',
  'cut',
  'copy',
] as const;

export function TitleInput({
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    for (const type of OUTER_EDITOR_EVENTS) input.addEventListener(type, stopLexicalPropagation);
    return () => {
      for (const type of OUTER_EDITOR_EVENTS) {
        input.removeEventListener(type, stopLexicalPropagation);
      }
    };
  }, []);

  useEffect(() => {
    if (!composingRef.current) setLocal(value);
  }, [value]);

  return (
    <input
      aria-label="Step title"
      autoFocus={autoFocus}
      className={`${editStyles.titleInput} ${editStyles.editClassNames.titleInput}`}
      placeholder="Step title"
      ref={inputRef}
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
        const composing =
          composingRef.current || event.nativeEvent.isComposing || event.keyCode === 229;
        if (event.key === 'Enter' && !composing) {
          event.preventDefault();
          onEnter();
        }
      }}
    />
  );
}
