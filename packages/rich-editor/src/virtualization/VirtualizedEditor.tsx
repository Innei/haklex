import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  type LexicalEditor,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import * as contentCss from '../components/ContentEditable.css';
import { EditorBlockContext } from '../context/EditorBlockContext';
import type { EditorSurfaceProps } from '../context/EditorSurfaceContext';
import { useNestedEditorPlugins } from '../context/NestedEditorPluginsContext';
import { EditorRecycler } from './controller';
import type { Slot } from './layout';
import * as css from './style.css';
import type { EditorVirtualizationOptions } from './types';

function IslandPlugins({ controller, slot }: { controller: EditorRecycler; slot: Slot }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const edge = (end: boolean) => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;
      const node = end ? $getRoot().getLastDescendant() : $getRoot().getFirstDescendant();
      return (
        !!node &&
        selection.anchor.key === node.getKey() &&
        selection.anchor.offset === (end ? node.getTextContentSize() : 0)
      );
    };
    const unregister = [
      editor.registerCommand(
        UNDO_COMMAND,
        () => {
          controller.master.dispatchCommand(UNDO_COMMAND, undefined);
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        REDO_COMMAND,
        () => {
          controller.master.dispatchCommand(REDO_COMMAND, undefined);
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        (event) => {
          if (!edge(false) || !controller.joinNeighbor(slot, true)) return false;
          event?.preventDefault();
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        (event) => {
          if (!edge(true) || !controller.joinNeighbor(slot, false)) return false;
          event?.preventDefault();
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        (event) => {
          if (!edge(false) || event?.shiftKey || slot.index === 0) return false;
          event?.preventDefault();
          controller.focusBlock(slot.index - 1, true);
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        (event) => {
          if (!edge(true) || event?.shiftKey) return false;
          const index = slot.index + controller.island(slot).ids.length;
          if (index >= controller.rows.length) return false;
          event?.preventDefault();
          controller.focusBlock(index);
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    ];
    return () => unregister.forEach((fn) => fn());
  }, [controller, editor, slot]);
  return null;
}

function EditorSlot({
  controller,
  slot,
  plugins: surfacePlugins,
  onActiveEditorChange,
  onRelease,
  retainSurface,
  placeholder,
}: {
  controller: EditorRecycler;
  slot: Slot;
  retainSurface: EditorSurfaceProps['retainSurface'];
  placeholder?: string;
  plugins: EditorSurfaceProps['plugins'];
  onActiveEditorChange: EditorSurfaceProps['onActiveEditorChange'];
  onRelease: (editor: typeof controller.master) => void;
}) {
  const island = controller.island(slot);
  const row = controller.rows[slot.index];
  const binding = `${slot.generation}:${slot.active}`;
  const [settled, setSettled] = useState('');
  const [host] = useState(() => {
    const element = document.createElement('div');
    element.style.display = 'contents';
    return element;
  });
  const mounted = slot.active || controller.preserve.has(slot.id);
  const plugins = useNestedEditorPlugins();
  const value = useMemo(
    () => ({
      blockId: row.id,
      active: slot.active,
      editor: island.editor,
      nodeState: (key?: string) => controller.nodeState(slot, key, row.id),
      retain: () => {
        island.retained++;
        const releaseSurface = retainSurface();
        let released = false;
        return () => {
          if (released) return;
          released = true;
          island.retained--;
          releaseSurface();
          controller.refresh(false);
        };
      },
    }),
    [controller, island.editor, retainSurface, row.id, slot, slot.active, slot.generation],
  );
  const ref = useCallback(
    (element: HTMLDivElement | null) => controller.attach(slot, element),
    [controller, slot],
  );
  useLayoutEffect(() => {
    controller.mount(slot, host);
    if (mounted) controller.bind(slot);
    else island.generation = -1;
    slot.beforeRelease = () => {
      controller.capturePanels(slot);
      onRelease(island.editor);
    };
  });
  useLayoutEffect(() => () => host.remove(), [host]);
  useLayoutEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setSettled(binding));
    });
    return () => cancelAnimationFrame(frame);
  }, [binding]);
  return createPortal(
    <div
      className={css.slot}
      data-pool={slot.pool}
      data-restoring={settled !== binding ? '' : undefined}
      data-virtual-editor-block={slot.active ? row.id : undefined}
      data-virtual-editor-slot={slot.id}
      ref={ref}
      style={{
        display: slot.active ? undefined : 'none',
        transform: `translateY(${controller.slotOffset(slot)}px)`,
      }}
      onFocusCapture={() => onActiveEditorChange(island.editor)}
    >
      <EditorBlockContext value={value}>
        {mounted && (
          <LexicalNestedComposer skipCollabChecks initialEditor={island.editor}>
            <RichTextPlugin
              ErrorBoundary={LexicalErrorBoundary}
              contentEditable={
                <ContentEditable
                  aria-label="Document block"
                  aria-placeholder={placeholder ?? ''}
                  className={`rich-editor__content ${css.editable}`}
                  data-virtual-editor-content=""
                  placeholder={
                    <div
                      className={contentCss.placeholder}
                      style={{ top: 0, left: 0, display: placeholder ? undefined : 'none' }}
                    >
                      {placeholder}
                    </div>
                  }
                />
              }
            />
            {slot.active && surfacePlugins}
            <IslandPlugins controller={controller} slot={slot} />
            {slot.active && plugins}
          </LexicalNestedComposer>
        )}
      </EditorBlockContext>
    </div>,
    host,
    String(slot.id),
  );
}

function Contents({
  controller,
  plugins,
  onActiveEditorChange,
  onRelease,
  retainSurface,
  placeholder,
}: {
  controller: EditorRecycler;
  retainSurface: EditorSurfaceProps['retainSurface'];
  placeholder?: string;
  plugins: EditorSurfaceProps['plugins'];
  onActiveEditorChange: EditorSurfaceProps['onActiveEditorChange'];
  onRelease: (editor: typeof controller.master) => void;
}) {
  const [, update] = useState(0);
  useLayoutEffect(() => controller.subscribe(() => update((value) => value + 1)), [controller]);
  useLayoutEffect(() => controller.commitLayout());
  return (
    <>
      {controller.pool.slots.map((slot) => (
        <EditorSlot
          controller={controller}
          key={slot.id}
          plugins={plugins}
          retainSurface={retainSurface}
          slot={slot}
          placeholder={
            controller.rows.length === 1 &&
            controller.rows[0].data.type === 'paragraph' &&
            !(controller.rows[0].data.children ?? []).some(
              (child) => child.type !== 'text' || child.text,
            )
              ? placeholder
              : undefined
          }
          onActiveEditorChange={onActiveEditorChange}
          onRelease={onRelease}
        />
      ))}
    </>
  );
}

export function VirtualizedEditor({
  options,
  className,
  plugins,
  autoFocus,
  hasHeader,
  onActiveEditorChange,
  retainSurface,
  placeholder,
}: EditorSurfaceProps & { options: EditorVirtualizationOptions }) {
  const [editor] = useLexicalComposerContext();
  const { scrollContainer, overscan, estimateBlockHeight, preserveCapacity } = options;
  const stableOptions = useMemo(
    () => ({ scrollContainer, overscan, estimateBlockHeight, preserveCapacity }),
    [scrollContainer, overscan, estimateBlockHeight, preserveCapacity],
  );
  const active = useRef<LexicalEditor | null>(null);
  const selectEditor = useCallback(
    (editor: LexicalEditor | null) => {
      active.current = editor;
      onActiveEditorChange(editor);
    },
    [onActiveEditorChange],
  );
  const releaseEditor = useCallback(
    (editor: LexicalEditor) => {
      if (active.current === editor) selectEditor(null);
    },
    [selectEditor],
  );
  const canvas = useRef<HTMLDivElement>(null);
  const [controller, setController] = useState<EditorRecycler | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    setController(null);
    setError('');
    const element = canvas.current!;
    let instance: EditorRecycler;
    try {
      instance = new EditorRecycler(editor, element, stableOptions);
      setController(instance);
      Object.assign(element, { virtualEditor: instance });
    } catch (reason) {
      setError(String(reason));
      return;
    }
    return () => {
      selectEditor(null);
      instance.dispose();
      Reflect.deleteProperty(element, 'virtualEditor');
    };
  }, [editor, selectEditor, stableOptions]);
  useEffect(() => {
    if (controller && autoFocus) controller.focusBlock(0, false, false);
  }, [autoFocus, controller]);
  return (
    <div
      className={`rich-editor__content-wrapper ${contentCss.contentWrapper}`}
      style={{ '--ce-padding-top': `${hasHeader ? 40 : 12}px` } as React.CSSProperties}
    >
      {error && <p role="alert">{error}</p>}
      <div className={`${contentCss.content} ${className ?? ''}`}>
        <div className={css.canvas} data-virtual-editor="" ref={canvas}>
          {controller && (
            <Contents
              controller={controller}
              placeholder={placeholder}
              plugins={plugins}
              retainSurface={retainSurface}
              onActiveEditorChange={selectEditor}
              onRelease={releaseEditor}
            />
          )}
        </div>
      </div>
    </div>
  );
}
