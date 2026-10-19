import { ChartRenderer } from '@haklex/rich-ext-chart';
import { useState } from 'react';

import type { ChartSample, ChartSampleGroup } from '../fixtures/chart-samples';
import { chartSamples } from '../fixtures/chart-samples';

type Filter = 'all' | ChartSampleGroup;

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'bar', label: 'Bar' },
  { key: 'line', label: 'Line' },
  { key: 'area', label: 'Area' },
  { key: 'pie', label: 'Pie' },
  { key: 'state', label: 'States' },
];

function toLiteXml(value: unknown) {
  const body = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return `<chart><![CDATA[\n${body}\n]]></chart>`;
}

function ChartSampleCard({ sample }: { sample: ChartSample }) {
  const [showSource, setShowSource] = useState(false);
  const chart = <ChartRenderer defaultView={sample.defaultView} value={sample.value} />;

  return (
    <section className="chart-sample">
      <div className="chart-sample-head">
        <div>
          <h2 className="chart-sample-title">{sample.label}</h2>
          <p className="chart-sample-desc">{sample.description}</p>
        </div>
        <button
          className={showSource ? 'btn btn-sm btn-active' : 'btn btn-sm'}
          onClick={() => setShowSource((v) => !v)}
        >
          LiteXML
        </button>
      </div>
      {showSource && <pre className="chart-sample-source">{toLiteXml(sample.value)}</pre>}
      <div className="chart-sample-body">
        {sample.frame === 'narrow' && <div className="chart-sample-narrow">{chart}</div>}
        {sample.frame === 'dark' && (
          <div className="chart-sample-dark" data-theme="dark">
            {chart}
          </div>
        )}
        {!sample.frame && <div className="chart-sample-article">{chart}</div>}
      </div>
    </section>
  );
}

export function ChartsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const visible = filter === 'all' ? chartSamples : chartSamples.filter((s) => s.group === filter);

  return (
    <div className="page">
      <div className="nodes-page-header">
        <h1 className="nodes-page-title">Charts</h1>
        <p className="nodes-page-desc">
          @haklex/rich-ext-chart — static SVG from ChartSpec v1. Hover marks for tooltips; toggle
          the theme in the header to check dark mode.
        </p>
      </div>

      <div className="nodes-filter-bar">
        {filters.map((f) => (
          <button
            key={f.key}
            className={
              filter === f.key ? 'nodes-filter-pill nodes-filter-pill-active' : 'nodes-filter-pill'
            }
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="nodes-filter-count">
              {f.key === 'all'
                ? chartSamples.length
                : chartSamples.filter((s) => s.group === f.key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="chart-sample-list">
        {visible.map((sample) => (
          <ChartSampleCard key={sample.key} sample={sample} />
        ))}
      </div>
    </div>
  );
}
