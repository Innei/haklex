import { $createRubyNode, $isRubyNode } from '@haklex/rich-editor/nodes';
import { ColorPicker } from '@haklex/rich-editor-ui';
import { usePortalContainer, usePortalTheme, vars } from '@haklex/rich-style-token';
import type { AutoLinkNode } from '@lexical/link';
import { $isAutoLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelectionStyleValueForProperty, $patchStyleText } from '@lexical/selection';
import type { LexicalNode, RangeSelection } from 'lexical';
import {
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import {
  Bold,
  Check,
  Code,
  Highlighter,
  Italic,
  Languages,
  Link as LinkIcon,
  Strikethrough,
  Subscript,
  Superscript,
  Trash2,
  Underline,
  X,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import * as css from './styles.css';

function isEffectiveLinkNode(node: LexicalNode | null | undefined): boolean {
  if (!$isLinkNode(node)) return false;
  return !$isAutoLinkNode(node) || !node.getIsUnlinked();
}

function isRegularLinkNode(node: LexicalNode | null | undefined): boolean {
  return $isLinkNode(node) && !$isAutoLinkNode(node);
}

function collectSelectedActiveAutoLinkNodes(selection: RangeSelection): AutoLinkNode[] {
  const autoLinkNodes = new Map<string, AutoLinkNode>();

  for (const node of selection.getNodes()) {
    if ($isAutoLinkNode(node) && !node.getIsUnlinked()) {
      autoLinkNodes.set(node.getKey(), node);
    }

    const parent = node.getParent();
    if ($isAutoLinkNode(parent) && !parent.getIsUnlinked()) {
      autoLinkNodes.set(parent.getKey(), parent);
    }
  }

  return Array.from(autoLinkNodes.values());
}

interface ToolbarState {
  fontColor: string;
  isBold: boolean;
  isCode: boolean;
  isHighlight: boolean;
  isItalic: boolean;
  isLink: boolean;
  isRuby: boolean;
  isStrikethrough: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  isUnderline: boolean;
}

const INITIAL_STATE: ToolbarState = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  isSuperscript: false,
  isSubscript: false,
  isCode: false,
  isHighlight: false,
  isLink: false,
  isRuby: false,
  fontColor: '',
};

function findRubyAncestor(node: LexicalNode | null | undefined) {
  let current: LexicalNode | null | undefined = node;
  while (current) {
    if ($isRubyNode(current)) {
      return current;
    }
    current = current.getParent();
  }
  return null;
}

function getSelectedRubyNodes(nodes: LexicalNode[]) {
  const rubyNodes = new Map<string, ReturnType<typeof findRubyAncestor>>();

  for (const node of nodes) {
    const rubyNode = findRubyAncestor(node);
    if (rubyNode) {
      rubyNodes.set(rubyNode.getKey(), rubyNode);
    }
  }

  return Array.from(rubyNodes.values());
}

function getSelectionState(selection: RangeSelection): ToolbarState {
  const nodes = selection.getNodes();
  const hasLink = nodes.some((node: LexicalNode) => {
    const parent = node.getParent();
    return isEffectiveLinkNode(parent) || isEffectiveLinkNode(node);
  });
  const hasRuby = getSelectedRubyNodes(nodes).length > 0;

  return {
    isBold: selection.hasFormat('bold'),
    isItalic: selection.hasFormat('italic'),
    isUnderline: selection.hasFormat('underline'),
    isStrikethrough: selection.hasFormat('strikethrough'),
    isSuperscript: selection.hasFormat('superscript'),
    isSubscript: selection.hasFormat('subscript'),
    isCode: selection.hasFormat('code'),
    isHighlight: selection.hasFormat('highlight'),
    isLink: hasLink,
    isRuby: hasRuby,
    fontColor: $getSelectionStyleValueForProperty(selection, 'color', ''),
  };
}

function computePosition(
  nativeSelection: Selection,
  toolbar: HTMLElement,
  container: Element,
): { top: number; left: number } | null {
  const range = nativeSelection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;

  const toolbarWidth = toolbar.offsetWidth;
  const toolbarHeight = toolbar.offsetHeight;

  // When portaled inside a transformed ancestor (e.g. dialog popup),
  // position:fixed becomes relative to that ancestor, not the viewport.
  const isBody = container === document.body;
  const containerRect = isBody ? undefined : container.getBoundingClientRect();
  const offsetX = containerRect?.left ?? 0;
  const offsetY = containerRect?.top ?? 0;
  const availableWidth = containerRect?.width ?? window.innerWidth;

  const rawLeft = rect.left - offsetX + rect.width / 2 - toolbarWidth / 2;
  const clampedLeft = Math.max(8, Math.min(rawLeft, availableWidth - toolbarWidth - 8));

  return {
    top: rect.top - offsetY - toolbarHeight - 10,
    left: clampedLeft,
  };
}

interface ToolbarButtonProps {
  active: boolean;
  ariaLabel: string;
  children: ReactElement;
  onClick: () => void;
}

function ToolbarButton({ active, onClick, ariaLabel, children }: ToolbarButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`${css.btn}${active ? ` ${css.btnActive}` : ''}`}
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
      {active && <span className={css.btnIndicator} />}
    </button>
  );
}

const ICON_SIZE = 15;
const ICON_STROKE = 2;

type CssVarName = `--${string}`;

function extractCssVarName(value: string): CssVarName | null {
  const match = value.match(/^var\((--[^\s),]+)(?:,[^)]+)?\)$/);
  return (match?.[1] as CssVarName | undefined) ?? null;
}

function collectThemeVarNames(contract: unknown, output: Set<CssVarName>): Set<CssVarName> {
  if (typeof contract === 'string') {
    const cssVarName = extractCssVarName(contract);
    if (cssVarName) output.add(cssVarName);
    return output;
  }

  if (contract && typeof contract === 'object') {
    for (const value of Object.values(contract as Record<string, unknown>)) {
      collectThemeVarNames(value, output);
    }
  }

  return output;
}

const THEME_VAR_NAMES = Array.from(collectThemeVarNames(vars, new Set()));

export function FloatingToolbarPlugin(): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const { className: portalClassName } = usePortalTheme();
  const portalContainer = usePortalContainer();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<ToolbarState>(INITIAL_STATE);
  const [rubyEdit, setRubyEdit] = useState<{
    nodeKey: string;
    reading: string;
    baseText: string;
    isNew: boolean;
  } | null>(null);
  const rubyEditorRef = useRef<HTMLDivElement>(null);
  const rubyInputRef = useRef<HTMLInputElement>(null);
  const rubyEditRef = useRef(rubyEdit);
  rubyEditRef.current = rubyEdit;

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection) || selection.isCollapsed()) {
      setVisible(false);
      return;
    }

    setState(getSelectionState(selection));
    setVisible(true);
  }, []);

  const applyThemeVars = useCallback(
    (toolbar: HTMLElement) => {
      const rootElement = editor.getRootElement();
      if (!rootElement) return;

      const computed = window.getComputedStyle(rootElement);
      for (const name of THEME_VAR_NAMES) {
        const value = computed.getPropertyValue(name).trim();
        if (value) {
          toolbar.style.setProperty(name, value);
        }
      }
    },
    [editor],
  );

  useEffect(() => {
    const unregisterCommand = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    const unregisterUpdate = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });

    return () => {
      unregisterCommand();
      unregisterUpdate();
    };
  }, [editor, updateToolbar]);

  useEffect(() => {
    if (!visible || !toolbarRef.current) return;

    const positionToolbar = () => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;

      // Toolbar is portaled to document.body, so we need to re-attach
      // editor theme variables for correct light/dark rendering.
      applyThemeVars(toolbar);

      const nativeSelection = window.getSelection();
      if (!nativeSelection || nativeSelection.rangeCount === 0) {
        setVisible(false);
        return;
      }

      const pos = computePosition(nativeSelection, toolbar, portalContainer);
      if (!pos) {
        setVisible(false);
        return;
      }

      toolbar.style.top = `${pos.top}px`;
      toolbar.style.left = `${pos.left}px`;
    };

    requestAnimationFrame(positionToolbar);

    // Listen to scroll on the nearest scrollable ancestor so toolbar follows content
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    let scrollParent: HTMLElement | Window = window;
    let el: HTMLElement | null = rootElement.parentElement;
    while (el) {
      const { overflowY } = window.getComputedStyle(el);
      if (overflowY === 'auto' || overflowY === 'scroll') {
        scrollParent = el;
        break;
      }
      el = el.parentElement;
    }

    const onScroll = () => requestAnimationFrame(positionToolbar);
    scrollParent.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollParent.removeEventListener('scroll', onScroll);
  }, [applyThemeVars, editor, visible, state]);

  const handleFormat = useCallback(
    (
      format:
        | 'bold'
        | 'italic'
        | 'underline'
        | 'strikethrough'
        | 'superscript'
        | 'subscript'
        | 'code'
        | 'highlight',
    ) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor],
  );

  const handleLink = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const nodes = selection.getNodes();
      const hasLink = nodes.some((node: LexicalNode) => {
        const parent = node.getParent();
        return isEffectiveLinkNode(parent) || isEffectiveLinkNode(node);
      });

      if (hasLink) {
        for (const autoLinkNode of collectSelectedActiveAutoLinkNodes(selection)) {
          autoLinkNode.setIsUnlinked(true);
          autoLinkNode.markDirty();
        }

        const hasRegularLink = nodes.some((node: LexicalNode) => {
          const parent = node.getParent();
          return isRegularLinkNode(parent) || isRegularLinkNode(node);
        });

        if (hasRegularLink) {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
      } else {
        const text = selection.getTextContent();
        const url = /^https?:\/\//.test(text) ? text : '';
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url || 'https://');
      }
    });
  }, [editor]);

  const handleColor = useCallback(
    (value: string) => {
      editor.update(() => {
        const sel = $getSelection();
        if ($isRangeSelection(sel)) {
          $patchStyleText(sel, { color: value === 'inherit' ? null : value });
        }
      });
    },
    [editor],
  );

  const handleRuby = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const nodes = selection.getNodes();
      const rubyNodes = getSelectedRubyNodes(nodes);

      if (rubyNodes.length > 0) {
        const rubyNode = rubyNodes[0];
        if (!rubyNode) return;
        setRubyEdit({
          nodeKey: rubyNode.getKey(),
          reading: rubyNode.getReading(),
          baseText: rubyNode.getTextContent(),
          isNew: false,
        });
      } else {
        const text = selection.getTextContent();
        if (!text.trim()) return;

        selection.removeText();
        const rubyNode = $createRubyNode('');
        rubyNode.append($createTextNode(text));
        const freshSelection = $getSelection();
        if ($isRangeSelection(freshSelection)) {
          freshSelection.insertNodes([rubyNode]);
        }

        setRubyEdit({
          nodeKey: rubyNode.getKey(),
          reading: '',
          baseText: text,
          isNew: true,
        });
      }
    });
  }, [editor]);

  const handleRubyConfirm = useCallback(() => {
    const edit = rubyEditRef.current;
    if (!edit) return;
    editor.update(() => {
      const node = $getNodeByKey(edit.nodeKey);
      if ($isRubyNode(node)) {
        node.setReading(edit.reading);
      }
    });
    setRubyEdit(null);
  }, [editor]);

  const handleRubyCancel = useCallback(() => {
    const edit = rubyEditRef.current;
    if (!edit) return;
    if (edit.isNew) {
      editor.update(() => {
        const node = $getNodeByKey(edit.nodeKey);
        if ($isRubyNode(node)) {
          const children = node.getChildren();
          for (const child of children) {
            node.insertBefore(child);
          }
          node.remove();
        }
      });
    }
    setRubyEdit(null);
  }, [editor]);

  const handleRubyDelete = useCallback(() => {
    const edit = rubyEditRef.current;
    if (!edit) return;
    editor.update(() => {
      const node = $getNodeByKey(edit.nodeKey);
      if ($isRubyNode(node)) {
        const children = node.getChildren();
        for (const child of children) {
          node.insertBefore(child);
        }
        node.remove();
      }
    });
    setRubyEdit(null);
  }, [editor]);

  const isRubyEditing = rubyEdit !== null;

  useEffect(() => {
    if (!isRubyEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      const currentEdit = rubyEditRef.current;
      if (!currentEdit) return;
      if (rubyEditorRef.current && !rubyEditorRef.current.contains(e.target as Node)) {
        if (currentEdit.reading.trim()) {
          editor.update(() => {
            const node = $getNodeByKey(currentEdit.nodeKey);
            if ($isRubyNode(node)) {
              node.setReading(currentEdit.reading);
            }
          });
        } else if (currentEdit.isNew) {
          editor.update(() => {
            const node = $getNodeByKey(currentEdit.nodeKey);
            if ($isRubyNode(node)) {
              const children = node.getChildren();
              for (const child of children) {
                node.insertBefore(child);
              }
              node.remove();
            }
          });
        }
        setRubyEdit(null);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editor, isRubyEditing]);

  useEffect(() => {
    if (!rubyEdit || !rubyEditorRef.current) return;

    const positionEditor = () => {
      const editorEl = rubyEditorRef.current;
      if (!editorEl) return;

      applyThemeVars(editorEl);

      const rubyDom = editor.getElementByKey(rubyEdit.nodeKey);
      if (!rubyDom) return;

      const rect = rubyDom.getBoundingClientRect();
      const isBody = portalContainer === document.body;
      const containerRect = isBody ? undefined : portalContainer.getBoundingClientRect();
      const oX = containerRect?.left ?? 0;
      const oY = containerRect?.top ?? 0;
      const availW = containerRect?.width ?? window.innerWidth;

      const editorWidth = editorEl.offsetWidth;
      const rawLeft = rect.left - oX + rect.width / 2 - editorWidth / 2;
      const clampedLeft = Math.max(8, Math.min(rawLeft, availW - editorWidth - 8));

      editorEl.style.top = `${rect.bottom - oY + 8}px`;
      editorEl.style.left = `${clampedLeft}px`;
    };

    requestAnimationFrame(positionEditor);
    requestAnimationFrame(() => {
      rubyInputRef.current?.focus();
    });
  }, [applyThemeVars, editor, rubyEdit]);

  if (!visible && !rubyEdit) return null;
  const toolbarClassName = portalClassName ? `${css.toolbar} ${portalClassName}` : css.toolbar;
  const rubyEditorClassName = portalClassName
    ? `${css.rubyEditor} ${portalClassName}`
    : css.rubyEditor;

  return (
    <>
      {visible &&
        !rubyEdit &&
        createPortal(
          <div
            aria-label="Text formatting"
            className={toolbarClassName}
            ref={toolbarRef}
            role="toolbar"
            style={{ position: 'fixed', zIndex: 50 }}
          >
            {/* Group 1: Basic formatting */}
            <ToolbarButton
              active={state.isBold}
              ariaLabel="Bold"
              onClick={() => handleFormat('bold')}
            >
              <Bold size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </ToolbarButton>
            <ToolbarButton
              active={state.isItalic}
              ariaLabel="Italic"
              onClick={() => handleFormat('italic')}
            >
              <Italic size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </ToolbarButton>
            <ToolbarButton
              active={state.isUnderline}
              ariaLabel="Underline"
              onClick={() => handleFormat('underline')}
            >
              <Underline size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </ToolbarButton>
            <ToolbarButton
              active={state.isStrikethrough}
              ariaLabel="Strikethrough"
              onClick={() => handleFormat('strikethrough')}
            >
              <Strikethrough size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </ToolbarButton>
            <ToolbarButton
              active={state.isSuperscript}
              ariaLabel="Superscript"
              onClick={() => handleFormat('superscript')}
            >
              <Superscript size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </ToolbarButton>
            <ToolbarButton
              active={state.isSubscript}
              ariaLabel="Subscript"
              onClick={() => handleFormat('subscript')}
            >
              <Subscript size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </ToolbarButton>

            <span className={css.separator} />

            {/* Group 2: Code, Highlight, Link */}
            <ToolbarButton
              active={state.isCode}
              ariaLabel="Code"
              onClick={() => handleFormat('code')}
            >
              <Code size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </ToolbarButton>
            <ToolbarButton
              active={state.isHighlight}
              ariaLabel="Highlight"
              onClick={() => handleFormat('highlight')}
            >
              <Highlighter size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </ToolbarButton>
            <ToolbarButton active={state.isLink} ariaLabel="Link" onClick={handleLink}>
              <LinkIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </ToolbarButton>
            <ToolbarButton active={state.isRuby} ariaLabel="Ruby annotation" onClick={handleRuby}>
              <Languages size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </ToolbarButton>

            <span className={css.separator} />

            {/* Group 3: Color picker */}
            <ColorPicker currentColor={state.fontColor || 'inherit'} onSelect={handleColor} />
          </div>,
          portalContainer,
        )}

      {rubyEdit &&
        createPortal(
          <div
            className={rubyEditorClassName}
            ref={rubyEditorRef}
            style={{ position: 'fixed', zIndex: 51 }}
          >
            <div className={css.rubyPreview}>
              <span className={css.rubyPreviewReading}>{rubyEdit.reading || '\u00A0'}</span>
              <span className={css.rubyPreviewBase}>{rubyEdit.baseText}</span>
            </div>

            <div className={css.rubyInputRow}>
              <input
                className={css.rubyInput}
                placeholder="读音"
                ref={rubyInputRef}
                value={rubyEdit.reading}
                onChange={(e) =>
                  setRubyEdit((prev) => (prev ? { ...prev, reading: e.target.value } : null))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRubyConfirm();
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    handleRubyCancel();
                  }
                }}
              />
              <button
                aria-label="Confirm"
                className={css.rubyActionBtn}
                style={{ color: '#22c55e' }}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleRubyConfirm();
                }}
              >
                <Check size={14} strokeWidth={ICON_STROKE} />
              </button>
              <button
                aria-label="Cancel"
                className={css.rubyActionBtn}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleRubyCancel();
                }}
              >
                <X size={14} strokeWidth={ICON_STROKE} />
              </button>

              <span className={css.separator} />

              <button
                aria-label="Delete ruby"
                className={css.rubyActionBtn}
                style={{ color: '#ef4444' }}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleRubyDelete();
                }}
              >
                <Trash2 size={14} strokeWidth={ICON_STROKE} />
              </button>
            </div>

            <span className={css.rubyHint}>Enter 保存 / Esc 取消</span>
          </div>,
          portalContainer,
        )}
    </>
  );
}
