import { newRichTextElement } from '../model/create';
import type { Point } from '../model/geometry';
import { resolveRichTextHeights } from '../model/richtext-layout';
import { startRichTextEditing } from './richtext-actions';
import type { WhiteboardStore } from './store';
import type { ToolType } from './types';

export const CARD_WIDTH = 200;
export const CARD_HEIGHT = 120;

export function placeCard(store: WhiteboardStore, at: Point): string {
  const [card] = resolveRichTextHeights([
    newRichTextElement({
      x: at[0] - CARD_WIDTH / 2,
      y: at[1] - CARD_HEIGHT / 2,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    }),
  ]);
  store.commit(({ elements }) => ({ elements: [...elements, card] }));
  store.setState({ tool: 'selection' });
  startRichTextEditing(store, card.id);
  return card.id;
}

export function setTool(store: WhiteboardStore, tool: ToolType): void {
  store.setState({
    tool,
    selectedIds: tool === 'selection' ? store.getState().selectedIds : new Set(),
  });
}
