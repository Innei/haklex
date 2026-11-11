import { getCommonBounds } from '../model/bounds';
import { parseClipboard, serializeClipboard } from '../model/clipboard';
import { cloneElements } from '../model/clone';
import { newSvgElement, newTextElement } from '../model/create';
import { refreshFrames } from '../model/frames';
import type { Point } from '../model/geometry';
import { getLineHeight } from '../model/measure';
import { isSvgSource, parseSvgSize } from '../model/svg';
import { refreshTextDimensions } from '../model/text-layout';
import { deleteSelection } from './actions';
import { MAX_IMAGE_SIDE } from './image-actions';
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

const SVG_FALLBACK_SIDE = 200;

function pasteSvg(store: WhiteboardStore, raw: string, at: Point): void {
  const svg = raw.trim();
  const size = parseSvgSize(svg) ?? { width: SVG_FALLBACK_SIDE, height: SVG_FALLBACK_SIDE };
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(size.width, size.height));
  const width = size.width * scale;
  const height = size.height * scale;
  const el = newSvgElement(
    { svg, width, height, x: at[0] - width / 2, y: at[1] - height / 2 },
    store.getState().currentStyle,
  );
  store.commit(({ elements }) => ({
    elements: refreshFrames([...elements, el], new Set([el.id])),
  }));
  store.setState({ selectedIds: new Set([el.id]), editingGroupId: null });
}

export function pasteFromClipboard(store: WhiteboardStore, raw: string, at: Point): boolean {
  if (isSvgSource(raw)) {
    pasteSvg(store, raw, at);
    return true;
  }
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
