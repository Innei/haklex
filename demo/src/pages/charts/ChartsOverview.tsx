import { DocPage } from '../../components/doc/DocPage';
import { OverviewSection, Tile } from '../../components/doc/Overview';
import { chartSketches } from '../../components/doc/sketches/chart-sketches';
import { chartSamples } from '../../fixtures/chart-samples';
import { chartKinds, chartSamplesOf } from '../../site/charts';
import { slugify } from '../../site/slugify';

export function ChartsOverview() {
  return (
    <DocPage
      wide
      breadcrumb={['Reference', 'Charts']}
      lead={`${chartSamples.length} chart samples in ${chartKinds.length} groups, rendered by @haklex/rich-ext-chart.`}
      title="Charts"
    >
      {chartKinds.map((kind) => {
        const samples = chartSamplesOf(kind.key);
        return (
          <OverviewSection count={samples.length} key={kind.key} title={kind.label}>
            {samples.map((s) => (
              <Tile
                key={s.key}
                label={s.label}
                sketch={chartSketches[kind.key]}
                to={`/charts/${kind.key}#${slugify(s.label)}`}
              />
            ))}
          </OverviewSection>
        );
      })}
    </DocPage>
  );
}
