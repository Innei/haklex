import type { ElementStyle } from '../model/defaults';
import { updateElbowArrow } from '../model/elbow';
import { bumpVersion } from '../model/mutate';
import { refreshTextDimensions } from '../model/text-layout';
import type { ExcalidrawElement, LinearElement, TextElement } from '../scene/types';
import { withBoundText } from './selection-utils';
import type { WhiteboardStore } from './store';
import { relayoutBoundTexts } from './text-actions';

export type StyleProp =
  | 'stroke'
  | 'background'
  | 'fillStyle'
  | 'strokeWidth'
  | 'strokeStyle'
  | 'roughness'
  | 'roundness'
  | 'shadow'
  | 'opacity'
  | 'fontSize'
  | 'fontFamily'
  | 'textAlign'
  | 'arrowheads'
  | 'arrowType'
  | 'layers'
  | 'actions';

const SHAPE: StyleProp[] = [
  'stroke',
  'background',
  'fillStyle',
  'strokeWidth',
  'strokeStyle',
  'roughness',
];
const TEXT: StyleProp[] = ['stroke', 'fontSize', 'fontFamily', 'textAlign'];
const ALWAYS: StyleProp[] = ['opacity', 'layers', 'actions'];

function propsFor(el: ExcalidrawElement): StyleProp[] {
  const hasText = el.boundElements?.some((b) => b.type === 'text') ? TEXT : [];
  switch (el.type) {
    case 'rectangle':
    case 'diamond': {
      return [...SHAPE, 'roundness', 'shadow', ...hasText];
    }
    case 'ellipse': {
      return [...SHAPE, 'shadow', ...hasText];
    }
    case 'arrow': {
      return [
        'stroke',
        'strokeWidth',
        'strokeStyle',
        'roughness',
        'arrowheads',
        'arrowType',
        ...hasText,
      ];
    }
    case 'line': {
      return [
        'stroke',
        'background',
        'fillStyle',
        'strokeWidth',
        'strokeStyle',
        'roughness',
        'roundness',
      ];
    }
    case 'freedraw': {
      return ['stroke', 'strokeWidth'];
    }
    case 'text': {
      return TEXT;
    }
    case 'image': {
      return ['shadow'];
    }
    default: {
      return [];
    }
  }
}

export function getApplicableProps(elements: readonly ExcalidrawElement[]): Set<StyleProp> {
  if (elements.length === 0) return new Set();
  let common = new Set(propsFor(elements[0]));
  for (const el of elements.slice(1)) {
    const next = new Set(propsFor(el));
    common = new Set([...common].filter((p) => next.has(p)));
  }
  for (const p of ALWAYS) common.add(p);
  return common;
}

type ValueKey = keyof ElementStyle | 'strokeColor';

function readValue(el: ExcalidrawElement, key: ValueKey): unknown {
  if (key === 'roundness') return el.roundness ? 'round' : 'sharp';
  if (key === 'shadow') return el.shadow === true;
  if (key === 'arrowType') {
    const arrow = el as LinearElement;
    return arrow.elbowed ? 'elbow' : arrow.roundness ? 'round' : 'sharp';
  }
  return (el as unknown as Record<string, unknown>)[key];
}

export function getCommonValue(elements: readonly ExcalidrawElement[], key: ValueKey): unknown {
  if (elements.length === 0) return undefined;
  const first = readValue(elements[0], key);
  return elements.every((el) => readValue(el, key) === first) ? first : 'mixed';
}

const isText = (el: ExcalidrawElement): el is TextElement => el.type === 'text';
const isArrow = (el: ExcalidrawElement): el is LinearElement => el.type === 'arrow';

function patchElement(el: ExcalidrawElement, patch: Partial<ElementStyle>): ExcalidrawElement {
  const out: Record<string, unknown> = {};
  const props = new Set([...propsFor(el), ...(isText(el) ? TEXT : [])]);
  if (patch.strokeColor !== undefined && props.has('stroke')) out.strokeColor = patch.strokeColor;
  if (patch.backgroundColor !== undefined && props.has('background'))
    out.backgroundColor = patch.backgroundColor;
  if (patch.fillStyle !== undefined && props.has('fillStyle')) out.fillStyle = patch.fillStyle;
  if (patch.strokeWidth !== undefined && props.has('strokeWidth'))
    out.strokeWidth = patch.strokeWidth;
  if (patch.strokeStyle !== undefined && props.has('strokeStyle'))
    out.strokeStyle = patch.strokeStyle;
  if (patch.roughness !== undefined && props.has('roughness')) out.roughness = patch.roughness;
  if (patch.opacity !== undefined) out.opacity = patch.opacity;
  if (patch.shadow !== undefined && props.has('shadow')) out.shadow = patch.shadow;
  if (patch.roundness !== undefined && props.has('roundness')) {
    const round = el.type === 'line' ? { type: 2 } : { type: 3 };
    out.roundness = patch.roundness === 'round' ? round : null;
  }
  if (isText(el)) {
    if (patch.fontSize !== undefined) out.fontSize = patch.fontSize;
    if (patch.fontFamily !== undefined) out.fontFamily = patch.fontFamily;
    if (patch.textAlign !== undefined && !el.containerId) out.textAlign = patch.textAlign;
  }
  if (isArrow(el)) {
    if (patch.startArrowhead !== undefined) out.startArrowhead = patch.startArrowhead;
    if (patch.endArrowhead !== undefined) out.endArrowhead = patch.endArrowhead;
    if (patch.arrowType !== undefined) {
      out.elbowed = patch.arrowType === 'elbow';
      out.roundness = patch.arrowType === 'round' ? { type: 2 } : null;
      if (!out.elbowed && el.fixedSegments) out.fixedSegments = null;
    }
  }
  if (Object.keys(out).length === 0) return el;
  const next = bumpVersion(el, out as Partial<ExcalidrawElement>);
  return isText(next) && !next.containerId ? refreshTextDimensions(next) : next;
}

export function applyStyle(store: WhiteboardStore, patch: Partial<ElementStyle>): void {
  const state = store.getState();
  store.setState({ currentStyle: { ...state.currentStyle, ...patch } });
  if (state.selectedIds.size === 0) return;
  const ids = withBoundText(state.elements, state.selectedIds);
  store.commit(({ elements }) => {
    const patched = elements.map((el) => (ids.has(el.id) ? patchElement(el, patch) : el));
    const next = patched.map((el, i) =>
      el.type === 'arrow' &&
      (el as LinearElement).elbowed &&
      !(elements[i] as LinearElement).elbowed
        ? updateElbowArrow(el as LinearElement, patched)
        : el,
    );
    return { elements: relayoutBoundTexts(next, state.selectedIds) };
  });
}
