import type { PointerEvent } from 'react';

import { estimateTextWidth } from './format';
import type { YAxis } from './layout';
import * as s from './styles.css';

export interface TooltipRow {
  color: string;
  label: string;
  value: string;
}

export interface TooltipState {
  rows: TooltipRow[];
  side: 'left' | 'right';
  title: string;
  x: number;
  y: number;
}

export function ChartTooltip({
  state,
  width,
  height,
}: {
  state: TooltipState;
  width: number;
  height: number;
}) {
  const left = `${(state.x / width) * 100}%`;
  const top = `${(state.y / height) * 100}%`;
  const transform = state.side === 'left' ? 'translateX(calc(-100% - 14px))' : 'translateX(14px)';
  return (
    <div aria-hidden className={s.tooltip} style={{ left, top, transform }}>
      {state.title && <div className={s.tooltipTitle}>{state.title}</div>}
      {state.rows.map((row) => (
        <div className={s.tooltipRow} key={row.label}>
          <i className={s.tooltipKey} style={{ background: row.color }} />
          <span className={s.tooltipValue}>{row.value}</span>
          <span className={s.tooltipLabel}>{row.label}</span>
        </div>
      ))}
    </div>
  );
}

export function YGrid({
  axis,
  y,
  left,
  right,
}: {
  axis: YAxis;
  y: (v: number) => number;
  left: number;
  right: number;
}) {
  return (
    <g>
      {axis.ticks.map((t, i) => (
        <g key={t}>
          <line
            className={t === 0 ? s.baseLine : s.gridLine}
            x1={left}
            x2={right}
            y1={y(t)}
            y2={y(t)}
          />
          <text className={s.tick} textAnchor="end" x={left - 8} y={y(t) + 4}>
            {axis.labels[i]}
          </text>
        </g>
      ))}
    </g>
  );
}

export function XLabels({
  labels,
  centers,
  y,
  rotate,
}: {
  labels: string[];
  centers: number[];
  y: number;
  rotate: boolean;
}) {
  let lastRight = -Infinity;
  return (
    <g>
      {labels.map((label, i) => {
        if (rotate) {
          return (
            <text
              className={s.xLabel}
              key={i}
              textAnchor="end"
              transform={`rotate(-38 ${centers[i]} ${y - 4})`}
              x={centers[i]}
              y={y}
            >
              {label}
            </text>
          );
        }
        const half = estimateTextWidth(label, 12) / 2;
        if (centers[i] - half < lastRight + 14) return null;
        lastRight = centers[i] + half;
        return (
          <text className={s.xLabel} key={i} textAnchor="middle" x={centers[i]} y={y}>
            {label}
          </text>
        );
      })}
    </g>
  );
}

export function svgPoint(event: PointerEvent<SVGElement>, width: number) {
  const svgEl = event.currentTarget.ownerSVGElement ?? (event.currentTarget as SVGSVGElement);
  const rect = svgEl.getBoundingClientRect();
  return ((event.clientX - rect.left) * width) / rect.width;
}
