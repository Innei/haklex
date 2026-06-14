import { $isImageNode } from '@haklex/rich-editor/nodes';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useStore } from 'jotai';
import type { LexicalEditor } from 'lexical';
import {
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  COMMAND_PRIORITY_HIGH,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
} from 'lexical';
import { useCallback, useEffect } from 'react';

import { wrapperRefAtom } from './atoms';
import {
  getImageDropLayout,
  getImageDropSide,
  getImageDropTargetBlock,
  IMAGE_DRAG_DATA_KEY,
  isImageDragData,
} from './image-drag-layout';
import * as styles from './styles.css';

interface EditorDragRegistration {
  count: number;
  unregister: () => void;
}

const editorDragRegistrations = new WeakMap<LexicalEditor, EditorDragRegistration>();

function setDropSide(rootElement: HTMLElement, event: DragEvent): void {
  const side = getImageDropSide(rootElement.getBoundingClientRect(), event.clientX);
  rootElement.dataset.richImageDropSide = side;
}

function clearDropSide(rootElement: HTMLElement): void {
  delete rootElement.dataset.richImageDropSide;
}

function registerImageDragLayout(editor: LexicalEditor): () => void {
  const existing = editorDragRegistrations.get(editor);
  if (existing) {
    existing.count += 1;
    return () => {
      existing.count -= 1;
      if (existing.count > 0) return;
      existing.unregister();
      editorDragRegistrations.delete(editor);
    };
  }

  const rootElement = editor.getRootElement();
  if (!rootElement) return () => {};

  const clear = () => clearDropSide(rootElement);

  const unregisterDragOver = editor.registerCommand(
    DRAGOVER_COMMAND,
    (event: DragEvent) => {
      if (!isImageDragData(event.dataTransfer)) return false;

      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';

      const block = getImageDropTargetBlock(editor, rootElement, event);
      if (!block) {
        clearDropSide(rootElement);
        return true;
      }

      setDropSide(rootElement, event);
      return true;
    },
    COMMAND_PRIORITY_HIGH,
  );

  const unregisterDrop = editor.registerCommand(
    DROP_COMMAND,
    (event: DragEvent) => {
      const draggedKey = event.dataTransfer?.getData(IMAGE_DRAG_DATA_KEY);
      if (!draggedKey) return false;

      event.preventDefault();
      clearDropSide(rootElement);

      const block = getImageDropTargetBlock(editor, rootElement, event);
      if (!block) return true;

      const rect = block.getBoundingClientRect();
      const targetKey = editor.getEditorState().read(
        () => {
          const node = $getNearestNodeFromDOMNode(block);
          return node?.getKey() ?? null;
        },
        { editor },
      );
      if (!targetKey) return true;

      const layout = getImageDropLayout(
        getImageDropSide(rootElement.getBoundingClientRect(), event.clientX),
      );
      const insertBefore = event.clientY < rect.top + rect.height / 2;

      editor.update(
        () => {
          const draggedNode = $getNodeByKey(draggedKey);
          if (!$isImageNode(draggedNode)) return;

          draggedNode.setLayout(layout);
          if (draggedKey === targetKey) return;

          draggedNode.remove();
          const targetNode = $getNodeByKey(targetKey);
          if (!targetNode) return;

          if (insertBefore) {
            targetNode.insertBefore(draggedNode);
          } else {
            targetNode.insertAfter(draggedNode);
          }
        },
        { tag: 'skip-scroll-into-view' },
      );

      return true;
    },
    COMMAND_PRIORITY_HIGH,
  );

  const unregisterDragStart = editor.registerCommand(
    DRAGSTART_COMMAND,
    (event: DragEvent) => isImageDragData(event.dataTransfer),
    COMMAND_PRIORITY_HIGH,
  );

  window.addEventListener('dragend', clear);
  window.addEventListener('drop', clear);

  const registration: EditorDragRegistration = {
    count: 1,
    unregister: () => {
      unregisterDragOver();
      unregisterDrop();
      unregisterDragStart();
      window.removeEventListener('dragend', clear);
      window.removeEventListener('drop', clear);
      clearDropSide(rootElement);
    },
  };
  editorDragRegistrations.set(editor, registration);

  return () => {
    registration.count -= 1;
    if (registration.count > 0) return;
    registration.unregister();
    editorDragRegistrations.delete(editor);
  };
}

export function useImageDragLayout() {
  const [editor] = useLexicalComposerContext();
  const store = useStore();

  useEffect(() => registerImageDragLayout(editor), [editor]);

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      const wrapper = store.get(wrapperRefAtom).current;
      const blockWrapper = wrapper?.closest<HTMLElement>('.rich-image-wrapper');
      if (!wrapper || !event.dataTransfer) {
        event.preventDefault();
        return;
      }

      const key = editor.getEditorState().read(
        () => {
          const node = $getNearestNodeFromDOMNode(wrapper);
          return $isImageNode(node) ? node.getKey() : null;
        },
        { editor },
      );
      if (!key) {
        event.preventDefault();
        return;
      }

      event.dataTransfer.setData(IMAGE_DRAG_DATA_KEY, key);
      event.dataTransfer.effectAllowed = 'move';
      blockWrapper?.classList.add(styles.imageDragging);
    },
    [editor, store],
  );

  const handleDragEnd = useCallback(() => {
    const wrapper = store.get(wrapperRefAtom).current;
    wrapper?.closest<HTMLElement>('.rich-image-wrapper')?.classList.remove(styles.imageDragging);
  }, [store]);

  return {
    draggable: true,
    onDragEnd: handleDragEnd,
    onDragStart: handleDragStart,
  } as const;
}
