export interface VerticalSpan {
  bottom: number;
  top: number;
}

export interface Gap {
  index: number;
  y: number;
}

const EDGE_ZONE = 12;

export function findGap(blocks: VerticalSpan[], y: number): Gap | null {
  if (blocks.length === 0) return null;
  const first = blocks[0];
  const last = blocks.at(-1)!;
  if (y < first.top) {
    return y >= first.top - EDGE_ZONE ? { index: 0, y: first.top - EDGE_ZONE / 2 } : null;
  }
  if (y > last.bottom) {
    return y <= last.bottom + EDGE_ZONE
      ? { index: blocks.length, y: last.bottom + EDGE_ZONE / 2 }
      : null;
  }
  for (let i = 1; i < blocks.length; i++) {
    const prev = blocks[i - 1];
    const next = blocks[i];
    if (y > prev.bottom && y < next.top) return { index: i, y: (prev.bottom + next.top) / 2 };
  }
  return null;
}

export function handleTop(
  block: { lineHeight: number; paddingTop: number; top: number },
  handleHeight: number,
): number {
  return block.top + block.paddingTop + (block.lineHeight - handleHeight) / 2;
}

export function parseLineHeight(lineHeight: string, fontSize: string): number {
  const px = Number.parseFloat(lineHeight);
  if (lineHeight.endsWith('px') && Number.isFinite(px)) return px;
  return Number.parseFloat(fontSize) * 1.2;
}
