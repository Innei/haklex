import { newTextElement } from '../model/create';
import type { Point } from '../model/geometry';
import { getLineHeight } from '../model/measure';
import { bumpVersion } from '../model/mutate';
import { layoutBoundText, refreshTextDimensions } from '../model/text-layout';
import type { ExcalidrawElement, TextElement } from '../scene/types';
import type { WhiteboardStore } from './store';

const TEXT_CONTAINERS = new Set(['rectangle', 'ellipse', 'diamond', 'arrow']);
const created = new WeakMap<WhiteboardStore, string>();

export function canHoldText(el: ExcalidrawElement): boolean {
  return TEXT_CONTAINERS.has(el.type);
}

export function getBoundTextId(el: ExcalidrawElement): string | null {
  return el.boundElements?.find((b) => b.type === 'text')?.id ?? null;
}

function find(store: WhiteboardStore, id: string): ExcalidrawElement | undefined {
  return store.getState().elements.find((el) => el.id === id);
}

function replace(store: WhiteboardStore, next: readonly ExcalidrawElement[]) {
  const byId = new Map(next.map((el) => [el.id, el]));
  store.updateTransient(({ elements }) => ({
    elements: elements.map((el) => byId.get(el.id) ?? el),
  }));
}

export interface StartTextOptions {
  at?: Point;
  containerId?: string;
  elementId?: string;
}

export function startTextEditing(store: WhiteboardStore, opts: StartTextOptions): void {
  const state = store.getState();
  store.beginTransient();
  created.delete(store);

  if (opts.containerId) {
    const container = find(store, opts.containerId);
    if (!container) return;
    const existing = getBoundTextId(container);
    if (existing && find(store, existing)) {
      store.setState({ editingTextId: existing, selectedIds: new Set([container.id]) });
      return;
    }
    const text = newTextElement(
      { text: '', containerId: container.id, textAlign: 'center', verticalAlign: 'middle' },
      state.currentStyle,
    );
    const laid = layoutBoundText(container, text);
    const nextContainer = bumpVersion(laid.container, {
      boundElements: [...(container.boundElements ?? []), { id: text.id, type: 'text' }],
    });
    store.updateTransient(({ elements }) => ({
      elements: [...elements.map((el) => (el.id === container.id ? nextContainer : el)), laid.text],
    }));
    created.set(store, text.id);
    store.setState({ editingTextId: text.id, selectedIds: new Set([container.id]) });
    return;
  }

  if (opts.elementId) {
    store.setState({ editingTextId: opts.elementId, selectedIds: new Set([opts.elementId]) });
    return;
  }

  const at = opts.at ?? [0, 0];
  const style = state.currentStyle;
  const lineHeightPx = style.fontSize * getLineHeight(style.fontFamily);
  const text = newTextElement(
    { text: '', x: at[0], y: at[1] - lineHeightPx / 2, height: lineHeightPx },
    style,
  );
  store.updateTransient(({ elements }) => ({ elements: [...elements, text] }));
  created.set(store, text.id);
  store.setState({ editingTextId: text.id, selectedIds: new Set([text.id]) });
}

export function updateEditingText(store: WhiteboardStore, value: string): void {
  const id = store.getState().editingTextId;
  const el = id ? (find(store, id) as TextElement | undefined) : undefined;
  if (!el) return;
  const draft = { ...el, text: value, originalText: value };
  const container = el.containerId ? find(store, el.containerId) : undefined;
  if (container) {
    const laid = layoutBoundText(container, draft);
    replace(store, [laid.text, laid.container]);
    return;
  }
  replace(store, [refreshTextDimensions(draft)]);
}

export function finishTextEditing(store: WhiteboardStore): void {
  const id = store.getState().editingTextId;
  if (!id) return;
  const el = find(store, id) as TextElement | undefined;
  const isNew = created.get(store) === id;
  created.delete(store);
  store.setState({ editingTextId: null });
  if (!el) {
    store.endTransient(false);
    return;
  }
  const empty = !(el.originalText ?? el.text).trim();
  if (empty && isNew) {
    store.endTransient(false);
    return;
  }
  if (empty) {
    const container = el.containerId ? find(store, el.containerId) : undefined;
    const updates: ExcalidrawElement[] = [bumpVersion(el, { isDeleted: true })];
    if (container) {
      updates.push(
        bumpVersion(container, {
          boundElements: (container.boundElements ?? []).filter((b) => b.id !== el.id),
        }),
      );
    }
    replace(store, updates);
    store.setState({ selectedIds: new Set() });
  } else if (!isNew) {
    replace(store, [bumpVersion(el)]);
  }
  store.endTransient(true);
}

export function relayoutBoundTexts(
  elements: readonly ExcalidrawElement[],
  containerIds: ReadonlySet<string>,
): ExcalidrawElement[] {
  const byId = new Map(elements.map((el) => [el.id, el]));
  const updates = new Map<string, ExcalidrawElement>();
  for (const id of containerIds) {
    const container = byId.get(id);
    const textId = container ? getBoundTextId(container) : null;
    const text = textId ? (byId.get(textId) as TextElement | undefined) : undefined;
    if (!container || !text || text.isDeleted) continue;
    const laid = layoutBoundText(container, text);
    updates.set(text.id, bumpVersion(text, laid.text));
    if (laid.container !== container) updates.set(container.id, laid.container);
  }
  if (updates.size === 0) return [...elements];
  return elements.map((el) => updates.get(el.id) ?? el);
}
