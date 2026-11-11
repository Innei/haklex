import { LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import type { LexicalEditor } from 'lexical';
import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { angleOf } from '../model/geometry';
import type { RichTextContent } from '../model/richtext';
import { RICHTEXT_PADDING } from '../model/richtext';
import { toEditableContent } from '../model/richtext-editable';
import { RICHTEXT_BASE_STYLE } from '../scene/richtext/RichTextContent';
import { DARK_SCENE_FILTER } from '../scene/Scene';
import type { RichTextElement } from '../scene/types';
import { commitRichTextContent, stopRichTextEditing } from './richtext-actions';
import * as css from './richtext-editor.css';
import type { WhiteboardStore } from './store';
import { useStore } from './store';
import { sceneToScreen } from './viewport';

const THEME = {
  paragraph: css.paragraph,
  heading: { h1: css.h1, h2: css.h2, h3: css.h3, h4: css.hOther, h5: css.hOther, h6: css.hOther },
  quote: css.quote,
  list: {
    ul: css.list,
    ol: css.list,
    listitem: css.listItem,
    nested: { listitem: css.nestedListItem },
  },
  link: css.link,
  text: {
    underline: css.underline,
    strikethrough: css.strikethrough,
    underlineStrikethrough: css.underlineStrikethrough,
  },
};

const NODES = [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode];

const EditorBridge: FC<{ onReady: (editor: LexicalEditor) => void }> = ({ onReady }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    onReady(editor);
    editor.focus();
  }, [editor, onReady]);
  return null;
};

const Surface: FC<{
  children?: ReactNode;
  dark: boolean;
  el: RichTextElement;
  store: WhiteboardStore;
}> = ({ children, dark, el, store }) => {
  const viewport = useStore(store, (s) => s.viewport);
  const editorRef = useRef<LexicalEditor | null>(null);
  const initialRef = useRef<string | null>(null);
  const id = el.id;

  const initialConfig = useMemo<InitialConfigType>(
    () => ({
      namespace: 'whiteboard-card',
      nodes: NODES,
      theme: THEME,
      editorState: JSON.stringify(toEditableContent(el.content)),
      onError: (error: Error) => {
        throw error;
      },
    }),
    [id],
  );

  useEffect(
    () => () => {
      const editor = editorRef.current;
      if (!editor) return;
      const json = JSON.stringify(editor.getEditorState().toJSON());
      if (json === initialRef.current) return;
      commitRichTextContent(store, id, JSON.parse(json) as RichTextContent);
    },
    [id, store],
  );

  const onReady = useCallback((editor: LexicalEditor) => {
    editorRef.current = editor;
    initialRef.current ??= JSON.stringify(editor.getEditorState().toJSON());
  }, []);

  const [left, top] = sceneToScreen([el.x, el.y], viewport);
  const angle = angleOf(el);
  const rotate = angle
    ? ` translate(${el.width / 2}px, ${el.height / 2}px) rotate(${angle}rad) translate(${-el.width / 2}px, ${-el.height / 2}px)`
    : '';

  return (
    <div
      className={css.surface}
      data-whiteboard-richtext-editor={id}
      style={{
        ...RICHTEXT_BASE_STYLE,
        left,
        top,
        width: el.width,
        minHeight: el.height,
        padding: RICHTEXT_PADDING,
        opacity: el.opacity / 100,
        transform: `scale(${viewport.zoom})${rotate}`,
        filter: dark ? DARK_SCENE_FILTER : undefined,
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        stopRichTextEditing(store);
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') {
          e.preventDefault();
          stopRichTextEditing(store);
        }
      }}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          ErrorBoundary={LexicalErrorBoundary}
          contentEditable={<ContentEditable className={css.editable} />}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <EditorBridge onReady={onReady} />
        {children}
      </LexicalComposer>
    </div>
  );
};

export const RichTextEditor: FC<{
  children?: ReactNode;
  dark?: boolean;
  store: WhiteboardStore;
}> = ({ children, dark = false, store }) => {
  const el = useStore(store, (s) =>
    s.editingRichTextId
      ? (s.elements.find((e) => e.id === s.editingRichTextId && e.type === 'richtext') as
          RichTextElement | undefined)
      : undefined,
  );
  if (!el) return null;
  return (
    <Surface dark={dark} el={el} key={el.id} store={store}>
      {children}
    </Surface>
  );
};
