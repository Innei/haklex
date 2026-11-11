import type { ExcalidrawElement, TextElement } from '../scene/types';
import { getLinearAbsolutePoints, isLinear } from './bounds';
import type { Point } from './geometry';
import { angleOf, distance, rotatePoint } from './geometry';
import { getFontString, getLineHeight, isCJK, measureLine, measureText } from './measure';
import { bumpVersion } from './mutate';

export const BOUND_TEXT_PADDING = 5;
const ARROW_LABEL_MIN_WIDTH = 120;
const ARROW_LABEL_WIDTH_RATIO = 0.7;

function tokenize(paragraph: string): string[] {
  const tokens: string[] = [];
  let word = '';
  for (const ch of paragraph) {
    if (ch === ' ' || isCJK(ch)) {
      if (word) tokens.push(word);
      word = '';
      tokens.push(ch);
    } else {
      word += ch;
    }
  }
  if (word) tokens.push(word);
  return tokens;
}

function breakLongToken(token: string, font: string, maxWidth: number): string[] {
  const parts: string[] = [];
  let current = '';
  for (const ch of token) {
    if (current && measureLine(current + ch, font) > maxWidth) {
      parts.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function wrapParagraph(paragraph: string, font: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  const push = () => {
    lines.push(line.trimEnd());
    line = '';
  };
  for (const token of tokenize(paragraph)) {
    if (measureLine(line + token, font) <= maxWidth) {
      line += token;
      continue;
    }
    if (token === ' ') {
      push();
      continue;
    }
    if (line) push();
    if (measureLine(token, font) <= maxWidth) {
      line = token;
      continue;
    }
    const parts = breakLongToken(token, font, maxWidth);
    for (const part of parts.slice(0, -1)) lines.push(part);
    line = parts.at(-1) ?? '';
  }
  if (line || lines.length === 0) push();
  return lines;
}

export function wrapText(text: string, font: string, maxWidth: number): string {
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) return text;
  return text
    .split('\n')
    .flatMap((paragraph) => wrapParagraph(paragraph, font, maxWidth))
    .join('\n');
}

function polylineLength(points: readonly Point[]): number {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) total += distance(points[i], points[i + 1]);
  return total;
}

export function getLinearMidpoint(el: ExcalidrawElement): Point {
  if (!isLinear(el)) return [el.x + el.width / 2, el.y + el.height / 2];
  const points = getLinearAbsolutePoints(el);
  if (points.length === 1) return points[0];
  let remaining = polylineLength(points) / 2;
  for (let i = 0; i < points.length - 1; i++) {
    const segment = distance(points[i], points[i + 1]);
    if (remaining <= segment) {
      const t = segment === 0 ? 0 : remaining / segment;
      return [
        points[i][0] + (points[i + 1][0] - points[i][0]) * t,
        points[i][1] + (points[i + 1][1] - points[i][1]) * t,
      ];
    }
    remaining -= segment;
  }
  return points.at(-1)!;
}

export function getContainerTextMaxWidth(container: ExcalidrawElement): number {
  const pad = BOUND_TEXT_PADDING * 2;
  if (isLinear(container)) {
    const length = polylineLength(getLinearAbsolutePoints(container));
    return Math.max(ARROW_LABEL_MIN_WIDTH, length * ARROW_LABEL_WIDTH_RATIO);
  }
  if (container.type === 'ellipse') return Math.round((container.width / 2) * Math.SQRT2) - pad;
  if (container.type === 'diamond') return Math.round(container.width / 2) - pad;
  return container.width - pad;
}

export function getContainerTextMaxHeight(container: ExcalidrawElement): number {
  const pad = BOUND_TEXT_PADDING * 2;
  if (container.type === 'ellipse') return Math.round((container.height / 2) * Math.SQRT2) - pad;
  if (container.type === 'diamond') return Math.round(container.height / 2) - pad;
  return container.height - pad;
}

function containerHeightFor(container: ExcalidrawElement, textHeight: number): number {
  const pad = BOUND_TEXT_PADDING * 2;
  if (container.type === 'ellipse') return Math.ceil(((textHeight + pad) * 2) / Math.SQRT2);
  if (container.type === 'diamond') return Math.ceil((textHeight + pad) * 2);
  return textHeight + pad;
}

export function layoutBoundText<C extends ExcalidrawElement>(
  container: C,
  textEl: TextElement,
): { container: C; text: TextElement } {
  const font = getFontString(textEl);
  const lineHeight = textEl.lineHeight ?? getLineHeight(textEl.fontFamily);
  const source = textEl.originalText ?? textEl.text;
  const wrapped = wrapText(source, font, getContainerTextMaxWidth(container));
  const size = measureText(wrapped, font, lineHeight);

  let nextContainer = container;
  if (!isLinear(container) && size.height > getContainerTextMaxHeight(container)) {
    nextContainer = bumpVersion(container, {
      height: containerHeightFor(container, size.height),
    } as Partial<C>);
  }
  const linear = isLinear(nextContainer);
  const [cx, cy] = linear
    ? getLinearMidpoint(nextContainer)
    : [nextContainer.x + nextContainer.width / 2, nextContainer.y + nextContainer.height / 2];
  const textAlign = linear ? 'center' : (textEl.textAlign ?? 'center');
  const verticalAlign = linear ? 'middle' : (textEl.verticalAlign ?? 'middle');
  const halfW = linear ? size.width / 2 : getContainerTextMaxWidth(nextContainer) / 2;
  const halfH = linear ? size.height / 2 : getContainerTextMaxHeight(nextContainer) / 2;
  const x =
    textAlign === 'left'
      ? cx - halfW
      : textAlign === 'right'
        ? cx + halfW - size.width
        : cx - size.width / 2;
  const y =
    verticalAlign === 'top'
      ? cy - halfH
      : verticalAlign === 'bottom'
        ? cy + halfH - size.height
        : cy - size.height / 2;

  const angle = linear ? 0 : angleOf(nextContainer);
  const [tx, ty] = angle
    ? rotatePoint([x + size.width / 2, y + size.height / 2], [cx, cy], angle)
    : [x + size.width / 2, y + size.height / 2];

  const text: TextElement = {
    ...textEl,
    text: wrapped,
    originalText: source,
    width: size.width,
    height: size.height,
    x: tx - size.width / 2,
    y: ty - size.height / 2,
    angle,
    textAlign,
    verticalAlign,
    containerId: nextContainer.id,
  };
  return { container: nextContainer, text };
}

export function refreshTextDimensions(
  textEl: TextElement,
  container?: ExcalidrawElement,
): TextElement {
  if (container) return layoutBoundText(container, textEl).text;
  const font = getFontString(textEl);
  const lineHeight = textEl.lineHeight ?? getLineHeight(textEl.fontFamily);
  const source = textEl.originalText ?? textEl.text;
  const text = textEl.autoResize === false ? wrapText(source, font, textEl.width) : source;
  const size = measureText(text, font, lineHeight);
  return {
    ...textEl,
    text,
    width: textEl.autoResize === false ? textEl.width : size.width,
    height: size.height,
  };
}
