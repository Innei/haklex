import { $isKaTeXBlockNode, $isKaTeXInlineNode } from '@haklex/rich-editor/nodes';
import { KaTeXRenderer } from '@haklex/rich-editor/renderers';
import {
  ActionButton,
  confirmDiscardChanges,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Field,
  Kbd,
  Popover,
  PopoverBody,
  PopoverFooter,
  PopoverHeader,
  PopoverPanel,
  PopoverTrigger,
  SegmentedControl,
  TextInput,
  toast,
} from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { Copy, Ellipsis, Sigma, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { getEditorHistoryShortcut } from './history-shortcuts';
import { CURSOR_TOKEN, filterKaTeXSnippets, insertSnippetAtSelection } from './snippets';
import * as styles from './styles.css';

interface KaTeXEditDecoratorProps {
  autoOpenOnMount: boolean;
  children: ReactElement;
  displayMode: boolean;
  equation: string;
  nodeKey: string;
}

type KaTeXTab = 'edit' | 'snippets';

const SNIPPET_CATEGORY_ORDER = ['Basic', 'Greek', 'Operators', 'Structures'] as const;

const TAB_ITEMS: { label: string; value: KaTeXTab }[] = [
  { value: 'edit', label: 'Edit' },
  { value: 'snippets', label: 'Snippets' },
];

export function KaTeXEditDecorator({
  nodeKey,
  equation,
  displayMode,
  autoOpenOnMount,
  children,
}: KaTeXEditDecoratorProps) {
  const [editor] = useLexicalComposerContext();
  const editable = editor.isEditable();
  const fieldId = useId();

  const [open, setOpen] = useState(autoOpenOnMount);
  const [value, setValue] = useState(equation);
  const [activeTab, setActiveTab] = useState<KaTeXTab>('edit');
  const [snippetQuery, setSnippetQuery] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number | null; end: number | null }>({
    start: null,
    end: null,
  });

  const dirty = value !== equation;

  const syncSelection = useCallback((target: HTMLTextAreaElement | null) => {
    if (!target) return;
    selectionRef.current = {
      start: target.selectionStart,
      end: target.selectionEnd,
    };
  }, []);

  useEffect(() => {
    if (autoOpenOnMount) {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isKaTeXInlineNode(node) || $isKaTeXBlockNode(node)) {
          node.setShouldAutoOpenOnMount(false);
        }
      });
    }
  }, [autoOpenOnMount, editor, nodeKey]);

  useEffect(() => {
    setValue(equation);
  }, [equation]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      syncSelection(inputRef.current);
    }
  }, [open, syncSelection]);

  const close = useCallback(() => {
    setValue(equation);
    setActiveTab('edit');
    setSnippetQuery('');
    setOpen(false);
  }, [equation]);

  const confirmingRef = useRef(false);
  const requestClose = useCallback(async () => {
    if (!dirty) {
      close();
      return;
    }
    if (confirmingRef.current) return;
    confirmingRef.current = true;
    try {
      if (await confirmDiscardChanges()) close();
    } finally {
      confirmingRef.current = false;
    }
  }, [close, dirty]);

  const commit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (($isKaTeXInlineNode(node) || $isKaTeXBlockNode(node)) && node.getEquation() !== trimmed) {
        node.setEquation(trimmed);
      }
    });
    setActiveTab('edit');
    setSnippetQuery('');
    setOpen(false);
  }, [editor, nodeKey, value]);

  const handleDelete = useCallback(() => {
    editor.update(() => {
      $getNodeByKey(nodeKey)?.remove();
    });
    toast({
      title: displayMode ? 'Math block deleted' : 'Math deleted',
      action: {
        label: 'Undo',
        onClick: () => editor.dispatchCommand(UNDO_COMMAND, undefined),
      },
    });
  }, [displayMode, editor, nodeKey]);

  const handleCopy = useCallback(() => {
    void navigator.clipboard?.writeText(value).then(
      () => toast({ title: 'LaTeX copied', tone: 'success' }),
      () => toast({ title: 'Could not copy LaTeX', tone: 'error' }),
    );
  }, [value]);

  const handleInsertSnippet = useCallback(
    (template: string) => {
      const next = insertSnippetAtSelection(
        value,
        template,
        selectionRef.current.start,
        selectionRef.current.end,
      );

      setValue(next.value);
      setActiveTab('edit');

      requestAnimationFrame(() => {
        const input = inputRef.current;
        if (!input) return;
        input.focus();
        input.setSelectionRange(next.selectionStart, next.selectionEnd);
        selectionRef.current = {
          start: next.selectionStart,
          end: next.selectionEnd,
        };
      });
    },
    [value],
  );

  const filteredSnippets = useMemo(() => filterKaTeXSnippets(snippetQuery), [snippetQuery]);

  const groupedSnippets = useMemo(
    () =>
      SNIPPET_CATEGORY_ORDER.map((category) => ({
        category,
        items: filteredSnippets.filter((snippet) => snippet.category === category),
      })).filter((group) => group.items.length > 0),
    [filteredSnippets],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        void requestClose();
      } else if (displayMode && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        commit();
      } else if (!displayMode && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        commit();
      }
    },
    [requestClose, commit, displayMode],
  );

  const handlePanelKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const shortcut = getEditorHistoryShortcut(e, {
        isDirty: dirty || snippetQuery !== '',
      });
      if (!shortcut) return;

      e.preventDefault();
      e.stopPropagation();
      editor.dispatchCommand(shortcut === 'undo' ? UNDO_COMMAND : REDO_COMMAND, undefined);
    },
    [dirty, editor, snippetQuery],
  );

  if (!editable) {
    return children;
  }

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger render={<ActionButton icon aria-label="More actions" size="md" />}>
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={!value.trim()} onClick={handleCopy}>
          <Copy />
          Copy LaTeX
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen, details) => {
        if (nextOpen) {
          setOpen(true);
          return;
        }
        const outside = details?.reason === 'outside-press' || details?.reason === 'focus-out';
        if (outside && dirty) return;
        if (details?.reason === 'escape-key') void requestClose();
        else close();
      }}
    >
      <PopoverTrigger
        nativeButton={false}
        render={
          <span
            className={`${styles.editWrapper} ${styles.semanticClassNames.editWrapper}`}
            title="Click to edit"
          />
        }
      >
        {children}
      </PopoverTrigger>
      <PopoverPanel
        flush
        className={`${styles.panel} ${styles.semanticClassNames.panel}`}
        initialFocus={inputRef}
        side="bottom"
        size="lg"
        onKeyDown={handlePanelKeyDown}
      >
        <PopoverHeader
          className={styles.semanticClassNames.header}
          icon={<Sigma />}
          title={displayMode ? 'Math block' : 'Inline math'}
          actions={
            <>
              <SegmentedControl
                className={`${styles.tabs} ${styles.semanticClassNames.tabs}`}
                items={TAB_ITEMS}
                value={activeTab}
                onChange={setActiveTab}
              />
              {menu}
            </>
          }
        />

        <div className={`${styles.bodyScrollArea} ${styles.semanticClassNames.bodyScrollArea}`}>
          {activeTab === 'edit' && (
            <PopoverBody className={styles.semanticClassNames.body}>
              <Field id={fieldId} label="LaTeX">
                <textarea
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  className={`${styles.textarea} ${styles.semanticClassNames.textarea}`}
                  id={fieldId}
                  placeholder="e.g. \frac{-b \pm \sqrt{b^2-4ac}}{2a}"
                  ref={inputRef}
                  rows={displayMode ? 4 : 2}
                  spellCheck={false}
                  value={value}
                  onClick={(e) => syncSelection(e.currentTarget)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={(e) => syncSelection(e.currentTarget)}
                  onSelect={(e) => syncSelection(e.currentTarget)}
                  onChange={(e) => {
                    setValue(e.target.value);
                    syncSelection(e.target);
                  }}
                />
              </Field>
              <div
                aria-label="Preview"
                className={`${styles.preview} ${styles.semanticClassNames.preview}`}
                role="img"
              >
                {value.trim() ? (
                  <KaTeXRenderer displayMode={displayMode} equation={value} />
                ) : (
                  <span
                    className={`${styles.previewEmpty} ${styles.semanticClassNames.previewEmpty}`}
                  >
                    Preview appears as you type
                  </span>
                )}
              </div>
            </PopoverBody>
          )}

          {activeTab === 'snippets' && (
            <PopoverBody className={styles.semanticClassNames.body}>
              <TextInput
                aria-label="Search snippets"
                autoComplete="off"
                placeholder="Search snippets: frac, matrix, sum…"
                value={snippetQuery}
                onChange={(e) => setSnippetQuery(e.target.value)}
              />

              {groupedSnippets.length > 0 ? (
                <div
                  className={`${styles.snippetGroups} ${styles.semanticClassNames.snippetGroups}`}
                >
                  {groupedSnippets.map((group) => (
                    <section
                      className={`${styles.snippetGroup} ${styles.semanticClassNames.snippetGroup}`}
                      key={group.category}
                    >
                      <div
                        className={`${styles.snippetGroupLabel} ${styles.semanticClassNames.snippetGroupLabel}`}
                      >
                        {group.category}
                      </div>
                      <div
                        className={`${styles.snippetList} ${styles.semanticClassNames.snippetList}`}
                      >
                        {group.items.map((snippet) => (
                          <button
                            className={`${styles.snippetButton} ${styles.semanticClassNames.snippetButton}`}
                            key={snippet.id}
                            type="button"
                            onClick={() => handleInsertSnippet(snippet.template)}
                          >
                            <span
                              className={`${styles.snippetMeta} ${styles.semanticClassNames.snippetMeta}`}
                            >
                              <span
                                className={`${styles.snippetName} ${styles.semanticClassNames.snippetName}`}
                              >
                                {snippet.title}
                              </span>
                              <span
                                className={`${styles.snippetHint} ${styles.semanticClassNames.snippetHint}`}
                              >
                                {snippet.template.replace(CURSOR_TOKEN, '')}
                              </span>
                            </span>
                            <span
                              className={`${styles.snippetPreview} ${styles.semanticClassNames.snippetPreview}`}
                            >
                              <KaTeXRenderer
                                displayMode={false}
                                equation={snippet.previewEquation}
                              />
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div
                  className={`${styles.snippetsPlaceholder} ${styles.semanticClassNames.snippetsPlaceholder}`}
                >
                  No snippets match &ldquo;{snippetQuery.trim()}&rdquo;
                </div>
              )}
            </PopoverBody>
          )}
        </div>

        <PopoverFooter
          className={styles.semanticClassNames.footer}
          hint={
            <span className={styles.semanticClassNames.charCount}>
              {`${value.length} ${value.length === 1 ? 'character' : 'characters'}`}
            </span>
          }
        >
          <ActionButton size="md" variant="outline" onClick={close}>
            Cancel
          </ActionButton>
          <ActionButton disabled={!value.trim()} size="md" variant="solid" onClick={commit}>
            Save
            <Kbd keys={displayMode ? ['mod', 'enter'] : ['enter']} size="sm" tone="inverted" />
          </ActionButton>
        </PopoverFooter>
      </PopoverPanel>
    </Popover>
  );
}
