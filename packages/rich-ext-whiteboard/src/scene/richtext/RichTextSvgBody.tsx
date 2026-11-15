import type { FC, ReactNode } from 'react';

import { fontSizeOf } from '../../model/measure';
import type { RichNode } from '../../model/richtext';
import {
  blockTypography,
  contentRoot,
  isBlockContainer,
  RICHTEXT_PADDING,
  RICHTEXT_TEXT_COLOR,
  richTextPlainText,
} from '../../model/richtext';
import { childIndent, hasBlockChildren, richTextFont } from '../../model/richtext-layout';
import { wrapText } from '../../model/text-layout';
import { SANS_FONT_STACK } from '../fonts';
import type { RichTextElement } from '../types';

const BASELINE_RATIO = 0.8;
const MARKER_GAP = 6;
const QUOTE_BAR = '#c4c4c4';

interface Cursor {
  nodes: ReactNode[];
  y: number;
}

function colorOf(node: RichNode): string {
  const styled = (node.children ?? []).find((child) => typeof child.style === 'string');
  const match = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(styled?.style ?? '');
  return match ? match[1].trim() : RICHTEXT_TEXT_COLOR;
}

function drawBlock(node: RichNode, x: number, width: number, cursor: Cursor, marker?: string) {
  const { fontSize, fontWeight, lineHeight } = blockTypography(node);
  const font = richTextFont(node);
  const indent = childIndent(node);
  const lines = wrapText(richTextPlainText(node), font, Math.max(1, width - indent)).split('\n');
  const step = fontSizeOf(font) * lineHeight;
  const top = cursor.y;
  const baseline = top + (step - fontSize) / 2 + fontSize * BASELINE_RATIO;
  const key = cursor.nodes.length;
  if (node.type === 'quote')
    cursor.nodes.push(
      <rect
        fill={QUOTE_BAR}
        height={lines.length * step}
        key={`q${key}`}
        width={3}
        x={x}
        y={top}
      />,
    );
  if (marker)
    cursor.nodes.push(
      <text
        fill={RICHTEXT_TEXT_COLOR}
        fontFamily={SANS_FONT_STACK}
        fontSize={fontSize}
        key={`m${key}`}
        textAnchor="end"
        x={x - MARKER_GAP}
        y={baseline}
      >
        {marker}
      </text>,
    );
  cursor.nodes.push(
    <text
      fill={colorOf(node)}
      fontFamily={SANS_FONT_STACK}
      fontSize={fontSize}
      fontWeight={fontWeight}
      key={`t${key}`}
      style={{ whiteSpace: 'pre' }}
      x={x + indent}
      y={baseline}
    >
      {lines.map((line, i) => (
        <tspan dy={i === 0 ? 0 : step} key={i} x={x + indent}>
          {line || ' '}
        </tspan>
      ))}
    </text>,
  );
  cursor.y += lines.length * step;
}

function drawStack(
  nodes: readonly RichNode[],
  x: number,
  width: number,
  cursor: Cursor,
  list?: RichNode,
) {
  nodes.forEach((node, i) => {
    if (isBlockContainer(node) && hasBlockChildren(node)) {
      const indent = childIndent(node);
      drawStack(
        node.children ?? [],
        x + indent,
        width - indent,
        cursor,
        node.type === 'list' ? node : undefined,
      );
      return;
    }
    const marker = list ? (list.listType === 'number' ? `${i + 1}.` : '•') : undefined;
    drawBlock(node, x, width, cursor, marker);
  });
}

export const RichTextSvgBody: FC<{ el: RichTextElement }> = ({ el }) => {
  const cursor: Cursor = { nodes: [], y: RICHTEXT_PADDING };
  const blocks = contentRoot(el.content).children ?? [];
  drawStack(blocks, RICHTEXT_PADDING, el.width - RICHTEXT_PADDING * 2, cursor);
  return <g data-richtext-body={el.id}>{cursor.nodes}</g>;
};
