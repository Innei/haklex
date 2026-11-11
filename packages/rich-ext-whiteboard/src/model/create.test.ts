import { describe, expect, it } from 'vitest';

import {
  newElement,
  newFrameElement,
  newFreedrawElement,
  newImageElement,
  newLinearElement,
  newTextElement,
} from './create';
import { DEFAULT_STYLE } from './defaults';
import { bumpVersion } from './mutate';
import { randomId } from './random';

const BASE_FIELDS = [
  'id',
  'type',
  'x',
  'y',
  'width',
  'height',
  'angle',
  'strokeColor',
  'backgroundColor',
  'fillStyle',
  'strokeWidth',
  'strokeStyle',
  'roughness',
  'opacity',
  'groupIds',
  'frameId',
  'index',
  'roundness',
  'seed',
  'version',
  'versionNonce',
  'isDeleted',
  'boundElements',
  'updated',
  'link',
  'locked',
];

describe('randomId', () => {
  it('produces distinct 21-character url-safe ids', () => {
    const a = randomId();
    expect(a).toMatch(/^[\w-]{21}$/);
    expect(randomId()).not.toBe(a);
  });
});

describe('element factory', () => {
  it('writes every Excalidraw base field', () => {
    const el = newElement('rectangle', { x: 10, y: 20, width: 30, height: 40 });
    for (const key of BASE_FIELDS) expect(el).toHaveProperty(key);
    expect(el).toMatchObject({
      type: 'rectangle',
      x: 10,
      y: 20,
      version: 1,
      isDeleted: false,
      groupIds: [],
      frameId: null,
      boundElements: null,
      roundness: { type: 3 },
      strokeColor: DEFAULT_STYLE.strokeColor,
      roughness: 1,
      fillStyle: 'hachure',
    });
  });

  it('uses no roundness for ellipses and sharp style', () => {
    expect(newElement('ellipse', {}).roundness).toBeNull();
    expect(
      newElement('rectangle', {}, { ...DEFAULT_STYLE, roundness: 'sharp' }).roundness,
    ).toBeNull();
  });

  it('creates arrows with an end arrowhead and empty bindings', () => {
    const arrow = newLinearElement('arrow', {
      points: [
        [0, 0],
        [10, 0],
      ],
    });
    expect(arrow).toMatchObject({
      type: 'arrow',
      startArrowhead: null,
      endArrowhead: 'arrow',
      startBinding: null,
      endBinding: null,
      elbowed: false,
      roundness: { type: 2 },
      lastCommittedPoint: null,
    });
  });

  it('creates lines without arrowheads', () => {
    expect(newLinearElement('line', {}).endArrowhead).toBeNull();
  });

  it('creates text with WenKai-mapped hand font and auto resize', () => {
    const text = newTextElement({ text: 'hi', x: 0, y: 0 });
    expect(text).toMatchObject({
      type: 'text',
      text: 'hi',
      originalText: 'hi',
      fontFamily: 5,
      fontSize: 20,
      textAlign: 'left',
      verticalAlign: 'top',
      containerId: null,
      autoResize: true,
      lineHeight: 1.25,
    });
  });

  it('creates freedraw, image and frame elements with their own fields', () => {
    expect(newFreedrawElement({})).toMatchObject({
      points: [],
      pressures: [],
      simulatePressure: true,
    });
    expect(newImageElement({ fileId: 'f' })).toMatchObject({
      fileId: 'f',
      status: 'pending',
      scale: [1, 1],
      crop: null,
    });
    expect(newFrameElement({})).toMatchObject({ type: 'frame', name: null });
  });
});

describe('bumpVersion', () => {
  it('increments version, refreshes nonce and keeps unknown fields', () => {
    const el = { ...newElement('rectangle', {}), customData: { k: 1 }, futureField: 'x' };
    const next = bumpVersion(el, { x: 5 });
    expect(next).not.toBe(el);
    expect(next.version).toBe((el.version ?? 0) + 1);
    expect(next.versionNonce).not.toBe(el.versionNonce);
    expect(next.x).toBe(5);
    expect(next).toMatchObject({ customData: { k: 1 }, futureField: 'x' });
    expect(next.updated).toBeGreaterThanOrEqual(el.updated ?? 0);
  });
});
