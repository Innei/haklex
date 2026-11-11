import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { FRAME_NAME_HEIGHT } from '../model/bounds';
import { bumpVersion } from '../model/mutate';
import type { ExcalidrawElement } from '../scene/types';
import type { WhiteboardStore } from './store';
import { useStore } from './store';
import * as css from './text-editor.css';
import { sceneToScreen } from './viewport';
import { CHROME_ATTR } from './WhiteboardCanvas';

type FrameLike = ExcalidrawElement & { name?: string | null };

const Editor: FC<{ frame: FrameLike; store: WhiteboardStore }> = ({ frame, store }) => {
  const [value, setValue] = useState(frame.name ?? '');
  const ref = useRef<HTMLInputElement>(null);
  const viewport = useStore(store, (s) => s.viewport);
  const [left, top] = sceneToScreen([frame.x, frame.y - FRAME_NAME_HEIGHT], viewport);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  const closedRef = useRef(false);
  const close = (save: boolean) => {
    if (closedRef.current) return;
    closedRef.current = true;
    store.setState({ editingFrameId: null });
    if (!save) return;
    const name = value.trim() || null;
    if (name === (frame.name ?? null)) return;
    store.commit(({ elements }) => ({
      elements: elements.map((el) =>
        el.id === frame.id ? bumpVersion(el as FrameLike, { name }) : el,
      ),
    }));
  };

  return (
    <input
      data-frame-name-editor
      className={css.frameNameEditor}
      ref={ref}
      value={value}
      {...{ [CHROME_ATTR]: '' }}
      style={{ left, top, height: FRAME_NAME_HEIGHT * viewport.zoom }}
      onBlur={() => close(true)}
      onChange={(e) => setValue(e.currentTarget.value)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter') close(true);
        if (e.key === 'Escape') close(false);
      }}
    />
  );
};

export const FrameNameEditor: FC<{ store: WhiteboardStore }> = ({ store }) => {
  const frame = useStore(store, (s) =>
    s.editingFrameId ? s.elements.find((el) => el.id === s.editingFrameId) : undefined,
  );
  if (!frame || frame.isDeleted) return null;
  return <Editor frame={frame as FrameLike} key={frame.id} store={store} />;
};
