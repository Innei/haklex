import type { SerializedBlock } from '@haklex/rich-editor/recycler';

export function groupRendererBlocks(blocks: SerializedBlock[], noteLead = false) {
  const groups: number[][] = [];
  const lead = noteLead ? blocks.findIndex((block) => block.type === 'paragraph') : -1;
  const floating = (block: SerializedBlock) =>
    block.type === 'image' && typeof block.layout === 'string' && block.layout.startsWith('float-');
  for (let index = 0; index < blocks.length; index++) {
    const group = [index];
    if (index === lead && index + 1 < blocks.length) group.push(++index);
    if (floating(blocks[index])) {
      // Floats share a BFC with their text and the first clearing block.
      while (++index < blocks.length) {
        group.push(index);
        const block = blocks[index];
        if (
          !floating(block) &&
          !['paragraph', 'list', 'quote', 'rich-quote', 'comment'].includes(block.type)
        )
          break;
      }
    }
    groups.push(group);
  }
  const merged: number[][] = [];
  for (const group of groups) {
    if (merged.length && group.every((index) => blocks[index].type === 'comment'))
      merged.at(-1)!.push(...group);
    else if (merged.at(-1)?.every((index) => blocks[index].type === 'comment'))
      merged.at(-1)!.push(...group);
    else merged.push(group);
  }
  return merged;
}
