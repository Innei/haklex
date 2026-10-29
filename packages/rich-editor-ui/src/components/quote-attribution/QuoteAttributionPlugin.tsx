import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { ElementNode, LexicalEditor, LexicalNode } from 'lexical';
import { $getNodeByKey, $getRoot, $getSelection, $isRangeSelection } from 'lexical';
import type { KeyboardEvent, ReactElement, SyntheticEvent } from 'react';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import * as styles from './styles.css';

const RICH_QUOTE_TYPE = 'rich-quote';
const SLOT_ATTR = 'data-quote-attribution-slot';

interface RichQuoteLike extends ElementNode {
  getAttribution: () => string | null;
  setAttribution: (value: string | null) => RichQuoteLike;
}

function $isRichQuoteLike(node: LexicalNode | null | undefined): node is RichQuoteLike {
  if (!node) return false;
  const ctor = node.constructor as { getType?: () => string };
  return typeof ctor.getType === 'function' && ctor.getType() === RICH_QUOTE_TYPE;
}

function $collectQuotes(): RichQuoteLike[] {
  const out: RichQuoteLike[] = [];
  const visit = (node: LexicalNode) => {
    if ($isRichQuoteLike(node)) out.push(node);
    if ('getChildren' in node && typeof (node as ElementNode).getChildren === 'function') {
      for (const child of (node as ElementNode).getChildren()) visit(child);
    }
  };
  for (const child of $getRoot().getChildren()) visit(child);
  return out;
}

function $activeQuoteKey(): string | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;
  let node: LexicalNode | null = selection.anchor.getNode();
  while (node) {
    if ($isRichQuoteLike(node)) return node.getKey();
    node = node.getParent();
  }
  return null;
}

function findSlot(quote: HTMLElement | null): HTMLElement | null {
  if (!quote) return null;
  for (const child of quote.children) {
    if (child.hasAttribute(SLOT_ATTR)) return child as HTMLElement;
  }
  return null;
}

interface QuoteEntry {
  attribution: string;
  key: string;
  slot: HTMLElement;
}

export function QuoteAttributionPlugin(): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const [quotes, setQuotes] = useState<QuoteEntry[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [editable, setEditable] = useState(() => editor.isEditable());

  useEffect(() => editor.registerEditableListener(setEditable), [editor]);

  useEffect(() => {
    const collect = () => {
      editor.getEditorState().read(() => {
        const list: QuoteEntry[] = [];
        for (const node of $collectQuotes()) {
          const slot = findSlot(editor.getElementByKey(node.getKey()));
          if (slot)
            list.push({ key: node.getKey(), attribution: node.getAttribution() ?? '', slot });
        }
        setQuotes(list);
        setActiveKey($activeQuoteKey());
      });
    };
    const removeRoot = editor.registerRootListener(() => queueMicrotask(collect));
    const removeUpdate = editor.registerUpdateListener(collect);
    return () => {
      removeRoot();
      removeUpdate();
    };
  }, [editor]);

  return (
    <>
      {quotes.map((quote) =>
        createPortal(
          <QuoteAttribution
            active={quote.key === activeKey}
            attribution={quote.attribution}
            editable={editable}
            editor={editor}
            quoteKey={quote.key}
            slot={quote.slot}
          />,
          quote.slot,
          quote.key,
        ),
      )}
    </>
  );
}

interface QuoteAttributionProps {
  active: boolean;
  attribution: string;
  editable: boolean;
  editor: LexicalEditor;
  quoteKey: string;
  slot: HTMLElement;
}

const stop = (event: SyntheticEvent) => event.stopPropagation();

function QuoteAttribution({
  active,
  attribution,
  editable,
  editor,
  quoteKey,
  slot,
}: QuoteAttributionProps): ReactElement | null {
  const [value, setValue] = useState(attribution);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setValue(attribution);
  }, [attribution, focused]);

  useLayoutEffect(() => {
    slot.classList.add(styles.slot);
    slot.toggleAttribute('data-empty', !attribution);
    slot.toggleAttribute('data-active', active || focused);
  }, [active, attribution, focused, slot]);

  useLayoutEffect(
    () => () => {
      slot.classList.remove(styles.slot);
      slot.removeAttribute('data-empty');
      slot.removeAttribute('data-active');
    },
    [slot],
  );

  const commit = useCallback(
    (raw: string) => {
      const next = raw.trim() || null;
      if (next === (attribution || null)) return;
      editor.update(() => {
        const node = $getNodeByKey(quoteKey);
        if ($isRichQuoteLike(node)) node.setAttribution(next);
      });
    },
    [attribution, editor, quoteKey],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      event.stopPropagation();
      if (event.key === 'Enter') {
        event.preventDefault();
        commit(value);
        event.currentTarget.blur();
        editor.focus();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setValue(attribution);
        event.currentTarget.blur();
        editor.focus();
      }
    },
    [attribution, commit, editor, value],
  );

  if (!editable) {
    return attribution ? <span className={styles.text}>— {attribution}</span> : null;
  }

  return (
    <label className={styles.field}>
      <span aria-hidden className={styles.dash}>
        —
      </span>
      <input
        aria-label="Quote attribution"
        className={styles.input}
        placeholder="Author, Work"
        type="text"
        value={value}
        onBeforeInput={stop}
        onChange={(event) => setValue(event.target.value)}
        onClick={stop}
        onCompositionEnd={stop}
        onCompositionStart={stop}
        onCompositionUpdate={stop}
        onCopy={stop}
        onCut={stop}
        onDragStart={stop}
        onDrop={stop}
        onFocus={() => setFocused(true)}
        onInput={stop}
        onKeyDown={handleKeyDown}
        onKeyUp={stop}
        onMouseDown={stop}
        onPaste={stop}
        onPointerDown={stop}
        onBlur={(event) => {
          setFocused(false);
          commit(event.currentTarget.value);
        }}
      />
    </label>
  );
}
