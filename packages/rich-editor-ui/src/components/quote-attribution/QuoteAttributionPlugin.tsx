import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { ElementNode, LexicalNode } from 'lexical';
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import type {
  ClipboardEvent,
  CompositionEvent,
  DragEvent,
  FocusEvent,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactElement,
  SyntheticEvent,
} from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import * as styles from './styles.css';

const RICH_QUOTE_TYPE = 'rich-quote';

interface RichQuoteLike extends ElementNode {
  getAttribution: () => string | null;
  setAttribution: (value: string | null) => RichQuoteLike;
}

function $isRichQuoteLike(node: LexicalNode | null | undefined): node is RichQuoteLike {
  if (!node) return false;
  const ctor = node.constructor as { getType?: () => string };
  return typeof ctor.getType === 'function' && ctor.getType() === RICH_QUOTE_TYPE;
}

function $findRichQuoteAncestor(node: LexicalNode | null | undefined): RichQuoteLike | null {
  let current: LexicalNode | null | undefined = node;
  while (current) {
    if ($isRichQuoteLike(current)) return current;
    current = current.getParent();
  }
  return null;
}

interface QuoteEditorState {
  attribution: string;
  quoteDom: HTMLElement | null;
  quoteKey: string;
}

export function QuoteAttributionPlugin(): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelFocusedRef = useRef(false);

  const [visible, setVisible] = useState(false);
  const [quoteState, setQuoteState] = useState<QuoteEditorState>({
    attribution: '',
    quoteKey: '',
    quoteDom: null,
  });
  const [inputValue, setInputValue] = useState('');

  const updateQuote = useCallback(() => {
    if (panelFocusedRef.current) return;

    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      setVisible(false);
      return;
    }

    const anchorNode = selection.anchor.getNode();
    const quoteNode = $findRichQuoteAncestor(anchorNode);
    if (!quoteNode) {
      setVisible(false);
      return;
    }

    const attribution = quoteNode.getAttribution() ?? '';
    const key = quoteNode.getKey();
    const dom = editor.getElementByKey(key);

    setQuoteState({ attribution, quoteKey: key, quoteDom: dom });
    setInputValue(attribution);
    setVisible(true);
  }, [editor]);

  useEffect(() => {
    const unregisterCommand = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateQuote();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    const unregisterUpdate = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateQuote();
      });
    });
    return () => {
      unregisterCommand();
      unregisterUpdate();
    };
  }, [editor, updateQuote]);

  const commitAttribution = useCallback(
    (value: string | null) => {
      editor.update(() => {
        const node = $getNodeByKey(quoteState.quoteKey);
        if ($isRichQuoteLike(node)) {
          node.setAttribution(value);
        }
      });
    },
    [editor, quoteState.quoteKey],
  );

  const handleSave = useCallback(() => {
    const trimmed = inputValue.trim();
    commitAttribution(trimmed || null);
  }, [commitAttribution, inputValue]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
        editor.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setInputValue(quoteState.attribution);
        editor.focus();
      }
      e.stopPropagation();
    },
    [editor, handleSave, quoteState.attribution],
  );

  const stop = useCallback((e: SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  const handlePanelFocusIn = useCallback(() => {
    panelFocusedRef.current = true;
  }, []);

  const handlePanelFocusOut = useCallback(
    (e: FocusEvent<HTMLDivElement>) => {
      const panel = e.currentTarget;
      if (!panel.contains(e.relatedTarget as Node)) {
        panelFocusedRef.current = false;
        handleSave();
      }
    },
    [handleSave],
  );

  if (!editor.isEditable()) return null;
  if (!visible || !quoteState.quoteDom) return null;

  return createPortal(
    <div
      suppressContentEditableWarning
      className={`${styles.editor} ${styles.semanticClassNames.editor}`}
      contentEditable={false}
      data-lexical-editor="false"
      onBlur={handlePanelFocusOut}
      onClick={stop as (e: MouseEvent<HTMLDivElement>) => void}
      onFocus={handlePanelFocusIn}
      onMouseDown={stop as (e: MouseEvent<HTMLDivElement>) => void}
      onPointerDown={stop as (e: PointerEvent<HTMLDivElement>) => void}
    >
      <input
        className={`${styles.input} ${styles.semanticClassNames.input}`}
        placeholder="— Author, Work"
        ref={inputRef}
        type="text"
        value={inputValue}
        onBeforeInput={stop as (e: FormEvent<HTMLInputElement>) => void}
        onClick={stop as (e: MouseEvent<HTMLInputElement>) => void}
        onCompositionEnd={stop as (e: CompositionEvent<HTMLInputElement>) => void}
        onCompositionStart={stop as (e: CompositionEvent<HTMLInputElement>) => void}
        onCompositionUpdate={stop as (e: CompositionEvent<HTMLInputElement>) => void}
        onCopy={stop as (e: ClipboardEvent<HTMLInputElement>) => void}
        onCut={stop as (e: ClipboardEvent<HTMLInputElement>) => void}
        onDragStart={stop as (e: DragEvent<HTMLInputElement>) => void}
        onDrop={stop as (e: DragEvent<HTMLInputElement>) => void}
        onInput={stop as (e: FormEvent<HTMLInputElement>) => void}
        onKeyDown={handleKeyDown}
        onKeyUp={stop as (e: KeyboardEvent<HTMLInputElement>) => void}
        onMouseDown={stop as (e: MouseEvent<HTMLInputElement>) => void}
        onPaste={stop as (e: ClipboardEvent<HTMLInputElement>) => void}
        onPointerDown={stop as (e: PointerEvent<HTMLInputElement>) => void}
        onChange={(e) => {
          e.stopPropagation();
          setInputValue(e.target.value);
        }}
      />
    </div>,
    quoteState.quoteDom,
  );
}
