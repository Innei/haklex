import type {
  BaseElement,
  ElementType,
  FrameLikeElement,
  FreedrawElement,
  ImageElement,
  LinearElement,
  TextElement,
} from '../scene/types';
import type { ElementStyle } from './defaults';
import { DEFAULT_LINE_HEIGHT, DEFAULT_STYLE } from './defaults';
import { randomId, randomInteger } from './random';

type ShapeType = Exclude<ElementType, 'line' | 'arrow' | 'freedraw' | 'text' | 'image'>;

function roundnessFor(type: ElementType, style: ElementStyle): BaseElement['roundness'] {
  if (style.roundness === 'sharp') return null;
  if (type === 'line' || type === 'arrow') return { type: 2 };
  if (type === 'rectangle' || type === 'diamond' || type === 'embeddable' || type === 'iframe') {
    return { type: 3 };
  }
  return null;
}

function base<T extends ElementType>(
  type: T,
  partial: Partial<BaseElement>,
  style: ElementStyle,
): BaseElement & { type: T } {
  return {
    id: randomId(),
    type,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    angle: 0,
    strokeColor: style.strokeColor,
    backgroundColor: style.backgroundColor,
    fillStyle: style.fillStyle,
    strokeWidth: style.strokeWidth,
    strokeStyle: style.strokeStyle,
    roughness: style.roughness,
    opacity: style.opacity,
    groupIds: [],
    frameId: null,
    index: null,
    roundness: roundnessFor(type, style),
    seed: randomInteger(),
    version: 1,
    versionNonce: randomInteger(),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    ...partial,
  } as BaseElement & { type: T };
}

export function newElement<T extends ShapeType>(
  type: T,
  partial: Partial<BaseElement>,
  style: ElementStyle = DEFAULT_STYLE,
): BaseElement & { type: T } {
  return base(type, partial, style);
}

export function newLinearElement(
  type: 'line' | 'arrow',
  partial: Partial<LinearElement>,
  style: ElementStyle = DEFAULT_STYLE,
): LinearElement {
  const isArrow = type === 'arrow';
  const elbowed = isArrow && style.arrowType === 'elbow';
  const linearStyle =
    isArrow && style.arrowType !== 'round' ? { ...style, roundness: 'sharp' as const } : style;
  return {
    ...base(type, {}, linearStyle),
    points: [[0, 0]],
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: isArrow ? style.startArrowhead : null,
    endArrowhead: isArrow ? style.endArrowhead : null,
    ...(isArrow ? { elbowed } : null),
    ...partial,
  } as LinearElement;
}

export function newFreedrawElement(
  partial: Partial<FreedrawElement>,
  style: ElementStyle = DEFAULT_STYLE,
): FreedrawElement {
  return {
    ...base('freedraw', {}, style),
    points: [],
    pressures: [],
    simulatePressure: true,
    lastCommittedPoint: null,
    ...partial,
  } as FreedrawElement;
}

export function newTextElement(
  partial: Partial<TextElement> & { text: string },
  style: ElementStyle = DEFAULT_STYLE,
): TextElement {
  return {
    ...base('text', {}, { ...style, roundness: 'sharp' }),
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    textAlign: style.textAlign,
    verticalAlign: 'top',
    containerId: null,
    originalText: partial.text,
    autoResize: true,
    lineHeight: DEFAULT_LINE_HEIGHT,
    ...partial,
  } as TextElement;
}

export function newImageElement(
  partial: Partial<ImageElement>,
  style: ElementStyle = DEFAULT_STYLE,
): ImageElement {
  return {
    ...base('image', {}, { ...style, roundness: 'sharp' }),
    fileId: undefined,
    status: 'pending',
    scale: [1, 1],
    crop: null,
    ...partial,
  } as ImageElement;
}

export function newFrameElement(
  partial: Partial<FrameLikeElement>,
  style: ElementStyle = DEFAULT_STYLE,
): FrameLikeElement {
  return {
    ...base('frame', {}, { ...style, roundness: 'sharp', backgroundColor: 'transparent' }),
    name: null,
    ...partial,
  } as FrameLikeElement;
}
