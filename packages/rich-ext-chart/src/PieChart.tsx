import { vars } from '@haklex/rich-style-token';
import { arc, pie } from '@visx/shape';
import { useState } from 'react';

import { estimateTextWidth, formatChartValue } from './format';
import type { ChartLayout } from './layout';
import { rowLabel, rowNumber } from './layout';
import { chartVars, seriesColors } from './palette.css';
import * as s from './styles.css';
import type { ChartSpec } from './types';

const ROW_H = 28;

export function pieHeight(spec: ChartSpec, layout: ChartLayout): number {
  if (!layout.compact) return 260;
  return 200 + 16 + spec.data.length * ROW_H;
}

export function PieChart({ spec, layout }: { spec: ChartSpec; layout: ChartLayout }) {
  const { width: W, compact } = layout;
  const H = pieHeight(spec, layout);
  const [hover, setHover] = useState<number | null>(null);
  const key = spec.series[0].key;
  const rows = spec.data.map((row, i) => ({
    i,
    label: rowLabel(row, spec.x),
    value: Math.max(0, rowNumber(row, key) ?? 0),
  }));
  const total = rows.reduce((a, r) => a + r.value, 0);
  const r = compact ? 96 : H / 2 - 10;
  const cx = compact ? W / 2 : r + 10;
  const cy = compact ? r + 4 : H / 2;
  const inner = spec.donut ? r * 0.62 : 0;
  const arcs = pie<(typeof rows)[number]>({ value: (d) => d.value, sort: null, sortValues: null })(
    rows,
  );
  const arcPath = arc<(typeof arcs)[number]>({ innerRadius: inner, outerRadius: r });

  const colorOf = (i: number) =>
    spec.highlight && spec.highlight !== rows[i].label
      ? chartVars.muted
      : seriesColors[i % seriesColors.length];
  const pct = (v: number) => (total ? `${Math.round((v / total) * 100)}%` : '—');

  const labelW = Math.max(...rows.map((row) => estimateTextWidth(row.label, 13)));
  const lx = compact ? 8 : cx + r + 56;
  const valueX = compact ? W - 52 : lx + 18 + labelW + 80;
  const pctX = compact ? W - 4 : valueX + 44;
  const ly0 = compact ? cy + r + 30 : cy - (rows.length * ROW_H) / 2 + ROW_H / 2;
  const centerValue = hover == null ? total : rows[hover].value;
  const centerLabel = hover == null ? 'Total' : `${rows[hover].label} · ${pct(rows[hover].value)}`;

  return (
    <div className={s.plot}>
      <svg aria-hidden className={s.svg} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(${cx} ${cy})`}>
          {arcs.map((a) => (
            <path
              d={arcPath(a) ?? ''}
              fill={colorOf(a.index)}
              key={a.index}
              stroke={vars.color.bg}
              strokeLinejoin="round"
              strokeWidth={2}
              style={{ opacity: hover == null || hover === a.index ? 1 : 0.3 }}
              onPointerEnter={() => setHover(a.index)}
              onPointerLeave={() => setHover(null)}
            />
          ))}
          {inner > 0 && (
            <>
              <text fill={vars.color.text} fontSize={22} fontWeight={600} textAnchor="middle" y={2}>
                {formatChartValue(centerValue, spec.format)}
              </text>
              <text className={s.tick} textAnchor="middle" y={22}>
                {centerLabel}
              </text>
            </>
          )}
        </g>
        {rows.map((row, i) => {
          const y = ly0 + i * ROW_H;
          return (
            <g
              key={i}
              style={{ opacity: hover == null || hover === i ? 1 : 0.4 }}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
            >
              <rect fill="transparent" height={ROW_H} width={pctX - lx} x={lx} y={y - ROW_H / 2} />
              <rect fill={colorOf(i)} height={10} rx={2} width={10} x={lx} y={y - 5} />
              <text fill={vars.color.textSecondary} fontSize={13} x={lx + 18} y={y + 4}>
                {row.label}
              </text>
              <text
                fill={vars.color.text}
                fontSize={13}
                fontWeight={600}
                textAnchor="end"
                x={valueX}
                y={y + 4}
              >
                {formatChartValue(row.value, spec.format)}
              </text>
              <text className={s.tick} textAnchor="end" x={pctX} y={y + 4}>
                {pct(row.value)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
