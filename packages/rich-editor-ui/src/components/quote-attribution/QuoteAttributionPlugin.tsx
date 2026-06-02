import { PortalThemeWrapper, usePortalContainer } from '@haklex/rich-style-token';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { ElementNode, LexicalEditor, LexicalNode } from 'lexical';
import { $getNodeByKey, $getRoot } from 'lexical';
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
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
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

function $collectQuotes(): RichQuoteLike[] {
  const out: RichQuoteLike[] = [];
  const visit = (node: LexicalNode) => {
    if ($isRichQuoteLike(node)) {
      out.push(node);
    }
    if ('getChildren' in node && typeof (node as ElementNode).getChildren === 'function') {
      for (const child of (node as ElementNode).getChildren()) visit(child);
    }
  };
  for (const child of $getRoot().getChildren()) visit(child);
  return out;
}

interface QuoteEntry {
  attribution: string;
  dom: HTMLElement;
  key: string;
}

interface Rect {
  height: number;
  left: number;
  top: number;
  width: number;
}

function readRect(dom: HTMLElement): Rect {
  const r = dom.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function rectsEqual(a: Rect | null, b: Rect | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

export function QuoteAttributionPlugin(): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const portalContainer = usePortalContainer();
  const [quotes, setQuotes] = useState<QuoteEntry[]>([]);

  useEffect(() => {
    const collect = () => {
      editor.getEditorState().read(() => {
        const list: QuoteEntry[] = [];
        for (const node of $collectQuotes()) {
          const dom = editor.getElementByKey(node.getKey());
          if (dom) {
            list.push({
              key: node.getKey(),
              attribution: node.getAttribution() ?? '',
              dom,
            });
          }
        }
        setQuotes(list);
      });
    };
    collect();
    return editor.registerUpdateListener(() => collect());
  }, [editor]);

  if (!editor.isEditable()) return null;
  if (quotes.length === 0) return null;

  return createPortal(
    <PortalThemeWrapper>
      {quotes.map((q) => (
        <QuotePanel
          attribution={q.attribution}
          editor={editor}
          key={q.key}
          quoteDom={q.dom}
          quoteKey={q.key}
        />
      ))}
    </PortalThemeWrapper>,
    portalContainer,
  );
}

interface QuotePanelProps {
  attribution: string;
  editor: LexicalEditor;
  quoteDom: HTMLElement;
  quoteKey: string;
}

function QuotePanel({
  attribution,
  editor,
  quoteDom,
  quoteKey,
}: QuotePanelProps): ReactElement | null {
  const [rect, setRect] = useState<Rect | null>(null);
  const [value, setValue] = useState(attribution);
  const [focused, setFocused] = useState(false);

  // Keep local input value in sync with the node's attribution, except while
  // the user is actively editing (so commits-in-progress don't get reverted).
  useEffect(() => {
    if (!focused) setValue(attribution);
  }, [attribution, focused]);

  useLayoutEffect(() => {
    // Mark the quote DOM so its style can reserve room for the floating input
    // (prevents the last line of quote text from overlapping the attribution).
    quoteDom.setAttribute('data-attribution-panel', '');
    let next: Rect | null = null;
    const sync = () => {
      const r = readRect(quoteDom);
      if (!rectsEqual(next, r)) {
        next = r;
        setRect(r);
      }
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(quoteDom);
    window.addEventListener('scroll', sync, true);
    window.addEventListener('resize', sync);
    return () => {
      quoteDom.removeAttribute('data-attribution-panel');
      ro.disconnect();
      window.removeEventListener('scroll', sync, true);
      window.removeEventListener('resize', sync);
    };
  }, [quoteDom]);

  const commit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      editor.update(() => {
        const node = $getNodeByKey(quoteKey);
        if ($isRichQuoteLike(node)) {
          node.setAttribution(trimmed || null);
        }
      });
    },
    [editor, quoteKey],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        commit(value);
        e.currentTarget.blur();
        editor.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setValue(attribution);
        e.currentTarget.blur();
        editor.focus();
      }
    },
    [attribution, commit, editor, value],
  );

  const stop = useCallback((e: SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  if (!rect) return null;

  return (
    <div
      className={styles.overlay}
      style={{
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }}
    >
      <div
        className={`${styles.panel} ${styles.semanticClassNames.panel}`}
        contentEditable={false}
        data-lexical-editor="false"
      >
        <input
          className={`${styles.input} ${styles.semanticClassNames.input}`}
          placeholder="— Author, Work"
          type="text"
          value={value}
          onBeforeInput={stop as (e: FormEvent<HTMLInputElement>) => void}
          onClick={stop as (e: MouseEvent<HTMLInputElement>) => void}
          onCompositionEnd={stop as (e: CompositionEvent<HTMLInputElement>) => void}
          onCompositionStart={stop as (e: CompositionEvent<HTMLInputElement>) => void}
          onCompositionUpdate={stop as (e: CompositionEvent<HTMLInputElement>) => void}
          onCopy={stop as (e: ClipboardEvent<HTMLInputElement>) => void}
          onCut={stop as (e: ClipboardEvent<HTMLInputElement>) => void}
          onDragStart={stop as (e: DragEvent<HTMLInputElement>) => void}
          onDrop={stop as (e: DragEvent<HTMLInputElement>) => void}
          onFocus={() => setFocused(true)}
          onInput={stop as (e: FormEvent<HTMLInputElement>) => void}
          onKeyDown={handleKeyDown}
          onKeyUp={stop as (e: KeyboardEvent<HTMLInputElement>) => void}
          onMouseDown={stop as (e: MouseEvent<HTMLInputElement>) => void}
          onPaste={stop as (e: ClipboardEvent<HTMLInputElement>) => void}
          onPointerDown={stop as (e: PointerEvent<HTMLInputElement>) => void}
          onBlur={(e: FocusEvent<HTMLInputElement>) => {
            setFocused(false);
            commit(e.currentTarget.value);
          }}
          onChange={(e) => {
            e.stopPropagation();
            setValue(e.target.value);
          }}
        />
      </div>
    </div>
  );
}
