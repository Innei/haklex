import { getCommonBounds } from '../model/bounds';
import { parseClipboard, serializeClipboard } from '../model/clipboard';
import { cloneElements } from '../model/clone';
import { newTextElement } from '../model/create';
import { refreshFrames } from '../model/frames';
import type { Point } from '../model/geometry';
import { getLineHeight } from '../model/measure';
import { refreshTextDimensions } from '../model/text-layout';
import { deleteSelection } from './actions';
import { withBoundText } from './selection-utils';
import type { WhiteboardStore } from './store';

export function copySelection(store: WhiteboardStore): string {
  const state = store.getState();
  const ids = withBoundText(state.elements, state.selectedIds);
  const elements = state.elements.filter((el) => ids.has(el.id) && !el.isDeleted);
  return serializeClipboard(elements, state.files);
}

export function cutSelection(store: WhiteboardStore): string {
  const data = copySelection(store);
  deleteSelection(store);
  return data;
}

export function pasteFromClipboard(store: WhiteboardStore, raw: string, at: Point): boolean {
  const content = parseClipboard(raw);
  if (!content) return false;
  const style = store.getState().currentStyle;

  if ('text' in content) {
    const lineHeight = style.fontSize * getLineHeight(style.fontFamily);
    const text = refreshTextDimensions(
      newTextElement({ text: content.text, x: at[0], y: at[1] - lineHeight / 2 }, style),
    );
    store.commit(({ elements }) => ({ elements: [...elements, text] }));
    store.setState({ selectedIds: new Set([text.id]) });
    return true;
  }

  if (content.elements.length === 0) return false;
  const [minX, minY, maxX, maxY] = getCommonBounds(content.elements);
  const offset: Point = [at[0] - (minX + maxX) / 2, at[1] - (minY + maxY) / 2];
  const { clones } = cloneElements(content.elements, offset);
  store.commit(({ elements, files }) => ({
    elements: refreshFrames([...elements, ...clones], new Set(clones.map((el) => el.id))),
    files: { ...files, ...content.files },
  }));
  store.setState({
    selectedIds: new Set(
      clones.filter((el) => !(el.type === 'text' && el.containerId)).map((el) => el.id),
    ),
    editingGroupId: null,
  });
  return true;
}
