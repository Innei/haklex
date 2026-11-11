import type { FC, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useEffect, useMemo, useRef } from 'react';

import { getCommonBounds } from '../model/bounds';
import type { Point } from '../model/geometry';
import * as chrome from './chrome.css';
import * as css from './editor.css';
import { FrameNameEditor } from './FrameNameEditor';
import type { ImageInsertOptions } from './image-actions';
import { insertImageFile } from './image-actions';
import { useNarrowLayout } from './layout';
import { MobileDock } from './MobileDock';
import { SelectionOverlay } from './overlay/SelectionOverlay';
import { handleShortcut } from './shortcuts';
import type { WhiteboardStore } from './store';
import { useStore } from './store';
import { StylePanel } from './StylePanel';
import { StyleSheet } from './StyleSheet';
import { TextEditor } from './TextEditor';
import { WhiteboardToolbar } from './Toolbar';
import { createToolHandlers, getToolHandler } from './tools';
import type { ToolContext } from './tools/types';
import { fitToContent, screenToScene } from './viewport';
import { WhiteboardCanvas } from './WhiteboardCanvas';
import { ZoomControls } from './ZoomControls';

const MULTI_IMAGE_OFFSET = 20;
const ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

function isTypingTarget(target: EventTarget): boolean {
  return (
    target instanceof Element &&
    (target.matches('input, textarea, select') || (target as HTMLElement).isContentEditable)
  );
}

export interface WhiteboardEditorProps extends ImageInsertOptions {
  store: WhiteboardStore;
  theme: 'light' | 'dark';
  toolbar?: 'inline' | 'none';
}

export const WhiteboardEditor: FC<WhiteboardEditorProps> = ({
  store,
  theme,
  toolbar = 'inline',
  uploadFile,
  onUploadError,
}) => {
  const handlers = useMemo(createToolHandlers, []);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickAtRef = useRef<Point | null>(null);
  const optionsRef = useRef<ImageInsertOptions>({});
  optionsRef.current = { uploadFile, onUploadError };

  const context = useMemo<ToolContext>(() => {
    const onFiles = (files: File[], at: Point) => {
      files.forEach((file, i) => {
        const offset = i * MULTI_IMAGE_OFFSET;
        void insertImageFile(store, file, [at[0] + offset, at[1] + offset], optionsRef.current);
      });
    };
    const requestImage = (at: Point) => {
      pickAtRef.current = at;
      inputRef.current?.click();
    };
    return { store, onFiles, requestImage };
  }, [store]);

  const tool = useStore(store, (s) => s.tool);
  const narrow = useNarrowLayout(store);
  const canvasWidth = useStore(store, (s) => s.canvasSize.width);
  const positionedRef = useRef(false);
  useEffect(() => {
    if (positionedRef.current || canvasWidth <= 0) return;
    positionedRef.current = true;
    const { elements, canvasSize } = store.getState();
    const alive = elements.filter((el) => !el.isDeleted);
    if (alive.length === 0) return;
    store.setState({ viewport: fitToContent(getCommonBounds(alive), canvasSize) });
  }, [canvasWidth, store]);
  useEffect(() => {
    if (tool !== 'image') return;
    const { viewport, canvasSize, toolLocked } = store.getState();
    context.requestImage?.(screenToScene([canvasSize.width / 2, canvasSize.height / 2], viewport));
    if (!toolLocked) store.setState({ tool: 'selection' });
  }, [context, store, tool]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;
    const onCanvas = e.target instanceof Element && e.target.hasAttribute('data-whiteboard-canvas');
    if (!onCanvas && ARROW_KEYS.has(e.key)) return;
    const handler = getToolHandler(handlers, store.getState().tool);
    if (handler.onKeyDown?.(context, e.nativeEvent) || handleShortcut(store, e)) {
      e.preventDefault();
    }
  };

  return (
    <div data-whiteboard-editor className={css.root} onKeyDown={onKeyDown}>
      {toolbar === 'inline' && !narrow && (
        <div className={chrome.inlineToolbar}>
          <WhiteboardToolbar store={store} />
        </div>
      )}
      <WhiteboardCanvas context={context} handlers={handlers} store={store} theme={theme}>
        <SelectionOverlay store={store} />
        <TextEditor dark={theme === 'dark'} store={store} />
        <FrameNameEditor store={store} />
        {narrow ? <StyleSheet store={store} /> : <StylePanel store={store} />}
        <ZoomControls compact={narrow} store={store} />
        {narrow && <MobileDock store={store} />}
      </WhiteboardCanvas>
      <input
        hidden
        multiple
        accept="image/*"
        ref={inputRef}
        type="file"
        onChange={(e) => {
          const files = [...(e.currentTarget.files ?? [])];
          e.currentTarget.value = '';
          if (files.length > 0 && pickAtRef.current) context.onFiles?.(files, pickAtRef.current);
        }}
      />
    </div>
  );
};
