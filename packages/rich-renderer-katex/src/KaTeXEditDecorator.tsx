import { $isKaTeXBlockNode, $isKaTeXInlineNode } from '@haklex/rich-editor/nodes';
import { KaTeXRenderer } from '@haklex/rich-editor/renderers';
import {
  ActionBar,
  ActionButton,
  AnimatedTabs,
  Popover,
  PopoverPanel,
  PopoverTrigger,
} from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { Check, Copy, RotateCcw, Search, Terminal, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CURSOR_TOKEN, filterKaTeXSnippets, insertSnippetAtSelection } from './snippets';
import * as styles from './styles.css';

interface KaTeXEditDecoratorProps {
  children: ReactElement;
  displayMode: boolean;
  equation: string;
  nodeKey: string;
}

const SNIPPET_CATEGORY_ORDER = ['Basic', 'Greek', 'Operators', 'Structures'] as const;

export function KaTeXEditDecorator({
  nodeKey,
  equation,
  displayMode,
  children,
}: KaTeXEditDecoratorProps) {
  const [editor] = useLexicalComposerContext();
  const editable = editor.isEditable();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(equation);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'snippets'>('editor');
  const [snippetQuery, setSnippetQuery] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number | null; end: number | null }>({
    start: null,
    end: null,
  });

  const syncSelection = useCallback((target: HTMLTextAreaElement | null) => {
    if (!target) return;
    selectionRef.current = {
      start: target.selectionStart,
      end: target.selectionEnd,
    };
  }, []);

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

  const commit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isKaTeXInlineNode(node) && node.getEquation() !== trimmed) {
        node.setEquation(trimmed);
      } else if ($isKaTeXBlockNode(node) && node.getEquation() !== trimmed) {
        node.setEquation(trimmed);
      }
    });
    setOpen(false);
  }, [editor, nodeKey, value]);

  const cancel = useCallback(() => {
    setValue(equation);
    setOpen(false);
  }, [equation]);

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) node.remove();
    });
  }, [editor, nodeKey]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(setCopied, 2000, false);
  }, [value]);

  const handleReset = useCallback(() => {
    setValue(equation);
    inputRef.current?.focus();
  }, [equation]);

  const handleInsertSnippet = useCallback(
    (template: string) => {
      const next = insertSnippetAtSelection(
        value,
        template,
        selectionRef.current.start,
        selectionRef.current.end,
      );

      setValue(next.value);
      setActiveTab('editor');

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
        cancel();
      } else if (displayMode && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        commit();
      } else if (!displayMode && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        commit();
      }
    },
    [commit, cancel, displayMode],
  );

  if (!editable) {
    return children;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        className={`${styles.panel} ${styles.semanticClassNames.panel}`}
        side="bottom"
        sideOffset={8}
      >
        {/* Header */}
        <div className={`${styles.header} ${styles.semanticClassNames.header}`}>
          <div className={`${styles.headerLeft} ${styles.semanticClassNames.headerLeft}`}>
            <div className={`${styles.iconWrap} ${styles.semanticClassNames.iconWrap}`}>
              <Terminal size={12} />
            </div>
            <span className={`${styles.title} ${styles.semanticClassNames.title}`}>
              Math Editor
            </span>
          </div>
          <div className={`${styles.headerRight} ${styles.semanticClassNames.headerRight}`}>
            <span className={`${styles.mode} ${styles.semanticClassNames.mode}`}>
              {displayMode ? 'Block' : 'Inline'}
            </span>
            <button
              className={`${styles.deleteButton} ${styles.semanticClassNames.deleteButton}`}
              title="Delete node"
              type="button"
              onClick={handleDelete}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <AnimatedTabs
          className={`${styles.tabs} ${styles.semanticClassNames.tabs}`}
          value={activeTab}
          tabs={[
            { id: 'editor', label: 'Editor' },
            { id: 'snippets', label: 'Snippets' },
          ]}
          onChange={(id) => setActiveTab(id as 'editor' | 'snippets')}
        />

        {/* Body (scrollarea for stable popover height) */}
        <div className={`${styles.bodyScrollArea} ${styles.semanticClassNames.bodyScrollArea}`}>
          {/* Editor Tab */}
          {activeTab === 'editor' && (
            <div className={`${styles.body} ${styles.semanticClassNames.body}`}>
              <div className={`${styles.field} ${styles.semanticClassNames.field}`}>
                <label className={`${styles.label} ${styles.semanticClassNames.label}`}>
                  LaTeX Input
                </label>
                <div className={`${styles.inputWrap} ${styles.semanticClassNames.inputWrap}`}>
                  <textarea
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    className={`${styles.textarea} ${styles.semanticClassNames.textarea}`}
                    placeholder="e.g. \frac{-b \pm \sqrt{b^2-4ac}}{2a}"
                    ref={inputRef}
                    rows={displayMode ? 4 : 3}
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
                  <div
                    className={`${styles.inputActions} ${styles.semanticClassNames.inputActions}`}
                  >
                    <ActionButton
                      icon
                      disabled={!value.trim()}
                      size="sm"
                      title="Copy LaTeX"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check size={12} style={{ color: '#22c55e' }} />
                      ) : (
                        <Copy size={12} />
                      )}
                    </ActionButton>
                    <ActionButton
                      icon
                      disabled={value === equation}
                      size="sm"
                      title="Reset"
                      onClick={handleReset}
                    >
                      <RotateCcw size={12} />
                    </ActionButton>
                  </div>
                </div>
              </div>

              <div className={`${styles.field} ${styles.semanticClassNames.field}`}>
                <label className={`${styles.label} ${styles.semanticClassNames.label}`}>
                  Preview
                </label>
                <div className={`${styles.preview} ${styles.semanticClassNames.preview}`}>
                  {value.trim() ? (
                    <KaTeXRenderer displayMode={displayMode} equation={value} />
                  ) : (
                    <span
                      className={`${styles.previewEmpty} ${styles.semanticClassNames.previewEmpty}`}
                    >
                      Enter a formula
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Snippets Tab */}
          {activeTab === 'snippets' && (
            <div className={`${styles.body} ${styles.semanticClassNames.body}`}>
              <div
                className={`${styles.snippetSearchWrap} ${styles.semanticClassNames.snippetSearchWrap}`}
              >
                <Search
                  className={`${styles.snippetSearchIcon} ${styles.semanticClassNames.snippetSearchIcon}`}
                  size={14}
                />
                <input
                  autoComplete="off"
                  className={`${styles.snippetSearchInput} ${styles.semanticClassNames.snippetSearchInput}`}
                  placeholder="Search snippets: frac, matrix, sum..."
                  type="text"
                  value={snippetQuery}
                  onChange={(e) => setSnippetQuery(e.target.value)}
                />
              </div>

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
                            <div
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
                            </div>
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`${styles.footer} ${styles.semanticClassNames.footer}`}>
          <span className={`${styles.charCount} ${styles.semanticClassNames.charCount}`}>
            {value.trim() ? `${value.length} chars` : 'Enter a formula'}
          </span>
          <ActionBar>
            <ActionButton size="md" variant="ghost" onClick={cancel}>
              Cancel
            </ActionButton>
            <ActionButton disabled={!value.trim()} size="md" variant="accent" onClick={commit}>
              Save
            </ActionButton>
          </ActionBar>
        </div>
      </PopoverPanel>
    </Popover>
  );
}
