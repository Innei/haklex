import { DocPage } from '../../components/doc/DocPage';
import { OverviewSection, Tile } from '../../components/doc/Overview';
import { extensionSketches } from '../../components/doc/sketches/extension-sketches';
import { extensions } from '../../site/extensions';

export function ExtensionsOverview() {
  return (
    <DocPage
      wide
      breadcrumb={['Reference', 'Extensions']}
      lead={`${extensions.length} extensions beyond the core nodes. Each tile opens its live demos.`}
      title="Extensions"
    >
      <OverviewSection count={extensions.length} title="All extensions">
        {extensions.map((e) => (
          <Tile
            code={e.packageName}
            key={e.id}
            label={e.name}
            sketch={extensionSketches[e.id]}
            to={`/extensions/${e.id}`}
          />
        ))}
      </OverviewSection>
    </DocPage>
  );
}
