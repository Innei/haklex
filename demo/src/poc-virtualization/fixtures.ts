import type { SerializedEditorState } from 'lexical';

import { image, paragraph, text } from '../fixtures/helpers';
import landscape from './assets/landscape.jpg';
import portrait from './assets/portrait.jpg';
import { complexNode } from './complex';
import type { Scenario } from './probe';

const prose = [
  '从车窗望出去，远处的山脊被云雾遮住，站台上的旅客仍在等候下一班车。长文中的每一段都可能有不同的长度，滚动时应保持眼前文字的位置。',
  'A paragraph can wrap differently after the reading column becomes narrower. Measured geometry is valid only for the content, font and width that produced it. ',
  '短段落，也需要准确占位。',
];
export function fixture(
  scenario: Scenario,
  count: number,
  revised: boolean,
): SerializedEditorState {
  const children = Array.from({ length: count }, (_, i) => {
    const node =
      scenario === 'complex'
        ? complexNode(i)
        : scenario !== 'text' && i % 5 === 2
          ? image({
              src: (revised && i === 2) || i % 3 === 0 ? portrait : landscape,
              altText: `${scenario === 'late' ? 'delayed' : 'photo'}-${i}`,
              caption: `第 ${i + 1} 块 · ${i % 3 === 0 ? '竖图' : '横图'}与文字混排`,
              ...(scenario === 'late'
                ? {}
                : {
                    width: (revised && i === 2) || i % 3 === 0 ? 700 : 1200,
                    height: (revised && i === 2) || i % 3 === 0 ? 1100 : 700,
                  }),
            })
          : paragraph(
              text(`第 ${i + 1} 块。${prose[i % prose.length].repeat(1 + ((i * 17) % 13))}`),
            );
    return { ...node, $: { blockId: `block-${i}` } };
  });
  return {
    root: { type: 'root', version: 1, direction: null, format: '', indent: 0, children },
  } as SerializedEditorState;
}
