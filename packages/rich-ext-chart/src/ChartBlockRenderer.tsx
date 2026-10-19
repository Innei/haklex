import { ChartRenderer } from './ChartView';
import type { ChartSlotProps } from './slot';

export function ChartBlockRenderer({ spec }: ChartSlotProps) {
  return <ChartRenderer value={spec} />;
}
