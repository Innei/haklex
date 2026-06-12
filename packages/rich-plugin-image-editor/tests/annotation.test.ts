import type { AnnotationState, MarkerBaseState } from '@markerjs/markerjs3';
import { describe, expect, it } from 'vitest';

import { isAnnotationTool, MARKER_TYPE_BY_TOOL, offsetMarkerState } from '../src/annotation';

const baseState = (markers: MarkerBaseState[]): AnnotationState => ({
  height: 600,
  markers,
  version: 3,
  width: 800,
});

describe('MARKER_TYPE_BY_TOOL', () => {
  it('maps every annotation tool to a markerjs3 type name', () => {
    expect(MARKER_TYPE_BY_TOOL).toEqual({
      arrow: 'ArrowMarker',
      counter: 'TextMarker',
      cover: 'CoverMarker',
      ellipse: 'EllipseFrameMarker',
      pen: 'FreehandMarker',
      rect: 'FrameMarker',
      text: 'TextMarker',
    });
  });
});

describe('isAnnotationTool', () => {
  it('treats every tool except crop as an annotation tool', () => {
    expect(isAnnotationTool('crop')).toBe(false);
    expect(isAnnotationTool('arrow')).toBe(true);
    expect(isAnnotationTool('counter')).toBe(true);
  });
});

describe('offsetMarkerState', () => {
  it('translates rectangular markers via left/top', () => {
    const marker = {
      height: 40,
      left: 100,
      rotationAngle: 0,
      top: 50,
      typeName: 'FrameMarker',
      width: 60,
    } as MarkerBaseState;
    const result = offsetMarkerState(baseState([marker]), -30, -20);
    expect(result.markers[0]).toMatchObject({
      height: 40,
      left: 70,
      top: 30,
      width: 60,
    });
  });

  it('translates linear markers via x1/y1/x2/y2', () => {
    const marker = {
      typeName: 'ArrowMarker',
      x1: 10,
      x2: 110,
      y1: 20,
      y2: 220,
    } as unknown as MarkerBaseState;
    const result = offsetMarkerState(baseState([marker]), 5, -10);
    expect(result.markers[0]).toMatchObject({ x1: 15, x2: 115, y1: 10, y2: 210 });
  });

  it('translates freehand markers via nested points', () => {
    const marker = {
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 20 },
      ],
      typeName: 'FreehandMarker',
    } as unknown as MarkerBaseState;
    const result = offsetMarkerState(baseState([marker]), -3, 4);
    expect(result.markers[0]).toMatchObject({
      points: [
        { x: -3, y: 4 },
        { x: 7, y: 24 },
      ],
    });
  });

  it('allows markers to move out of bounds without deleting them', () => {
    const marker = {
      height: 10,
      left: 5,
      top: 5,
      typeName: 'FrameMarker',
      width: 10,
    } as unknown as MarkerBaseState;
    const result = offsetMarkerState(baseState([marker]), -100, -100);
    expect(result.markers).toHaveLength(1);
    expect(result.markers[0]).toMatchObject({ left: -95, top: -95 });
  });

  it('does not mutate the input state', () => {
    const marker = {
      left: 1,
      points: [{ x: 1, y: 1 }],
      top: 2,
      typeName: 'FreehandMarker',
    } as unknown as MarkerBaseState;
    const state = baseState([marker]);
    offsetMarkerState(state, 10, 10);
    expect(state.markers[0]).toMatchObject({
      left: 1,
      points: [{ x: 1, y: 1 }],
      top: 2,
    });
  });

  it('preserves annotation dimensions and untouched marker fields', () => {
    const marker = {
      left: 10,
      strokeColor: '#ef4444',
      strokeWidth: 4,
      top: 10,
      typeName: 'FrameMarker',
    } as unknown as MarkerBaseState;
    const result = offsetMarkerState(baseState([marker]), 1, 1);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(result.markers[0]).toMatchObject({ strokeColor: '#ef4444', strokeWidth: 4 });
  });
});
