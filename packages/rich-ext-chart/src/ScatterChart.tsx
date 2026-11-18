import { vars } from '@haklex/rich-style-token';
import { scaleLinear } from '@visx/scale';
import { useMemo, useState } from 'react';

import { formatChartValue, formatTick } from './format';
import type { ChartLayout } from './layout';
import { buildYAxis, MARGIN_RIGHT, MARGIN_TOP, rowNumber, seriesColor, seriesName } from './layout';
import type { TooltipState } from './parts';
import { ChartTooltip, XLabels, YGrid } from './parts';
import { type PointEvents, pointOf, pointTarget } from './points';
import * as s from './styles.css';
import type { ChartSpec } from './types';

export function ScatterChart({
  spec,
  layout,
  events = {},
}: {
  events?: PointEvents;
  layout: ChartLayout;
  spec: ChartSpec;
}) {
  const { width: W, height: H, compact } = layout;
  const [hover, setHover] = useState<{ i: number; j: number } | null>(null);

  const geo = useMemo(() => {
    const xs = spec.data.map((row) => rowNumber(row, spec.x)).filter((v): v is number => v != null);
    let min = 0;
    let max = 0;
    for (const row of spec.data)
      for (const se of spec.series) {
        const v = rowNumber(row, se.key);
        if (v == null) continue;
        min = Math.min(min, v);
        max = Math.max(max, v);
      }
    const axis = buildYAxis(min, max, spec.format, compact, spec.y);
    const ml = axis.width;
    const mb = 28;
    const lo = Math.min(...xs, 0);
    const hi = Math.max(...xs, lo + 1);
    const x = scaleLinear<number>({
      domain: [lo, hi],
      range: [ml + 8, W - MARGIN_RIGHT - 8],
      nice: compact ? 3 : 5,
    });
    const y = scaleLinear<number>({ domain: axis.domain, range: [H - mb, MARGIN_TOP] });
    const ticks = x.ticks(compact ? 3 : 5);
    return { axis, ml, mb, x, y, ticks };
  }, [spec, W, H, compact]);

  const { axis, ml, mb, x, y, ticks } = geo;
  const yv = (v: number) => y(v) ?? 0;
  const xv = (v: number) => x(v) ?? 0;

  let tip: TooltipState | null = null;
  if (hover) {
    const row = spec.data[hover.i];
    const px = rowNumber(row, spec.x) ?? 0;
    tip = {
      x: xv(px),
      y: yv(rowNumber(row, spec.series[hover.j].key) ?? 0),
      title: `${spec.xLabel || spec.x} ${formatChartValue(px, { ...spec.format, unit: undefined })}`,
      rows: [
        {
          color: seriesColor(spec, hover.j),
          label: seriesName(spec, hover.j),
          value: formatChartValue(rowNumber(row, spec.series[hover.j].key), spec.format),
        },
      ],
      side: xv(px) > ml + (W - ml) / 2 ? 'left' : 'right',
    };
  }

  return (
    <div className={s.plot}>
      <svg aria-hidden className={s.svg} viewBox={`0 0 ${W} ${H}`}>
        <YGrid axis={axis} left={ml} right={W - MARGIN_RIGHT} y={yv} />
        <XLabels
          centers={ticks.map(xv)}
          labels={ticks.map((t, i) => formatTick(t, undefined, i === ticks.length - 1))}
          rotate={false}
          y={H - mb + 18}
        />
        {spec.series.map((se, j) =>
          spec.data.map((row, i) => {
            const px = rowNumber(row, spec.x);
            const py = rowNumber(row, se.key);
            if (px == null || py == null) return null;
            const on = hover?.i === i && hover.j === j;
            return (
              <circle
                cx={xv(px)}
                cy={yv(py)}
                fill={seriesColor(spec, j)}
                fillOpacity={on ? 1 : 0.75}
                key={`${se.key}-${i}`}
                r={on ? 6 : 4.5}
                stroke={vars.color.bg}
                strokeWidth={1.5}
                {...pointTarget(events, pointOf(spec, j, i), {
                  enter: () => setHover({ i, j }),
                  leave: () => setHover(null),
                })}
              />
            );
          }),
        )}
      </svg>
      {tip && <ChartTooltip height={H} state={tip} width={W} />}
    </div>
  );
}
