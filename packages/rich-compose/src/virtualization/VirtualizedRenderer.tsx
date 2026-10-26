import {
  EditorBlockContext,
  recyclerCanvas,
  recyclerContent,
  recyclerSlot,
  type Slot,
} from '@haklex/rich-editor/recycler';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { RendererSurfaceProps } from '../static-renderer/surface';
import { RendererRecycler } from './controller';
import { InitialRows, type RendererVirtualizationOptions } from './plugin';

function RendererSlot({ controller, slot }: { controller: RendererRecycler; slot: Slot }) {
  const row = controller.rows[slot.index];
  const [host] = useState(() => {
    const host = document.createElement('div');
    host.style.display = 'contents';
    return host;
  });
  const mounted = slot.active || controller.preserve.has(slot.id);
  const binding = `${slot.generation}:${slot.active}`;
  const [settled, setSettled] = useState('');
  const content = useMemo(
    () => controller.document.render(slot.index, slot.id),
    [controller, slot.generation, slot.id],
  );
  const context = useMemo(
    () => ({
      active: slot.active,
      blockId: row.id,
      editor: controller.document.editor,
      nodeState: (key?: string) => controller.nodeState(row.id, key),
      retain: () => {
        controller.retained.set(slot.id, (controller.retained.get(slot.id) ?? 0) + 1);
        let released = false;
        return () => {
          if (released) return;
          released = true;
          const count = (controller.retained.get(slot.id) ?? 1) - 1;
          if (count) controller.retained.set(slot.id, count);
          else controller.retained.delete(slot.id);
          controller.refresh(false);
        };
      },
    }),
    [controller, row.id, slot.active, slot.generation, slot.id],
  );
  const ref = useCallback(
    (element: HTMLDivElement | null) => controller.attach(slot, element),
    [controller, slot],
  );
  useLayoutEffect(() => {
    controller.mount(slot, host);
    if (mounted) controller.bind(slot);
    else slot.committed = -1;
    slot.beforeRelease = () => controller.capturePanels(slot);
  });
  useLayoutEffect(() => () => host.remove(), [host]);
  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setSettled(binding));
    });
    return () => cancelAnimationFrame(frame);
  }, [binding]);
  return createPortal(
    <div
      className={recyclerSlot}
      data-pool={row.pool}
      data-restoring={binding !== settled ? '' : undefined}
      data-virtual-renderer-block={slot.active ? row.id : undefined}
      data-virtual-renderer-slot={slot.id}
      ref={ref}
      style={{
        display: slot.active ? undefined : 'none',
        transform: `translateY(${controller.slotOffset(slot)}px)`,
      }}
    >
      <div className={recyclerContent} data-virtual-renderer-content="">
        <EditorBlockContext value={context}>{mounted && content}</EditorBlockContext>
      </div>
    </div>,
    host,
    String(slot.id),
  );
}

function Contents({ controller }: { controller: RendererRecycler }) {
  const [, update] = useState(0);
  useLayoutEffect(() => controller.subscribe(() => update((value) => value + 1)), [controller]);
  useLayoutEffect(() => controller.commitLayout());
  return (
    <>
      {controller.pool.slots.map((slot) => (
        <RendererSlot controller={controller} key={slot.id} slot={slot} />
      ))}
    </>
  );
}

export function VirtualizedRenderer({
  document: model,
  options,
}: RendererSurfaceProps & { options: RendererVirtualizationOptions }) {
  const canvas = useRef<HTMLDivElement>(null);
  const [controller, setController] = useState<RendererRecycler | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const element = canvas.current!;
    let instance: RendererRecycler;
    try {
      instance = new RendererRecycler(model, element, options);
      setError('');
      setController(instance);
      Object.assign(element, { virtualRenderer: instance });
    } catch (reason) {
      setError(String(reason));
      setController(null);
      return;
    }
    return () => {
      instance.dispose();
      Reflect.deleteProperty(element, 'virtualRenderer');
    };
  }, [model, options]);
  return (
    <>
      {error && <p role="alert">{error}</p>}
      <div className={recyclerCanvas} data-virtual-renderer="" ref={canvas}>
        {controller ? <Contents controller={controller} /> : <InitialRows document={model} />}
      </div>
    </>
  );
}
