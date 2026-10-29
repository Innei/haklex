import type { AppState } from '@excalidraw/excalidraw/types';

const CANVAS_POPUP_SELECTOR =
  '.excalidraw-wysiwyg, .Modal, .popover, .dropdown-menu, .context-menu, [role="dialog"], [role="menu"], [role="listbox"]';

export function targetOwnsEscape(target: EventTarget | null): boolean {
  if (!(target instanceof Element) || !target.closest('.excalidraw')) return false;
  if (target.matches('textarea, input, select, [contenteditable="true"]')) return true;
  return !!target.closest(CANVAS_POPUP_SELECTOR)?.closest('.excalidraw');
}

export function appStateOwnsEscape(appState: Partial<AppState> | undefined): boolean {
  if (!appState) return false;
  return !!(
    appState.editingTextElement ||
    appState.editingLinearElement ||
    appState.newElement ||
    appState.multiElement ||
    appState.croppingElementId ||
    appState.contextMenu ||
    appState.openMenu ||
    appState.openPopup ||
    appState.openDialog ||
    appState.showHyperlinkPopup ||
    (appState.activeTool && appState.activeTool.type !== 'selection')
  );
}

export function sceneSignature(
  elements: readonly unknown[],
  appState?: Partial<Pick<AppState, 'viewBackgroundColor' | 'gridSize'>>,
): string {
  let versions = 0;
  for (const element of elements) versions += (element as { version?: number }).version ?? 0;
  return `${elements.length}:${versions}:${appState?.viewBackgroundColor}:${appState?.gridSize}`;
}
