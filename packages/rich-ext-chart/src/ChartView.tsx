import { useMemo, useState } from 'react';

import { BarChart } from './BarChart';
import { ChartErrorCard } from './ChartErrorCard';
import { formatChartValue } from './format';
import type { ChartLayout } from './layout';
import {
  COMPACT_LAYOUT,
  describeChart,
  rowLabel,
  rowNumber,
  seriesColor,
  seriesName,
  WIDE_LAYOUT,
} from './layout';
import { LineChart } from './LineChart';
import { PieChart, pieHeight } from './PieChart';
import * as s from './styles.css';
import type { ChartSpec } from './types';
import { parseChartSource, validateChartSpec } from './validate';

export type ChartViewMode = 'chart' | 'table';

export interface ChartViewProps {
  defaultView?: ChartViewMode;
  hideToggle?: boolean;
  spec: ChartSpec;
}

function ChartBody({ spec, layout }: { spec: ChartSpec; layout: ChartLayout }) {
  if (spec.type === 'bar') return <BarChart layout={layout} spec={spec} />;
  if (spec.type === 'pie')
    return <PieChart layout={{ ...layout, height: pieHeight(spec, layout) }} spec={spec} />;
  return <LineChart layout={layout} spec={spec} />;
}

function ChartKey({ spec, compact }: { spec: ChartSpec; compact: boolean }) {
  if (spec.type === 'pie' || spec.series.length < 2) return null;
  const visible = spec.type === 'bar' || spec.stacked || compact || spec.series.length > 3;
  if (!visible) return null;
  const asLine = spec.type === 'line';
  return (
    <div className={s.key}>
      {spec.series.map((se, j) => (
        <span className={s.keyItem} key={se.key}>
          <i
            className={asLine ? s.keyLine : s.keySwatch}
            style={{ background: seriesColor(spec, j) }}
          />
          {seriesName(spec, j)}
        </span>
      ))}
    </div>
  );
}

function ChartTable({ spec }: { spec: ChartSpec }) {
  const format = { ...spec.format, compact: false };
  return (
    <table className={s.table}>
      <thead>
        <tr>
          <th scope="col">{spec.xLabel || spec.x}</th>
          {spec.series.map((se, j) => (
            <th key={se.key} scope="col">
              {seriesName(spec, j)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {spec.data.map((row, i) => (
          <tr key={i}>
            <td>{rowLabel(row, spec.x)}</td>
            {spec.series.map((se) => (
              <td key={se.key}>{formatChartValue(rowNumber(row, se.key), format)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const TableIcon = (
  <svg
    fill="none"
    height={14}
    stroke="currentColor"
    strokeWidth={1.4}
    viewBox="0 0 16 16"
    width={14}
  >
    <rect height={10} rx={1.5} width={12} x={2} y={3} />
    <path d="M2 6.5h12M6.5 6.5V13" />
  </svg>
);

const ChartIcon = (
  <svg
    fill="none"
    height={14}
    stroke="currentColor"
    strokeLinecap="round"
    strokeWidth={1.4}
    viewBox="0 0 16 16"
    width={14}
  >
    <path d="M3 13V8M6.5 13V4M10 13V9.5M13.5 13V6" />
  </svg>
);

export function ChartView({ spec, defaultView = 'chart', hideToggle }: ChartViewProps) {
  const [view, setView] = useState<ChartViewMode>(defaultView);
  const isEmpty = spec.data.length === 0;
  const showTable = view === 'table' && !isEmpty;

  return (
    <figure className={s.root}>
      <div className={s.head}>
        <div>
          {spec.title && <div className={s.title}>{spec.title}</div>}
          {spec.subtitle && <div className={s.subtitle}>{spec.subtitle}</div>}
        </div>
        {!hideToggle && !isEmpty && (
          <button
            aria-pressed={showTable}
            className={s.toggle}
            type="button"
            onClick={() => setView(showTable ? 'chart' : 'table')}
          >
            {showTable ? ChartIcon : TableIcon}
            {showTable ? 'View chart' : 'View data'}
          </button>
        )}
      </div>
      {isEmpty ? (
        <div className={s.empty}>
          <div className={s.emptyLines}>
            {[0, 1, 2, 3].map((i) => (
              <div className={s.emptyLine} key={i} />
            ))}
          </div>
          <div className={s.emptyMessage}>
            No data yet
            <code className={s.emptyHint}>data: []</code>
          </div>
        </div>
      ) : showTable ? (
        <ChartTable spec={spec} />
      ) : (
        <div aria-label={describeChart(spec)} role="img">
          <div className={s.wide}>
            <ChartKey compact={false} spec={spec} />
            <ChartBody layout={WIDE_LAYOUT} spec={spec} />
          </div>
          <div className={s.compact}>
            <ChartKey compact spec={spec} />
            <ChartBody layout={COMPACT_LAYOUT} spec={spec} />
          </div>
        </div>
      )}
      {(spec.note || spec.source) && (
        <figcaption className={s.caption}>
          {spec.note}
          {spec.note && spec.source && ' · '}
          {spec.source && (
            <>
              <span className={s.captionSource}>Source </span>
              {spec.source}
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}

export interface ChartRendererProps extends Omit<ChartViewProps, 'spec'> {
  value: unknown;
}

function readRawFields(value: unknown): Record<string, unknown> {
  let raw = value;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return typeof raw === 'object' && raw ? (raw as Record<string, unknown>) : {};
}

export function ChartRenderer({ value, ...rest }: ChartRendererProps) {
  const result = useMemo(
    () => (typeof value === 'string' ? parseChartSource(value) : validateChartSpec(value)),
    [value],
  );
  if (!result.ok) {
    const raw = readRawFields(value);
    return (
      <ChartErrorCard
        issues={result.issues}
        rows={Array.isArray(raw.data) ? raw.data.length : undefined}
        title={typeof raw.title === 'string' ? raw.title : undefined}
        type={typeof raw.type === 'string' ? raw.type : undefined}
      />
    );
  }
  return <ChartView spec={result.spec} {...rest} />;
}
