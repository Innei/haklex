import type { ChartSampleGroup } from '../fixtures/chart-samples';
import { chartSamples } from '../fixtures/chart-samples';

export interface ChartKind {
  key: ChartSampleGroup;
  label: string;
}

export const chartKinds: ChartKind[] = [
  { key: 'bar', label: 'Bar' },
  { key: 'line', label: 'Line' },
  { key: 'area', label: 'Area' },
  { key: 'pie', label: 'Pie' },
  { key: 'state', label: 'States' },
];

export function chartSamplesOf(kind: ChartSampleGroup) {
  return chartSamples.filter((s) => s.group === kind);
}
