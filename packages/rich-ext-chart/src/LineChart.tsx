import { vars } from '@haklex/rich-style-token';
import { scaleLinear } from '@visx/scale';
import { area, line } from '@visx/shape';
import { useMemo, useState } from 'react';

import { estimateTextWidth, formatChartValue } from './format';
import type { ChartLayout } from './layout';
import { buildYAxis, MARGIN_TOP, rowLabel, rowNumber, seriesColor, seriesName } from './layout';
import { chartVars } from './palette.css';
import type { TooltipState } from './parts';
import { ChartTooltip, svgPoint, XLabels, YGrid } from './parts';
import * as s from './styles.css';
import type { ChartSpec } from './types';

interface Point {
  hi: number;
  i: number;
  lo: number;
  value: number | null;
}

const END_LABEL_GAP = 16;

export function LineChart({ spec, layout }: { spec: ChartSpec; layout: ChartLayout }) {
  const { width: W, height: H, compact } = layout;
  const [hover, setHover] = useState<number | null>(null);
  const isArea = spec.type === 'area';
  const stacked = isArea && !!spec.stacked;

  const geo = useMemo(() => {
    const n = spec.data.length;
    const acc = spec.data.map(() => 0);
    const layers: Point[][] = spec.series.map((se) =>
      spec.data.map((row, i) => {
        const value = rowNumber(row, se.key);
        const v = value ?? 0;
        const lo = stacked ? acc[i] : 0;
        const hi = stacked ? (acc[i] += v) : v;
        return { i, value, lo, hi };
      }),
    );
    let min = 0;
    let max = 0;
    for (const L of layers) {
      for (const p of L) {
        if (p.value == null) continue;
        min = Math.min(min, p.lo, p.hi);
        max = Math.max(max, p.hi);
      }
    }
    for (const r of spec.refs ?? []) max = Math.max(max, r.y);
    const axis = buildYAxis(min, max, spec.format, compact, spec.y);
    const direct = !compact && spec.series.length <= 3;
    const last = n - 1;
    const mr = direct
      ? Math.max(
          ...spec.series.map(
            (_, j) =>
              estimateTextWidth(seriesName(spec, j), 12) +
              estimateTextWidth(formatChartValue(layers[j][last]?.value, spec.format), 12),
          ),
        ) + 24
      : 8;
    const ml = axis.width;
    const mb = 28;
    const plotW = W - ml - mr;
    const x = (i: number) => ml + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1));
    const y = scaleLinear<number>({ domain: axis.domain, range: [H - mb, MARGIN_TOP] });
    return { n, layers, axis, direct, ml, mb, plotW, x, y };
  }, [spec, W, H, compact, stacked]);

  const { n, layers, axis, direct, ml, mb, plotW, x, y } = geo;
  const yv = (v: number) => y(v) ?? 0;
  const labels = spec.data.map((row) => rowLabel(row, spec.x));
  const order = [...spec.series.keys()].sort(
    (a, b) =>
      Number(spec.series[a].key === spec.highlight) - Number(spec.series[b].key === spec.highlight),
  );
  const defined = (p: Point) => p.value != null;
  const linePath = line<Point>({ x: (p) => x(p.i), y: (p) => yv(p.hi), defined });
  const areaPath = area<Point>({
    x: (p) => x(p.i),
    y0: (p) => yv(p.lo),
    y1: (p) => yv(p.hi),
    defined,
  });

  const ends = direct
    ? order
        .map((j) => ({ j, y: yv(layers[j][n - 1].hi) }))
        .filter(({ j }) => layers[j][n - 1].value != null)
        .sort((a, b) => a.y - b.y)
    : [];
  for (let i = 1; i < ends.length; i++) {
    if (ends[i].y - ends[i - 1].y < END_LABEL_GAP) ends[i].y = ends[i - 1].y + END_LABEL_GAP;
  }

  let tip: TooltipState | null = null;
  if (hover != null) {
    const js = stacked
      ? [...spec.series.keys()].reverse()
      : [...spec.series.keys()].sort(
          (a, b) => (layers[b][hover].value ?? -Infinity) - (layers[a][hover].value ?? -Infinity),
        );
    const rows = js.map((j) => ({
      color: seriesColor(spec, j),
      value: formatChartValue(layers[j][hover].value, spec.format),
      label: seriesName(spec, j),
    }));
    if (stacked && spec.series.length > 1) {
      rows.push({
        color: 'transparent',
        value: formatChartValue(layers.at(-1)![hover].hi, spec.format),
        label: 'Total',
      });
    }
    tip = {
      x: x(hover),
      y: MARGIN_TOP,
      title: labels[hover],
      rows,
      side: x(hover) > ml + plotW / 2 ? 'left' : 'right',
    };
  }

  return (
    <div className={s.plot}>
      <svg aria-hidden className={s.svg} viewBox={`0 0 ${W} ${H}`}>
        <YGrid axis={axis} left={ml} right={ml + plotW} y={yv} />
        {spec.refs?.map((r) => (
          <g key={`${r.label}-${r.y}`}>
            <line
              shapeRendering="crispEdges"
              stroke={chartVars.reference}
              strokeDasharray="4 3"
              x1={ml}
              x2={ml + plotW}
              y1={yv(r.y)}
              y2={yv(r.y)}
            />
            <text className={s.tick} x={ml + 4} y={yv(r.y) - 6}>
              {`${r.label} ${formatChartValue(r.y, spec.format)}`}
            </text>
          </g>
        ))}
        {isArea &&
          (stacked ? [...order].reverse() : order).map((j) => (
            <path
              d={areaPath(layers[j]) ?? ''}
              fill={seriesColor(spec, j)}
              key={`a-${j}`}
              style={{ fillOpacity: stacked ? chartVars.areaOpacity : 0.1 }}
            />
          ))}
        {order.map((j) => (
          <g key={`l-${j}`}>
            {stacked && j > 0 && (
              <path
                d={linePath(layers[j]) ?? ''}
                fill="none"
                stroke={vars.color.bg}
                strokeWidth={4}
              />
            )}
            <path
              d={linePath(layers[j]) ?? ''}
              fill="none"
              stroke={seriesColor(spec, j)}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </g>
        ))}
        {ends.map(({ j, y: ly }) => {
          const muted = !!spec.highlight && spec.series[j].key !== spec.highlight;
          return (
            <g key={`e-${j}`}>
              <circle
                cx={x(n - 1)}
                cy={yv(layers[j][n - 1].hi)}
                fill={seriesColor(spec, j)}
                r={4}
                stroke={vars.color.bg}
                strokeWidth={2}
              />
              <text className={s.endLabel} x={x(n - 1) + 10} y={ly + 4}>
                <tspan
                  fill={muted ? vars.color.textTertiary : vars.color.text}
                  fontWeight={muted ? 400 : 600}
                >
                  {formatChartValue(layers[j][n - 1].value, spec.format)}
                </tspan>
                <tspan dx={5} fill={vars.color.textTertiary}>
                  {seriesName(spec, j)}
                </tspan>
              </text>
            </g>
          );
        })}
        <XLabels
          centers={labels.map((_, i) => x(i))}
          labels={labels}
          rotate={false}
          y={H - mb + 18}
        />
        {hover != null && (
          <g>
            <line
              shapeRendering="crispEdges"
              stroke={chartVars.crosshair}
              x1={x(hover)}
              x2={x(hover)}
              y1={MARGIN_TOP}
              y2={H - mb}
            />
            {spec.series.map((se, j) =>
              layers[j][hover].value == null ? null : (
                <circle
                  cx={x(hover)}
                  cy={yv(layers[j][hover].hi)}
                  fill={seriesColor(spec, j)}
                  key={se.key}
                  r={4}
                  stroke={vars.color.bg}
                  strokeWidth={2}
                />
              ),
            )}
          </g>
        )}
        <rect
          fill="transparent"
          height={H - mb - MARGIN_TOP}
          width={plotW}
          x={ml}
          y={MARGIN_TOP}
          onPointerLeave={() => setHover(null)}
          onPointerMove={(e) => {
            const px = svgPoint(e, W);
            const idx = n === 1 ? 0 : Math.round(((px - ml) / plotW) * (n - 1));
            setHover(Math.max(0, Math.min(n - 1, idx)));
          }}
        />
      </svg>
      {tip && <ChartTooltip height={H} state={tip} width={W} />}
    </div>
  );
}
