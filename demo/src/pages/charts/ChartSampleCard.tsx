import { ChartRenderer } from '@haklex/rich-ext-chart';
import { useState } from 'react';

import type { ChartSample } from '../../fixtures/chart-samples';

function toLiteXml(value: unknown) {
  const body = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return `<chart><![CDATA[\n${body}\n]]></chart>`;
}

export function ChartSampleCard({ sample }: { sample: ChartSample }) {
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
