import type { ChartPoint, ChartSpec } from './types';

export interface PointEvents {
  onPointClick?: (point: ChartPoint) => void;
  onPointHover?: (point: ChartPoint | null) => void;
}

export function pointOf(spec: ChartSpec, series: number, index: number): ChartPoint {
  const key = spec.series[series].key;
  const row = spec.data[index];
  const value = row[key];
  return {
    series: key,
    x: row[spec.x] ?? null,
    value: typeof value === 'number' ? value : null,
    index,
  };
}

export function pointTarget(
  events: PointEvents,
  point: ChartPoint,
  hover?: { enter: () => void; leave: () => void },
) {
  return {
    'data-point': `${point.series}:${point.index}`,
    'style': events.onPointClick ? { cursor: 'pointer' } : undefined,
    'onClick': () => events.onPointClick?.(point),
    'onPointerEnter': () => {
      hover?.enter();
      events.onPointHover?.(point);
    },
    'onPointerLeave': () => {
      hover?.leave();
      events.onPointHover?.(null);
    },
  };
}
