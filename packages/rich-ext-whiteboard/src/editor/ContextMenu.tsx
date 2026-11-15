import type { FC, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { Point } from '../model/geometry';
import * as css from './chrome.css';
import type { ContextMenuItem, ContextMenuItemsFn } from './context-menu';
import { contextMenuItems, isSeparator } from './context-menu';
import type { WhiteboardStore } from './store';
import type { PointerInfo } from './tools/types';
import { CHROME_ATTR } from './WhiteboardCanvas';

const EDGE_GAP = 8;

interface ContextMenuProps {
  at: Point;
  items: readonly ContextMenuItem[];
  onClose: () => void;
}

const ContextMenu: FC<ContextMenuProps> = ({ at, items, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(at);

  useLayoutEffect(() => {
    const node = ref.current;
    const parent = node?.offsetParent;
    if (!node || !parent) return;
    const bounds = parent.getBoundingClientRect();
    const size = node.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    setPosition([
      Math.max(EDGE_GAP, Math.min(at[0], bounds.width - size.width - EDGE_GAP)),
      Math.max(EDGE_GAP, Math.min(at[1], bounds.height - size.height - EDGE_GAP)),
    ]);
  }, [at]);

  useEffect(() => {
    const node = ref.current;
    node?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus();
    const onPress = (e: Event) => {
      if (e.target instanceof Node && node?.contains(e.target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      e.preventDefault();
      onClose();
    };
    document.addEventListener('pointerdown', onPress, true);
    document.addEventListener('wheel', onPress, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('blur', onClose);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('pointerdown', onPress, true);
      document.removeEventListener('wheel', onPress, true);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('blur', onClose);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const entries = [
      ...e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'),
    ];
    if (entries.length === 0) return;
    const current = entries.indexOf(document.activeElement as HTMLElement);
    const step = e.key === 'ArrowDown' ? 1 : -1;
    entries[(current + step + entries.length) % entries.length].focus();
  };

  return (
    <div
      className={`${css.floating} ${css.contextMenu}`}
      ref={ref}
      role="menu"
      style={{ left: position[0], top: position[1] }}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={onKeyDown}
      {...{ [CHROME_ATTR]: '' }}
    >
      {items.map((item, i) =>
        isSeparator(item) ? (
          <div className={css.contextMenuSeparator} key={`separator-${i}`} role="separator" />
        ) : (
          <button
            className={css.contextMenuItem}
            data-danger={item.danger || undefined}
            disabled={item.disabled}
            key={item.key}
            role="menuitem"
            type="button"
            onClick={() => {
              onClose();
              item.onSelect();
            }}
          >
            {item.label}
          </button>
        ),
      )}
    </div>
  );
};

interface OpenMenu {
  at: Point;
  items: ContextMenuItem[];
}

export function useContextMenu(
  store: WhiteboardStore,
  hostItems: ContextMenuItemsFn | undefined,
): { menu: ReactNode; open: (info: PointerInfo) => boolean } {
  const [state, setState] = useState<OpenMenu | null>(null);
  const hostItemsRef = useRef(hostItems);
  hostItemsRef.current = hostItems;

  const open = useCallback(
    (info: PointerInfo) => {
      const { editingRichTextId, editingTextId } = store.getState();
      if (editingTextId || editingRichTextId) return false;
      setState({
        at: info.screen,
        items: contextMenuItems(store, info.scene, hostItemsRef.current),
      });
      return true;
    },
    [store],
  );
  const close = useCallback(() => setState(null), []);

  return {
    open,
    menu: state ? <ContextMenu at={state.at} items={state.items} onClose={close} /> : null,
  };
}
