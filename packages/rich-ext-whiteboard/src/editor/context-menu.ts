import type { Point } from '../model/geometry';
import type { ExcalidrawElement } from '../scene/types';
import {
  bringForward,
  bringToFront,
  deleteSelection,
  duplicateSelection,
  groupSelection,
  selectAll,
  sendBackward,
  sendToBack,
  ungroupSelection,
} from './actions';
import { copySelection, cutSelection, pasteFromClipboard } from './clipboard-actions';
import { getSelectedElements, getSelectionTarget } from './selection-utils';
import type { WhiteboardStore } from './store';
import { HIT_TOLERANCE } from './tools/types';

export interface ContextMenuAction {
  danger?: boolean;
  disabled?: boolean;
  key: string;
  label: string;
  onSelect: () => void;
}

export interface ContextMenuSeparator {
  type: 'separator';
}

export type ContextMenuItem = ContextMenuAction | ContextMenuSeparator;

export interface ContextMenuContext {
  scenePoint: Point;
  selected: ExcalidrawElement[];
}

export type ContextMenuItemsFn = (context: ContextMenuContext) => ContextMenuItem[];

export const isSeparator = (item: ContextMenuItem): item is ContextMenuSeparator =>
  'type' in item && item.type === 'separator';

const SEPARATOR: ContextMenuSeparator = { type: 'separator' };

let lastCopied = '';

function writeClipboard(text: string): void {
  lastCopied = text;
  if (typeof navigator === 'undefined' || !navigator.clipboard) return;
  void navigator.clipboard.writeText(text).catch(() => {});
}

async function readClipboard(): Promise<string> {
  try {
    return (await navigator.clipboard.readText()) || lastCopied;
  } catch {
    return lastCopied;
  }
}

function retarget(store: WhiteboardStore, scenePoint: Point): void {
  const state = store.getState();
  const target = getSelectionTarget(state, scenePoint, HIT_TOLERANCE / state.viewport.zoom);
  if (!target) {
    if (state.selectedIds.size > 0) store.setState({ selectedIds: new Set() });
    return;
  }
  if (target.ids.every((id) => state.selectedIds.has(id))) return;
  store.setState({ selectedIds: new Set(target.ids) });
}

function elementItems(store: WhiteboardStore, selected: ExcalidrawElement[]): ContextMenuItem[] {
  const run = (key: string, label: string, action: (store: WhiteboardStore) => void) => ({
    key,
    label,
    onSelect: () => action(store),
  });
  const grouping: ContextMenuItem[] = [];
  if (selected.length > 1) grouping.push(run('group', 'Group', groupSelection));
  if (selected.some((el) => (el.groupIds?.length ?? 0) > 0))
    grouping.push(run('ungroup', 'Ungroup', ungroupSelection));
  return [
    run('copy', 'Copy', (s) => writeClipboard(copySelection(s))),
    run('cut', 'Cut', (s) => writeClipboard(cutSelection(s))),
    run('duplicate', 'Duplicate', duplicateSelection),
    SEPARATOR,
    run('bring-forward', 'Bring forward', bringForward),
    run('send-backward', 'Send backward', sendBackward),
    run('bring-to-front', 'Bring to front', bringToFront),
    run('send-to-back', 'Send to back', sendToBack),
    ...(grouping.length > 0 ? [SEPARATOR, ...grouping] : []),
    SEPARATOR,
    { ...run('delete', 'Delete', deleteSelection), danger: true },
  ];
}

function blankItems(store: WhiteboardStore, scenePoint: Point): ContextMenuItem[] {
  return [
    {
      key: 'paste',
      label: 'Paste',
      onSelect: () => {
        void readClipboard().then((text) => {
          if (text) pasteFromClipboard(store, text, scenePoint);
        });
      },
    },
    { key: 'select-all', label: 'Select all', onSelect: () => selectAll(store) },
  ];
}

export function contextMenuItems(
  store: WhiteboardStore,
  scenePoint: Point,
  hostItems?: ContextMenuItemsFn,
): ContextMenuItem[] {
  retarget(store, scenePoint);
  const selected = getSelectedElements(store.getState());
  const builtin =
    selected.length > 0 ? elementItems(store, selected) : blankItems(store, scenePoint);
  const extra = hostItems?.({ scenePoint, selected }) ?? [];
  return extra.length > 0 ? [...builtin, SEPARATOR, ...extra] : builtin;
}
