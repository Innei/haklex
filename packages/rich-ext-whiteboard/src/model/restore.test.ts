import { describe, expect, it } from 'vitest';

import type { ExcalidrawElement } from '../scene/types';
import { normalizeElement } from './restore';

const legacy = (extra: Record<string, unknown>) =>
  ({
    id: 'x',
    type: 'rectangle',
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    ...extra,
  }) as unknown as ExcalidrawElement;

describe('normalizeElement on legacy data', () => {
  it('keeps a shape without roundness sharp', () => {
    expect(normalizeElement(legacy({})).roundness).toBeNull();
    expect(
      normalizeElement(
        legacy({
          type: 'arrow',
          points: [
            [0, 0],
            [10, 0],
          ],
        }),
      ).roundness,
    ).toBeNull();
  });

  it('maps the old strokeSharpness flag', () => {
    expect(normalizeElement(legacy({ strokeSharpness: 'round' })).roundness).toEqual({ type: 3 });
    expect(
      normalizeElement(legacy({ type: 'ellipse', strokeSharpness: 'round' })).roundness,
    ).toEqual({
      type: 2,
    });
    expect(normalizeElement(legacy({ strokeSharpness: 'sharp' })).roundness).toBeNull();
  });

  it('keeps an explicit roundness', () => {
    expect(normalizeElement(legacy({ roundness: { type: 2 } })).roundness).toEqual({ type: 2 });
  });
});
