import type { FC } from 'react';
import { useEffect, useRef } from 'react';

import { angleOf } from '../model/geometry';
import { getLineHeight } from '../model/measure';
import { fontFamilyToCss } from '../scene/fonts';
import { DARK_SCENE_FILTER } from '../scene/Scene';
import type { TextElement } from '../scene/types';
import type { WhiteboardStore } from './store';
import { useStore } from './store';
import { finishTextEditing, updateEditingText } from './text-actions';
import * as css from './text-editor.css';
import { sceneToScreen } from './viewport';

const MIN_WIDTH = 24;

export const TextEditor: FC<{ dark?: boolean; store: WhiteboardStore }> = ({
  dark = false,
  store,
}) => {
  const editingId = useStore(store, (s) => s.editingTextId);
  const el = useStore(store, (s) =>
    s.editingTextId
      ? (s.elements.find((e) => e.id === s.editingTextId) as TextElement | undefined)
      : undefined,
  );
  const viewport = useStore(store, (s) => s.viewport);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.focus({ preventScroll: true });
    node.setSelectionRange(node.value.length, node.value.length);
  }, [editingId]);

  if (!editingId || !el) return null;

  const [left, top] = sceneToScreen([el.x, el.y], viewport);
  const zoom = viewport.zoom;
  const lineHeight = el.lineHeight ?? getLineHeight(el.fontFamily);

  return (
    <textarea
      data-whiteboard-text-editor
      className={css.textEditor}
      ref={ref}
      spellCheck={false}
      value={el.originalText ?? el.text}
      wrap={el.containerId ? 'soft' : 'off'}
      style={{
        left,
        top,
        width: Math.max(MIN_WIDTH, el.width) * zoom,
        height: Math.max(el.height, el.fontSize * lineHeight) * zoom,
        fontSize: el.fontSize * zoom,
        lineHeight,
        fontFamily: fontFamilyToCss(el.fontFamily),
        color: el.strokeColor,
        textAlign: el.textAlign,
        opacity: el.opacity / 100,
        transform: angleOf(el) ? `rotate(${angleOf(el)}rad)` : undefined,
        filter: dark ? DARK_SCENE_FILTER : undefined,
      }}
      onBlur={() => finishTextEditing(store)}
      onChange={(e) => updateEditingText(store, e.target.value)}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
          e.preventDefault();
          finishTextEditing(store);
        }
      }}
    />
  );
};
