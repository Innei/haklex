import { getStroke } from 'perfect-freehand';

import type { FreedrawElement } from './types';

const average = (a: number, b: number) => (a + b) / 2;

function outlineToPath(points: number[][]): string {
  const len = points.length;
  if (len < 4) return '';
  let a = points[0];
  let b = points[1];
  const c = points[2];
  let d = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;
  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    d += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
  }
  return `${d}Z`;
}

export function freedrawOutline(el: FreedrawElement): string {
  const pressures = el.pressures ?? [];
  const simulate = el.simulatePressure ?? pressures.length === 0;
  const input = el.points.map(([x, y], i) => [x, y, simulate ? 0.5 : (pressures[i] ?? 0.5)]);
  const outline = getStroke(input, {
    simulatePressure: simulate,
    size: el.strokeWidth * 4.25,
    thinning: 0.6,
    smoothing: 0.5,
    streamline: 0.5,
    easing: (t) => Math.sin((t * Math.PI) / 2),
    last: true,
  });
  return outlineToPath(outline);
}
