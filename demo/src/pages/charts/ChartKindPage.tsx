import { Navigate, useParams } from 'react-router-dom';

import { DocPage } from '../../components/doc/DocPage';
import { chartKinds, chartSamplesOf } from '../../site/charts';
import { ChartSampleCard } from './ChartSampleCard';

export function ChartKindPage() {
  const { kind } = useParams();
  const meta = chartKinds.find((k) => k.key === kind);
  if (!meta) return <Navigate replace to="/charts" />;
  const samples = chartSamplesOf(meta.key);

  return (
    <DocPage
      breadcrumb={['Reference', 'Charts']}
      lead={`${samples.length} samples rendered as static SVG from ChartSpec v1. Hover a mark for its tooltip.`}
      meta={<span className="badge">@haklex/rich-ext-chart</span>}
      title={meta.label}
    >
      <div className="chart-sample-list">
        {samples.map((sample) => (
          <ChartSampleCard key={sample.key} sample={sample} />
        ))}
      </div>
    </DocPage>
  );
}
