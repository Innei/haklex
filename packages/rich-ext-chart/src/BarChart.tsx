import { scaleBand, scaleLinear } from '@visx/scale';
import { stack } from '@visx/shape';
import { useMemo, useState } from 'react';

import { estimateTextWidth, formatChartValue } from './format';
import type { ChartLayout } from './layout';
import {
  barPath,
  buildYAxis,
  MARGIN_RIGHT,
  MARGIN_TOP,
  rowLabel,
  rowNumber,
  seriesColor,
  seriesName,
} from './layout';
import { chartVars } from './palette.css';
import type { TooltipRow, TooltipState } from './parts';
import { ChartTooltip, XLabels, YGrid } from './parts';
import * as s from './styles.css';
import type { ChartSpec } from './types';

const BAR_MAX = 24;
const STACK_MAX = 28;
const GAP = 2;

interface Segment {
  rounded: boolean;
  series: number;
  value: number;
  y0: number;
  y1: number;
}

function buildSegments(spec: ChartSpec): Segment[][] {
  const keys = spec.series.map((x) => x.key);
  const layers = stack<Record<string, number>, string>({ keys, offset: 'diverging' })(
    spec.data.map((row) => Object.fromEntries(keys.map((k) => [k, rowNumber(row, k) ?? 0]))),
  );
  return spec.data.map((_, i) => {
    const segs = layers.map((layer, j) => ({
      series: j,
      value: rowNumber(spec.data[i], keys[j]) ?? 0,
      y0: layer[i][0],
      y1: layer[i][1],
      rounded: false,
    }));
    const top = segs.filter((g) => g.value > 0).sort((a, b) => b.y1 - a.y1)[0];
    const bottom = segs.filter((g) => g.value < 0).sort((a, b) => a.y0 - b.y0)[0];
    if (top) top.rounded = true;
    if (bottom) bottom.rounded = true;
    return segs;
  });
}

export function BarChart({ spec, layout }: { spec: ChartSpec; layout: ChartLayout }) {
  const { width: W, height: H, compact } = layout;
  const [tip, setTip] = useState<(TooltipState & { band: number }) | null>(null);

  const geo = useMemo(() => {
    const n = spec.data.length;
    const segments = spec.stacked ? buildSegments(spec) : null;
    let min = 0;
    let max = 0;
    for (const [i, row] of spec.data.entries()) {
      if (segments) {
        for (const g of segments[i]) {
          min = Math.min(min, g.y0, g.y1);
          max = Math.max(max, g.y0, g.y1);
        }
      } else {
        for (const se of spec.series) {
          const v = rowNumber(row, se.key) ?? 0;
          min = Math.min(min, v);
          max = Math.max(max, v);
        }
      }
    }
    const axis = buildYAxis(min, max, spec.format, compact, spec.y);
    const labels = spec.data.map((row) => rowLabel(row, spec.x));
    const ml = axis.width;
    const plotW = W - ml - MARGIN_RIGHT;
    const maxLabel = Math.max(...labels.map((l) => estimateTextWidth(l, 12)));
    const rotate = maxLabel > plotW / n - 8;
    const mb = rotate ? Math.min(maxLabel, 120) * 0.62 + 20 : 28;
    const x = scaleBand<number>({
      domain: [...Array.from({ length: n }).keys()],
      range: [ml, W - MARGIN_RIGHT],
    });
    const y = scaleLinear<number>({ domain: axis.domain, range: [H - mb, MARGIN_TOP] });
    const band = x.bandwidth();
    const centers = labels.map((_, i) => (x(i) ?? 0) + band / 2);
    return { axis, labels, ml, mb, rotate, x, y, band, centers, segments };
  }, [spec, W, H, compact]);

  const { axis, labels, ml, mb, rotate, y, band, centers, segments } = geo;
  const yv = (v: number) => y(v) ?? 0;
  const zero = yv(0);
  const k = spec.series.length;
  const showValues = !segments && k <= 2 && (!compact || !!spec.highlight);
  const plotBottom = H - mb;

  const rowsFor = (i: number): TooltipRow[] => {
    const order = segments ? [...spec.series.keys()].reverse() : [...spec.series.keys()];
    const out = order.map((j) => ({
      color: seriesColor(spec, j),
      value: formatChartValue(rowNumber(spec.data[i], spec.series[j].key), spec.format),
      label: seriesName(spec, j),
    }));
    if (segments && k > 1) {
      const total = segments[i].reduce((a, g) => a + g.value, 0);
      out.push({
        color: 'transparent',
        value: formatChartValue(total, spec.format),
        label: 'Total',
      });
    }
    return out;
  };

  const showTip = (i: number, anchor: number) => {
    const right = centers[i] > ml + (W - ml) / 2;
    setTip({
      x: anchor,
      y: MARGIN_TOP,
      title: labels[i],
      rows: rowsFor(i),
      side: right ? 'left' : 'right',
      band: i,
    });
  };

  return (
    <div className={s.plot}>
      <svg aria-hidden className={s.svg} viewBox={`0 0 ${W} ${H}`}>
        {tip && (
          <rect
            fill={chartVars.hoverWash}
            height={plotBottom - MARGIN_TOP}
            rx={4}
            width={band - 8}
            x={centers[tip.band] - band / 2 + 4}
            y={MARGIN_TOP}
          />
        )}
        <YGrid axis={axis} left={ml} right={W - MARGIN_RIGHT} y={yv} />
        {spec.data.map((row, i) => {
          if (segments) {
            const bw = Math.min(STACK_MAX, band * 0.56);
            const x0 = centers[i] - bw / 2;
            const total = segments[i].reduce((a, g) => a + Math.max(0, g.value), 0);
            return (
              <g key={i}>
                {segments[i].map((g) => {
                  if (g.value === 0) return null;
                  const pos = g.value > 0;
                  const base =
                    yv(pos ? g.y0 : g.y1) +
                    (g.y0 === 0 || g.y1 === 0 ? 0 : pos ? -GAP / 2 : GAP / 2);
                  const end = yv(pos ? g.y1 : g.y0) + (g.rounded ? 0 : pos ? GAP / 2 : -GAP / 2);
                  return (
                    <path
                      d={barPath(x0, bw, base, end, g.rounded ? 4 : 0)}
                      fill={seriesColor(spec, g.series)}
                      key={g.series}
                    />
                  );
                })}
                {!compact && total > 0 && (
                  <text
                    className={s.valueLabel}
                    textAnchor="middle"
                    x={centers[i]}
                    y={yv(total) - 7}
                  >
                    {formatChartValue(total, spec.format)}
                  </text>
                )}
              </g>
            );
          }
          const bw = Math.min(BAR_MAX, (band * 0.72 - (k - 1) * GAP) / k);
          const gw = k * bw + (k - 1) * GAP;
          return (
            <g key={i}>
              {spec.series.map((se, j) => {
                const v = rowNumber(row, se.key);
                if (v == null) return null;
                const x0 = centers[i] - gw / 2 + j * (bw + GAP);
                const end = yv(v);
                const strong = spec.highlight === se.key;
                return (
                  <g key={se.key}>
                    <path d={barPath(x0, bw, zero, end, 4)} fill={seriesColor(spec, j)} />
                    {showValues && (!spec.highlight || strong) && (
                      <text
                        className={strong ? s.valueLabelStrong : s.valueLabel}
                        textAnchor="middle"
                        x={x0 + bw / 2}
                        y={v >= 0 ? end - 6 : end + 14}
                      >
                        {formatChartValue(v, spec.format)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        <XLabels centers={centers} labels={labels} rotate={rotate} y={H - mb + 18} />
        {centers.map((c, i) => (
          <rect
            fill="transparent"
            height={plotBottom - MARGIN_TOP}
            key={i}
            width={band}
            x={c - band / 2}
            y={MARGIN_TOP}
            onPointerEnter={() => showTip(i, c + (c > ml + (W - ml) / 2 ? -band / 4 : band / 4))}
            onPointerLeave={() => setTip(null)}
          />
        ))}
      </svg>
      {tip && <ChartTooltip height={H} state={tip} width={W} />}
    </div>
  );
}
