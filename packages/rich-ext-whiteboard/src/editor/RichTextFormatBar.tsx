import { ActionButton } from '@haklex/rich-editor-ui';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import type { LexicalEditor, TextFormatType } from 'lexical';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
} from 'lexical';
import type { LucideIcon } from 'lucide-react';
import {
  Bold,
  Code,
  Heading,
  Highlighter,
  Italic,
  Link,
  List,
  ListOrdered,
  Strikethrough,
} from 'lucide-react';
import type { FC, MouseEvent } from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import type { Point } from '../model/geometry';
import * as css from './chrome.css';

export const CARD_TEXT_COLORS = ['#1e1e1e', '#868e96', '#e03131', '#2f9e44', '#1971c2', '#f08c00'];

const FORMATS: Array<{ format: TextFormatType; icon: LucideIcon; label: string }> = [
  { format: 'bold', icon: Bold, label: 'Bold' },
  { format: 'italic', icon: Italic, label: 'Italic' },
  { format: 'strikethrough', icon: Strikethrough, label: 'Strikethrough' },
  { format: 'code', icon: Code, label: 'Inline code' },
  { format: 'highlight', icon: Highlighter, label: 'Highlight' },
];

const DISCRETE = { discrete: true } as const;

const keepFocus = (e: MouseEvent) => e.preventDefault();

function selectionBlock() {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;
  return selection.anchor.getNode().getTopLevelElement();
}

function toggleHeading(editor: LexicalEditor) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const heading = $isHeadingNode(selectionBlock());
    $setBlocksType(selection, () => (heading ? $createParagraphNode() : $createHeadingNode('h3')));
  }, DISCRETE);
}

function toggleList(editor: LexicalEditor, ordered: boolean) {
  const inList = editor.getEditorState().read(() => $isListNode(selectionBlock()));
  if (inList) editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  else
    editor.dispatchCommand(
      ordered ? INSERT_ORDERED_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
      undefined,
    );
}

function selectionHasLink(editor: LexicalEditor): boolean {
  return editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return false;
    return selection.getNodes().some((node) => $isLinkNode(node) || $isLinkNode(node.getParent()));
  });
}

function normalizeUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (/^(?:https?:|mailto:)/i.test(value)) return value;
  if (/^[a-z][\w+.-]*:/i.test(value)) return null;
  return `https://${value}`;
}

export const RichTextFormatBar: FC<{ at: Point; host: HTMLElement | null }> = ({ at, host }) => {
  const [editor] = useLexicalComposerContext();
  const [visible, setVisible] = useState(false);
  const [linking, setLinking] = useState(false);

  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          setVisible($isRangeSelection(selection) && !selection.isCollapsed());
        });
      }),
    [editor],
  );

  if (!host || (!visible && !linking)) return null;

  const button = (label: string, Icon: LucideIcon, run: () => void) => (
    <ActionButton
      icon
      aria-label={label}
      key={label}
      size="sm"
      title={label}
      variant="ghost"
      onClick={run}
      onMouseDown={keepFocus}
    >
      <Icon size={15} />
    </ActionButton>
  );

  return createPortal(
    <div
      data-richtext-format-bar
      className={`${css.floating} ${css.formatBar}`}
      style={{ left: at[0], top: at[1] }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {linking ? (
        <input
          autoFocus
          aria-label="Link URL"
          className={css.formatBarInput}
          placeholder="https://"
          onBlur={() => setLinking(false)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Escape') setLinking(false);
            if (e.key !== 'Enter') return;
            const url = normalizeUrl(e.currentTarget.value);
            setLinking(false);
            if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
            editor.focus();
          }}
        />
      ) : (
        <>
          {FORMATS.map(({ format, icon, label }) =>
            button(label, icon, () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)),
          )}
          {CARD_TEXT_COLORS.map((color) => (
            <button
              aria-label={`Text colour ${color}`}
              className={css.formatSwatch}
              data-richtext-color={color}
              key={color}
              style={{ background: color }}
              type="button"
              onMouseDown={keepFocus}
              onClick={() =>
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) $patchStyleText(selection, { color });
                }, DISCRETE)
              }
            />
          ))}
          {button('Heading', Heading, () => toggleHeading(editor))}
          {button('Bulleted list', List, () => toggleList(editor, false))}
          {button('Numbered list', ListOrdered, () => toggleList(editor, true))}
          {button('Link', Link, () => {
            if (selectionHasLink(editor)) editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
            else setLinking(true);
          })}
        </>
      )}
    </div>,
    host,
  );
};
