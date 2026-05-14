import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { ElementNode, LexicalNode } from 'lexical';
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { Quote, Trash2 } from 'lucide-react';
import type { KeyboardEvent, ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ActionBar, ActionButton } from '../action-button';
import { Popover, PopoverPopup, PopoverPortal, PopoverPositioner } from '../popover';
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

  const handleClear = useCallback(() => {
    setInputValue('');
    commitAttribution(null);
  }, [commitAttribution]);

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
    },
    [editor, handleSave, quoteState.attribution],
  );

  const handlePanelFocusIn = useCallback(() => {
    panelFocusedRef.current = true;
  }, []);

  const handlePanelFocusOut = useCallback(
    (e: React.FocusEvent) => {
      const panel = e.currentTarget;
      if (!panel.contains(e.relatedTarget as Node)) {
        panelFocusedRef.current = false;
        handleSave();
      }
    },
    [handleSave],
  );

  if (!editor.isEditable()) return null;

  return (
    <Popover open={visible}>
      <PopoverPortal>
        <PopoverPositioner align="center" anchor={quoteState.quoteDom} side="bottom" sideOffset={8}>
          <PopoverPopup
            className={`${styles.panel} ${styles.semanticClassNames.panel}`}
            onBlur={handlePanelFocusOut}
            onFocus={handlePanelFocusIn}
          >
            <div className={`${styles.row} ${styles.semanticClassNames.row}`}>
              <Quote size={14} />
              <input
                className={`${styles.input} ${styles.semanticClassNames.input}`}
                placeholder="Attribution (e.g. — Author, Work)"
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <ActionBar>
              <ActionButton onClick={handleSave}>Save</ActionButton>
              <ActionButton danger onClick={handleClear}>
                <Trash2 size={14} />
                Clear
              </ActionButton>
            </ActionBar>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
}
