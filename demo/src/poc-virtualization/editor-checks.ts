import type { EditorRecycler } from '../../../packages/rich-editor/src/virtualization/controller';
import { frame } from './probe';

export async function checkEditorLayout(controller: EditorRecycler) {
  for (let i = 0; i < 8; i++) await frame();
  const rows = new Map(controller.rows.map((row, index) => [row.id, index]));
  let checked = 0;
  for (const slot of controller.pool.slots) {
    if (!slot.active) continue;
    const island = controller.island(slot);
    const root = island.editor.getRootElement();
    if (!root) throw new Error('Active editor has no DOM root');
    const canvasTop = controller.canvas.getBoundingClientRect().top;
    for (const id of island.ids) {
      const element = slot.element?.querySelector(`[data-block-id="${CSS.escape(id)}"]`);
      if (!element) throw new Error(`Block ${id} has no DOM element`);
      const expected = canvasTop + controller.blockOffset(rows.get(id)!);
      const actual = element.getBoundingClientRect().top;
      if (Math.abs(expected - actual) > 1)
        throw new Error(`Block ${id} overlaps its layout: expected=${expected}, actual=${actual}`);
    }
    checked++;
  }
  if (!checked) throw new Error('No active editor was checked');
  return { checked, blocks: controller.rows.length, slots: controller.pool.slots.length };
}
